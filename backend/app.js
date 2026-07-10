import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.routes.js";
import productRouter from "./src/routes/product.routes.js";
import cartRouter from "./src/routes/cart.routes.js";
import orderRouter from "./src/routes/order.routes.js";
import paymentRouter from "./src/routes/payment.routes.js";
import adminRouter from "./src/routes/admin.routes.js";
import { helmetMiddleware } from "./src/config/helmet.config.js";
import { mongoSanitizeMiddleware } from "./src/middleware/sanitize.middleware.js";
import { authLimiter, generalApiLimiter } from "./src/middleware/rateLimiter.middleware.js";
import multer from "multer";

const app = express();

//  Security headers
app.use(helmetMiddleware);

//  CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

//  Sanitize after body parsing, before routes
app.use(mongoSanitizeMiddleware);

//  Rate limiting
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api", (req, res, next) => {
    // authLimiter already handled these two paths above — skip the general limiter for them
    if (req.path === "/auth/login" || req.path === "/auth/register") return next();
    return generalApiLimiter(req, res, next);
});

//  Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin", adminRouter);

//  404 handler
app.use((req, res, next) => {
  const err = new Error("Route not found");
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(err.errors?.length ? { errors: err.errors } : {}),
    ...(err.errorCode ? { errorCode: err.errorCode } : {}),
  });
});


app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError || err.message?.startsWith("Invalid file type")) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: err.message,
        });
    }
    next(err);
});

export { app };
