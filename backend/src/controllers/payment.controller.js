import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifySignature } from "../utils/verifyRazorpaySignature.js";
import paymentService from "../services/payment.service.js";

const createRazorpayOrder = asyncHandler(async (req, res) => {
    const data = await paymentService.createRazorpayOrder(req.body.orderId, req.user._id);
    return res.status(200).json(new ApiResponse(200, data, "Razorpay order created"));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const order = await paymentService.verifyPayment(req.body, req.user._id, req.user.email, req.user.name);
    return res.status(200).json(new ApiResponse(200, { order }, "Payment successful! Order confirmed."));
});

// req.body is a raw Buffer here (rawBodyParser applied in routes, not express.json())
const razorpayWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const isValid = verifySignature(req.body, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) throw new ApiError(400, "Invalid webhook signature");

    const payload = JSON.parse(req.body.toString("utf8"));
    const paymentEntity = payload.payload?.payment?.entity;

    await paymentService.handleWebhookEvent(payload.event, paymentEntity);

    return res.status(200).json({ received: true });
});

export { createRazorpayOrder, verifyPayment, razorpayWebhook };