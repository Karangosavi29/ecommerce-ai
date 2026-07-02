import { Router } from "express";
import {
    getAnalytics,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllProducts,
    getAllUsers,
    getUserById,
    getRevenueReport,
} from "../controllers/admin.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// All admin routes — must be logged in AND admin
router.use(verifyJWT, adminOnly);

// Analytics
router.get("/analytics",         getAnalytics);
router.get("/analytics/revenue", getRevenueReport);

// Orders
router.get("/orders",                        getAllOrders);
router.get("/orders/:orderId",               getOrderById);
router.patch("/orders/:orderId/status",      updateOrderStatus);

// Products
router.get("/products", getAllProducts);

// Users
router.get("/users",           getAllUsers);
router.get("/users/:userId",   getUserById);

export default router;