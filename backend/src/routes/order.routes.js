import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// Customer routes
router.use(verifyJWT);
router.post("/create", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:orderId", getOrderById);
router.patch("/:orderId/cancel", cancelOrder);

// Admin routes
router.get("/admin/all", adminOnly, getAllOrders);
router.patch("/admin/:orderId/status", adminOnly, updateOrderStatus);

export default router;