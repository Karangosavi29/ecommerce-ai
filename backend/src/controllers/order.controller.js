import { Order } from "../models/order.model.js";
import  Cart  from "../models/cart.model.js";
import  Product  from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { addOrderConfirmationJob } from "../queues/email.queue.js";


const buildWhatsAppMessage = (order, user) => {
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


const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, orderType, paymentMethod, notes } = req.body;

  // Validate order type
  if (!["online", "whatsapp"].includes(orderType)) {
    throw new ApiError(400, "Invalid order type. Must be 'online' or 'whatsapp'");
  }

  // Validate shipping address
  const requiredFields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of requiredFields) {
    if (!shippingAddress?.[field]) {
      throw new ApiError(400, `Shipping address: '${field}' is required`);
    }
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price stock imageUrl  isActive"
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty. Add items before placing an order");
  }

  //  Stock validation (check ALL items before touching DB) 
  for (const item of cart.items) {
    const product = item.product;

    if (!product || !product.isActive) {
      throw new ApiError(400, `Product "${item.product?.name || "unknown"}" is no longer available`);
    }

    if (product.stock < item.qty) {
      throw new ApiError(
        400,
        `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }
  }

  //  Build order items (snapshot product data) 
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price, // use live price, not cart snapshot
    quantity: item.qty,
    image: item.product.imageUrl || "",
  }));

  const itemsTotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCharge = itemsTotal >= 500 ? 0 : 50; // free shipping above ₹500
  const totalAmount = itemsTotal + shippingCharge;

  //  Determine payment method 
  let resolvedPaymentMethod = paymentMethod;
  if (orderType === "whatsapp") {
    resolvedPaymentMethod = "whatsapp_cod";
  }
  if (orderType === "online" && !["razorpay"].includes(paymentMethod)) {
    throw new ApiError(400, "For online orders, paymentMethod must be 'razorpay'");
  }

  //  Dedup check (online orders only) 
  // If the user retries checkout (failed payment, refresh, double-click, etc.)
  // before completing payment, reuse their existing pending/unpaid order for
  // the same cart instead of creating a fresh order document every time.
  let order = null;

  if (orderType === "online") {
    const existingPendingOrder = await Order.findOne({
      user: req.user._id,
      orderType: "online",
      paymentStatus: "pending",
      orderStatus: "pending",
    }).sort({ createdAt: -1 });

    if (existingPendingOrder) {
      const sameCart =
        existingPendingOrder.items.length === orderItems.length &&
        existingPendingOrder.items.every((existingItem) => {
          const match = orderItems.find(
            (newItem) => String(newItem.product) === String(existingItem.product)
          );
          return match && match.quantity === existingItem.quantity;
        });

      if (sameCart) {
        existingPendingOrder.items = orderItems;
        existingPendingOrder.shippingAddress = shippingAddress;
        existingPendingOrder.paymentMethod = resolvedPaymentMethod;
        existingPendingOrder.itemsTotal = itemsTotal;
        existingPendingOrder.shippingCharge = shippingCharge;
        existingPendingOrder.totalAmount = totalAmount;
        existingPendingOrder.notes = notes || "";
        // Clear any stale Razorpay order id from a prior failed attempt so
        // payment.controller.js creates a fresh Razorpay order against this doc.
        existingPendingOrder.razorpayOrderId = undefined;

        order = await existingPendingOrder.save();
      }
    }
  }

  //  Create order in DB (first attempt, or cart changed since last pending order) 
  if (!order) {
    order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      orderType,
      orderStatus: "pending",
      paymentStatus: "pending",
      paymentMethod: resolvedPaymentMethod,
      itemsTotal,
      shippingCharge,
      totalAmount,
      notes: notes || "",
    });

    await addOrderConfirmationJob({
      to:          req.user.email,
      name:        req.user.name,
      orderId:     order._id,
      items:       order.items,
      totalAmount: order.totalAmount,
    });
  }

  //  WhatsApp Order
  if (orderType === "whatsapp") {
    const message = buildWhatsAppMessage(order, req.user);
    const encodedMessage = encodeURIComponent(message);

    // Your shop's WhatsApp number (put in env)
    const shopPhone = process.env.SHOP_WHATSAPP_NUMBER || "919999999999";
    const whatsappUrl = `https://wa.me/${shopPhone}?text=${encodedMessage}`;

    // Mark message as generated
    order.whatsappMessageSent = true;
    await order.save();

    // Clear cart after order creation
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0 }
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        { order, whatsappUrl },
        "WhatsApp order created. Redirect user to WhatsApp."
      )
    );
  }

  
  //  Online Payment (Razorpay)
  // Stock is NOT deducted yet — only after payment success
  // Cart is NOT cleared yet — only after payment success
  return res.status(201).json(
    new ApiResponse(
      201,
      { order, orderId: order._id },
      "Order created. Proceed to payment."
    )
  );
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select("-razorpaySignature");

  const total = await Order.countDocuments({ user: req.user._id });

  return res.status(200).json(
    new ApiResponse(200, { orders, total, page: Number(page), limit: Number(limit) }, "Orders fetched")
  );
});

// GET /api/orders/:orderId

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  }).select("-razorpaySignature");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return res.status(200).json(new ApiResponse(200, order, "Order fetched"));
});

// PATCH /api/orders/:orderId/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user._id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(order.orderStatus)) {
    throw new ApiError(400, `Order cannot be cancelled at '${order.orderStatus}' stage`);
  }

  order.orderStatus = "cancelled";

  // If it was paid, mark for refund
  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
    // TODO: trigger Razorpay refund via queue
  }

  await order.save();

  return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

// ADMIN: GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, orderType } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (orderType) filter.orderType = orderType;

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate("user", "name email phone")
    .select("-razorpaySignature");

  const total = await Order.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, { orders, total, page: Number(page) }, "All orders fetched")
  );
});

// ADMIN: PATCH /api/admin/orders/:orderId/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const validStatuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = orderStatus;
  await order.save();

  return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

export {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};