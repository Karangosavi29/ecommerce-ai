import mongoose from "mongoose";
import orderRepository from "../repositories/order.repository.js";
import cartRepository from "../repositories/cart.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { addOrderConfirmationJob } from "../queues/email.queue.js";
import { ORDER_STATUS_TRANSITIONS, CANCELLABLE_STATUSES } from "../constants/orderStatus.js";

const buildWhatsAppMessage = (order) => {
    const itemLines = order.items
        .map((item) => `• ${item.name} x${item.quantity} = ₹${item.price * item.quantity}`)
        .join("\n");
    const addr = order.shippingAddress;
    return `Hi, I want to place an order! 🛍️

*Items:*
${itemLines}

*Total: ₹${order.totalAmount}*

*Delivery Address:*
${addr.fullName}
${addr.addressLine1}${addr.addressLine2 ? ", " + addr.addressLine2 : ""}
${addr.city}, ${addr.state} - ${addr.pincode}
📞 ${addr.phone}

*Order ID: ${order._id}*`;
};

// Atomically decrement stock for every item in a transaction.
// Throws ApiError(409) naming the first item that fails, and the transaction
// rolls back all prior decrements in this same call automatically.
const reserveStockForItems = async (items, session) => {
    for (const item of items) {
        const updated = await productRepository.decrementStock(item.product, item.quantity, session);
        if (!updated) {
            throw new ApiError(409, `"${item.name}" no longer has enough stock`);
        }
    }
};

const buildOrderItemsFromCart = (cart) => {
    for (const item of cart.items) {
        const product = item.product;
        if (!product || !product.isActive) {
            throw new ApiError(400, `Product "${product?.name || "unknown"}" is no longer available`);
        }
        if (product.stock < item.qty) {
            throw new ApiError(400, `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.qty}`);
        }
    }
    return cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price, // live price, never cart snapshot — per earlier decision
        quantity: item.qty,
        image: item.product.imageUrl || "",
    }));
};

const findOrCreatePendingOnlineOrder = async (userId, orderItems, shippingAddress, paymentMethod, notes, itemsTotal, shippingCharge, totalAmount) => {
    const existing = await orderRepository.findPendingByUser(userId);

    const sameCart = existing &&
        existing.items.length === orderItems.length &&
        existing.items.every((existingItem) => {
            const match = orderItems.find((newItem) => String(newItem.product) === String(existingItem.product));
            return match && match.quantity === existingItem.quantity;
        });

    if (sameCart) {
        return orderRepository.updatePendingOrder(existing._id, {
            items: orderItems, shippingAddress, paymentMethod, itemsTotal, shippingCharge, totalAmount, notes: notes || "",
        });
    }

    const created = await orderRepository.create({
        user: userId, items: orderItems, shippingAddress, orderType: "online",
        orderStatus: "pending", paymentStatus: "pending", paymentMethod,
        itemsTotal, shippingCharge, totalAmount, notes: notes || "",
    });

    return created;
};

const createOrder = async (userId, userEmail, userName, { shippingAddress, orderType, paymentMethod, notes }) => {
    const cart = await cartRepository.findByUser(userId); // must be populated — see note below
    if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty. Add items before placing an order");

    const orderItems = buildOrderItemsFromCart(cart);
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCharge = itemsTotal >= 500 ? 0 : 50;
    const totalAmount = itemsTotal + shippingCharge;

    let resolvedPaymentMethod = paymentMethod;
    if (orderType === "whatsapp") resolvedPaymentMethod = "whatsapp_cod";
    if (orderType === "online" && paymentMethod !== "razorpay") {
        throw new ApiError(400, "For online orders, paymentMethod must be 'razorpay'");
    }

    if (orderType === "whatsapp") {
        // No later payment gate exists for this path — stock must commit NOW, atomically.
        const session = await mongoose.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                await reserveStockForItems(orderItems, session);
                const created = await orderRepository.create({
                    user: userId, items: orderItems, shippingAddress, orderType: "whatsapp",
                    orderStatus: "confirmed", paymentStatus: "pending", paymentMethod: resolvedPaymentMethod,
                    itemsTotal, shippingCharge, totalAmount, notes: notes || "", whatsappMessageSent: true,
                }, session);
                order = created;
            });
        } finally {
            session.endSession();
        }

        await cartRepository.clearItems(userId);
        await addOrderConfirmationJob({ to: userEmail, name: userName, orderId: order._id, items: order.items, totalAmount: order.totalAmount });

        const whatsappUrl = `https://wa.me/${process.env.SHOP_WHATSAPP_NUMBER || "919999999999"}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
        return { order, whatsappUrl, isWhatsApp: true };
    }

    // Online: stock is intentionally NOT touched here — payment.service.js decrements
    // on confirmed webhook, using the same reserveStockForItems + transaction pattern.
    const order = await findOrCreatePendingOnlineOrder(userId, orderItems, shippingAddress, resolvedPaymentMethod, notes, itemsTotal, shippingCharge, totalAmount);

    if (!order.wasExisting) {
        await addOrderConfirmationJob({ to: userEmail, name: userName, orderId: order._id, items: order.items, totalAmount: order.totalAmount });
    }

    return { order, isWhatsApp: false };
};

const getMyOrders = async (userId, page, limit) => {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        orderRepository.listByUser(userId, { skip, limit }),
        orderRepository.countByUser(userId),
    ]);
    return { orders, total, page, limit };
};

const getOrderById = async (orderId, userId) => {
    const order = await orderRepository.findByIdAndUser(orderId, userId);
    if (!order) throw new ApiError(404, "Order not found");
    return order;
};

const cancelOrder = async (orderId, userId) => {
    const order = await orderRepository.findByIdAndUser(orderId, userId);
    if (!order) throw new ApiError(404, "Order not found");
    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
        throw new ApiError(400, `Order cannot be cancelled at '${order.orderStatus}' stage`);
    }

    const session = await mongoose.startSession();
    let updated;
    try {
        await session.withTransaction(async () => {
            // Restock only if stock was actually committed (whatsapp orders commit at creation;
            // online orders that reached "confirmed" would have committed at payment webhook).
            if (order.orderStatus === "confirmed" || order.orderType === "whatsapp") {
                for (const item of order.items) {
                    await productRepository.incrementStock(item.product, item.quantity, session);
                }
            }
            updated = await orderRepository.markCancelled(orderId, order.paymentStatus === "paid", session);
        });
    } finally {
        session.endSession();
    }
    // TODO (P1): if paymentStatus was "paid", enqueue an actual Razorpay refund job here
    return updated;
};

const getAllOrders = async ({ page, limit, status, orderType }) => {
    const filter = {};
    if (status) filter.orderStatus = status;
    if (orderType) filter.orderType = orderType;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        orderRepository.listAll(filter, { skip, limit }),
        orderRepository.countAll(filter),
    ]);
    return { orders, total, page };
};

const updateOrderStatus = async (orderId, newStatus) => {
    const order = await orderRepository.findByIdAdmin(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    const allowed = ORDER_STATUS_TRANSITIONS[order.orderStatus] || [];
    if (!allowed.includes(newStatus)) {
        throw new ApiError(400, `Cannot move order from '${order.orderStatus}' to '${newStatus}'`);
    }

    return orderRepository.updateStatus(orderId, newStatus);
};

export default { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };