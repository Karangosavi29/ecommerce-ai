import crypto from "crypto";
import Razorpay from "razorpay";
import  {Order}  from "../models/order.model.js";
import  Product  from "../models/product.model.js";
import  Cart  from "../models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment/create-razorpay-order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Order ID is required");
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus !== "pending") {
    throw new ApiError(400, "Payment already processed for this order");
  }

  if (order.orderType !== "online") {
    throw new ApiError(400, "This order is not eligible for online payment");
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: `receipt_${order._id}`,
    notes: {
      orderId: order._id.toString(),
      userId: req.user._id.toString(),
    },
  });

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
      "Razorpay order created"
    )
  );
});

// POST /api/payment/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    throw new ApiError(400, "All payment fields are required");
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment verification failed: Invalid signature");
  }

  const order = await Order.findOne({ _id: orderId, user: req.user._id });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.paymentStatus === "paid") {
    return res.status(200).json(new ApiResponse(200, order, "Payment already verified"));
  }

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  await order.save();

  // Deduct stock only after payment confirmed
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { items: [], totalPrice: 0 }
  );

  return res.status(200).json(
    new ApiResponse(200, { order }, "Payment successful! Order confirmed.")
  );
});

// POST /api/payment/webhook
const razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (expectedSignature !== signature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (event === "payment.captured") {
    const razorpayOrderId = paymentEntity.order_id;

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(200).json({ received: true });
    }

    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId = paymentEntity.id;
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      await Cart.findOneAndUpdate(
        { user: order.user },
        { items: [], totalPrice: 0 }
      );
    }
  }

  if (event === "payment.failed") {
    const razorpayOrderId = paymentEntity.order_id;
    await Order.findOneAndUpdate(
      { razorpayOrderId },
      { paymentStatus: "failed", orderStatus: "cancelled" }
    );
  }

  return res.status(200).json({ received: true });
});

export { createRazorpayOrder, verifyPayment, razorpayWebhook };