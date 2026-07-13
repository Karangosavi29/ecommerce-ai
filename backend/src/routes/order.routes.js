import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getOrderByIdAdmin,
} from "../controllers/order.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  validateCreateOrder,
  validatePagination,
  validateAdminOrderList,
  validateUpdateStatus,
} from "../validators/order.validator.js";

const router = Router();

router.use(verifyJWT);

router.post("/create", validateCreateOrder, createOrder);
router.get("/my-orders", validatePagination, getMyOrders);
router.get("/:orderId", validateObjectId("orderId"), getOrderById);
router.patch("/:orderId/cancel", validateObjectId("orderId"), cancelOrder);

router.get("/admin/all", adminOnly, validateAdminOrderList, getAllOrders);
router.get("/admin/:orderId", adminOnly, validateObjectId("orderId"), getOrderByIdAdmin);
router.patch(
  "/admin/:orderId/status",
  adminOnly,
  validateObjectId("orderId"),
  validateUpdateStatus,
  updateOrderStatus,
);

export default router;
