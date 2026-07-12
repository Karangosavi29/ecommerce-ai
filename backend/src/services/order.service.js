import mongoose from "mongoose";
import orderRepository from "../repositories/order.repository.js";
import cartRepository from "../repositories/cart.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { addOrderConfirmationJob } from "../queues/email.queue.js";
import { ORDER_STATUS_TRANSITIONS, CANCELLABLE_STATUSES } from "../constants/orderStatus.js";
import couponService from "./coupon.service.js";

const buildWhatsAppMessage = (order) => {
  const items = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}
   Qty : ${item.quantity}
   Price : ₹${item.price.toLocaleString()}
   Total : ₹${(item.price * item.quantity).toLocaleString()}`
    )
    .join("\n\n");

  const a = order.shippingAddress;

  return `🛍️ *NEW ORDER*

━━━━━━━━━━━━━━━━

📦 *Products*

${items}

━━━━━━━━━━━━━━━━

💳 *Payment Summary*
Total Amount : *₹${order.totalAmount.toLocaleString()}*

🚚 *Shipping Address*

👤 ${a.fullName}
🏠 ${a.addressLine1}${a.addressLine2 ? `, ${a.addressLine2}` : ""}
📍 ${a.city}, ${a.state} - ${a.pincode}
📞 ${a.phone}

🆔 Order ID
${order._id}

━━━━━━━━━━━━━━━━
Thank you for shopping with us ❤️`;
};

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
        price: item.product.price,
        quantity: item.qty,
        image: item.product.imageUrl || "",
    }));
};

const findOrCreatePendingOnlineOrder = async (userId, orderItems, shippingAddress, paymentMethod, notes, itemsTotal, shippingCharge, totalAmount, couponCode, discountAmount) => {
    const existing = await orderRepository.findPendingByUser(userId);

    const sameCart = existing &&
        existing.items.length === orderItems.length &&
        existing.items.every((existingItem) => {
            const match = orderItems.find((newItem) => String(newItem.product) === String(existingItem.product));
            return match && match.quantity === existingItem.quantity;
        });

    if (sameCart) {
        return orderRepository.updatePendingOrder(existing._id, {
            items: orderItems, shippingAddress, paymentMethod, itemsTotal, shippingCharge,
            totalAmount, notes: notes || "", couponCode, discountAmount,
        });
    }

    const created = await orderRepository.create({
        user: userId, items: orderItems, shippingAddress, orderType: "online",
        orderStatus: "pending", paymentStatus: "pending", paymentMethod,
        itemsTotal, shippingCharge, totalAmount, notes: notes || "", couponCode, discountAmount,
    });

    return created;
};

const createOrder = async (userId, userEmail, userName, { shippingAddress, orderType, paymentMethod, notes, couponCode }) => {
    const cart = await cartRepository.findByUserPopulated(userId);
    if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty. Add items before placing an order");

    const orderItems = buildOrderItemsFromCart(cart);
    const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCharge = itemsTotal >= 500 ? 0 : 50;

    let discountAmount = 0;
    let appliedCouponCode = null;

    if (couponCode) {
        const result = await couponService.applyCoupon(couponCode, userId, itemsTotal + shippingCharge);
        discountAmount = result.discountAmount;
        appliedCouponCode = result.couponCode;
    }

    // This is now the ONLY total used anywhere below — no separate stale `totalAmount`.
    const totalAmount = itemsTotal + shippingCharge - discountAmount;

    let resolvedPaymentMethod = paymentMethod;
    if (orderType === "whatsapp") resolvedPaymentMethod = "whatsapp_cod";
    if (orderType === "online" && paymentMethod !== "razorpay") {
        throw new ApiError(400, "For online orders, paymentMethod must be 'razorpay'");
    }

    if (orderType === "whatsapp") {
        const session = await mongoose.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                await reserveStockForItems(orderItems, session);
                const created = await orderRepository.create({
                    user: userId, items: orderItems, shippingAddress, orderType: "whatsapp",
                    orderStatus: "confirmed", paymentStatus: "pending", paymentMethod: resolvedPaymentMethod,
                    itemsTotal, shippingCharge, totalAmount, notes: notes || "", whatsappMessageSent: true,
                    couponCode: appliedCouponCode, discountAmount,
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

    const order = await findOrCreatePendingOnlineOrder(
        userId, orderItems, shippingAddress, resolvedPaymentMethod, notes,
        itemsTotal, shippingCharge, totalAmount, appliedCouponCode, discountAmount
    );

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
    if (order.couponCode) {
        await couponService.releaseCoupon(order.couponCode);
    }

    const session = await mongoose.startSession();
    let updated;
    try {
        await session.withTransaction(async () => {
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

const getOrderByIdAdmin = async (orderId) => {
    const order = await orderRepository.findByIdAdmin(orderId);
    if (!order) throw new ApiError(404, "Order not found");
    return order;
};

export default { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus, getOrderByIdAdmin };