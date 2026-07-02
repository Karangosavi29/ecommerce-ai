import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Webhook must use raw body — register BEFORE express.json() in app.js
router.post("/webhook", razorpayWebhook);

// Protected routes
router.post("/create-razorpay-order", verifyJWT, createRazorpayOrder);
router.post("/verify", verifyJWT, verifyPayment);

export default router;