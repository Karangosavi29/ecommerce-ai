import { Router } from "express";
import {
  getAnalytics,
  getRevenueReport,
  getAllProducts,
  getAllUsers,
  getUserById,
} from "../controllers/admin.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  validatePagination,
  validateProductList,
} from "../validators/admin.validator.js";

const router = Router();

router.use(verifyJWT, adminOnly);

// Analytics
router.get("/analytics", getAnalytics);
router.get("/analytics/revenue", getRevenueReport);

// Order management now lives ONLY at /api/orders/admin/all and
// /api/orders/admin/:orderId/status — see order.routes.js from the Order module.
// Removed here to eliminate the divergent/buggy duplicate implementation.

// Products
router.get("/products", validateProductList, getAllProducts);

// Users
router.get("/users", validatePagination, getAllUsers);
router.get("/users/:userId", validateObjectId("userId"), getUserById);

export default router;
