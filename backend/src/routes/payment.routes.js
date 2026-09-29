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

// Raw body required for signature verification. app.js now skips express.json()/
// urlencoded() for this exact path, so this is the only body parser that runs here.
router.post("/webhook", rawBodyParser, razorpayWebhook);

router.post(
  "/create-razorpay-order",
  verifyJWT,
  validateCreateRazorpayOrder,
  createRazorpayOrder,
);
router.post("/verify", verifyJWT, validateVerifyPayment, verifyPayment);

export default router;
