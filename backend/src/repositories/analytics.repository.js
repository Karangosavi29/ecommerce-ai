import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

const countOrders = (filter = {}) => Order.countDocuments(filter);
const countUsers = (filter = {}) => User.countDocuments(filter);
const countActiveProducts = () => Product.countDocuments({ isActive: true });

const getTotalRevenue = () =>
    Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

const getOrdersByStatus = () =>
    Order.aggregate([{ $group: { _id: "$orderStatus", count: { $sum: 1 } } }]);

const getOrdersByType = () =>
    Order.aggregate([{ $group: { _id: "$orderType", count: { $sum: 1 } } }]);

const getRecentOrders = (limit = 5) =>
    Order.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("user", "name email")
        .select("totalAmount orderStatus paymentStatus orderType createdAt");

const getDailyRevenue = (since) =>
    Order.aggregate([
        { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

const getTopProducts = (limit = 5) =>
    Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                name: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" },
                totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
    ]);

const getLowStockProducts = (threshold = 10) =>
    Product.find({ isActive: true, stock: { $lte: threshold } })
        .select("name stock category")
        .sort({ stock: 1 });

export default {
    countOrders,
    countUsers,
    countActiveProducts,
    getTotalRevenue,
    getOrdersByStatus,
    getOrdersByType,
    getRecentOrders,
    getDailyRevenue,
    getTopProducts,
    getLowStockProducts,
};