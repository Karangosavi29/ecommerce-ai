import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes imports at TOP (ES module requirement)
import router from "./src/routes/auth.routes.js";
import productRouter from "./src/routes/product.routes.js";
import cartRouter from "./src/routes/cart.routes.js";
import orderRouter from "./src/routes/order.routes.js";
import paymentRouter from "./src/routes/payment.routes.js";

const app = express();

// ✅ CORS first
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// ✅ Webhook MUST come before express.json()
// Razorpay sends raw body — if express.json() runs first, signature verification breaks
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// ✅ Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ✅ Routes
app.use("/api/auth", router);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);

// ✅ Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export { app };