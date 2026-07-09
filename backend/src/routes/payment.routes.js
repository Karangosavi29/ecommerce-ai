import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { rawBodyParser } from "../utils/webhookRawBody.js";
import {
  validateCreateRazorpayOrder,
  validateVerifyPayment,
} from "../validators/payment.validator.js";

const router = Router();

// Raw body required for signature verification — must run before any express.json() in app.js
// now touches this path. Remove the app-level express.raw("/api/payment/webhook", ...) from
// app.js entirely — it's redundant/conflicting with this route-level version.
router.post("/webhook", rawBodyParser, razorpayWebhook);

router.post(
  "/create-razorpay-order",
  verifyJWT,
  validateCreateRazorpayOrder,
  createRazorpayOrder,
);
router.post("/verify", verifyJWT, validateVerifyPayment, verifyPayment);

export default router;
