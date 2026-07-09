import mongoose from "mongoose";
import Razorpay from "razorpay";
import orderRepository from "../repositories/order.repository.js";
import cartRepository from "../repositories/cart.repository.js";
import userRepository from "../repositories/user.repository.js";
import inventoryService from "./inventory.service.js";
import { verifySignature } from "../utils/verifyRazorpaySignature.js";
import { ApiError } from "../utils/ApiError.js";
import { addPaymentSuccessJob } from "../queues/email.queue.js";

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

const createRazorpayOrder = async (orderId, userId) => {
    const order = await orderRepository.findByIdAndUser(orderId, userId);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.paymentStatus !== "pending") throw new ApiError(400, "Payment already processed for this order");
    if (order.orderType !== "online") throw new ApiError(400, "This order is not eligible for online payment");

    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.totalAmount * 100),
        currency: "INR",
        receipt: `receipt_${order._id}`,
        notes: { orderId: order._id.toString(), userId: userId.toString() },
    });

    await orderRepository.setRazorpayOrderId(order._id, razorpayOrder.id);

    return { razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency, orderId: order._id, keyId: process.env.RAZORPAY_KEY_ID };
};

// Single source of truth for "a payment succeeded." Called by BOTH verifyPayment and the
// webhook. Idempotent via markPaidIfPending's atomic guard — safe to call twice for the
// same order regardless of which caller arrives first. Always resolves user info from the
// order itself (never from req.user), since the webhook has no request-scoped user at all.
const confirmPayment = async ({ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, expectedAmountPaise }) => {
    const order = razorpayOrderId
        ? await orderRepository.findByRazorpayOrderId(razorpayOrderId)
        : await orderRepository.findByIdAdmin(orderId);

    if (!order) throw new ApiError(404, "Order not found");

    if (expectedAmountPaise !== undefined && Math.round(order.totalAmount * 100) !== expectedAmountPaise) {
        throw new ApiError(400, "Payment amount does not match order total");
    }

    const session = await mongoose.startSession();
    let updatedOrder;
    try {
        await session.withTransaction(async () => {
            updatedOrder = await orderRepository.markPaidIfPending(order._id, { razorpayPaymentId, razorpaySignature }, session);
            if (!updatedOrder) return; // already paid by the other caller — no-op
            await inventoryService.reserveStockForItems(updatedOrder.items, session);
        });
    } finally {
        session.endSession();
    }

    if (!updatedOrder) {
        return { order, alreadyProcessed: true };
    }

    await cartRepository.clearItems(order.user);

    const user = await userRepository.findById(order.user); // .select("email name") if you want to trim the fetch
    if (user) {
        await addPaymentSuccessJob({ to: user.email, name: user.name, orderId: order._id, totalAmount: order.totalAmount, paymentId: razorpayPaymentId });
    }

    return { order: updatedOrder, alreadyProcessed: false };
};

const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }, userId) => {
    const isValid = verifySignature(`${razorpayOrderId}|${razorpayPaymentId}`, razorpaySignature, process.env.RAZORPAY_KEY_SECRET);
    if (!isValid) throw new ApiError(400, "Payment verification failed: Invalid signature");

    const order = await orderRepository.findByIdAndUser(orderId, userId);
    if (!order) throw new ApiError(404, "Order not found");

    const result = await confirmPayment({ orderId: order._id, razorpayPaymentId, razorpaySignature });
    return result.order;
};

const handleWebhookEvent = async (event, paymentEntity) => {
    if (event === "payment.captured") {
        await confirmPayment({
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
            expectedAmountPaise: paymentEntity.amount,
        });
    }
    if (event === "payment.failed") {
        await orderRepository.markFailed(paymentEntity.order_id);
    }
};

export default { createRazorpayOrder, verifyPayment, handleWebhookEvent };