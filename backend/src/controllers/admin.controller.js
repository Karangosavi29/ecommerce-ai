import { Order } from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.Model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addOrderShippedJob } from "../queues/email.queue.js";

// @desc    Dashboard analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        pendingOrders,
        totalUsers,
        totalProducts,
        revenueData,
        ordersByStatus,
        ordersByType,
        recentOrders,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        User.countDocuments({ role: "customer" }),
        Product.countDocuments({ isActive: true }),

        // Total revenue from paid orders only
        Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),

        // Orders grouped by status
        Order.aggregate([
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        ]),

        // Orders grouped by type
        Order.aggregate([
            { $group: { _id: "$orderType", count: { $sum: 1 } } },
        ]),

        // Last 5 orders
        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email")
            .select("totalAmount orderStatus paymentStatus orderType createdAt"),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalOrders,
                pendingOrders,
                totalUsers,
                totalProducts,
                totalRevenue:   revenueData[0]?.total || 0,
                ordersByStatus,
                ordersByType,
                recentOrders,
            },
            "Analytics fetched successfully"
        )
    );
});

// @desc    Get all orders (filter + pagination)
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const {
        page      = 1,
        limit     = 20,
        status,
        orderType,
        paymentStatus,
    } = req.query;

    const skip   = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (status)        filter.orderStatus   = status;
    if (orderType)     filter.orderType     = orderType;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("user", "name email phone")
            .select("-razorpaySignature"),
        Order.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orders,
                pagination: {
                    total,
                    page:  Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            "Orders fetched successfully"
        )
    );
});

// @desc    Get single order (admin view — no user restriction)
// @route   GET /api/admin/orders/:orderId
// @access  Admin
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId)
        .populate("user", "name email phone address")
        .select("-razorpaySignature");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// @desc    Update order status
// @route   PATCH /api/admin/orders/:orderId/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderStatus } = req.body;

    const validStatuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(orderStatus)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Prevent going backwards in status
    const statusFlow = ["pending", "confirmed", "processing", "shipped", "delivered"];
    const currentIndex = statusFlow.indexOf(order.orderStatus);
    const newIndex     = statusFlow.indexOf(orderStatus);

    if (newIndex !== -1 && newIndex < currentIndex) {
        throw new ApiError(400, `Cannot move order back from '${order.orderStatus}' to '${orderStatus}'`);
    }

    order.orderStatus = orderStatus;
    await order.save();

    if (orderStatus === "shipped") {
         await addOrderShippedJob({
            to:      order.user.email,
            name:    order.user.name,
            orderId: order._id,
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// @desc    Get all products (including inactive)
// @route   GET /api/admin/products
// @access  Admin
const getAllProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, isActive } = req.query;
    const skip   = (Number(page) - 1) * Number(limit);
    const filter = {};

    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    const [products, total] = await Promise.all([
        Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    total,
                    page:  Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            "Products fetched successfully"
        )
    );
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
        User.find({ role: "customer" })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .select("-password -refreshToken"),
        User.countDocuments({ role: "customer" }),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                pagination: {
                    total,
                    page:  Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            "Users fetched successfully"
        )
    );
});

// @desc    Get single user with their orders
// @route   GET /api/admin/users/:userId
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
        .select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const orders = await Order.find({ user: req.params.userId })
        .sort({ createdAt: -1 })
        .select("totalAmount orderStatus paymentStatus orderType createdAt");

    return res.status(200).json(
        new ApiResponse(200, { user, orders }, "User fetched successfully")
    );
});

// @desc    Dashboard revenue report (last 7 days)
// @route   GET /api/admin/analytics/revenue
// @access  Admin
const getRevenueReport = asyncHandler(async (req, res) => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyRevenue = await Order.aggregate([
        {
            $match: {
                paymentStatus: "paid",
                createdAt:     { $gte: last7Days },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue:    { $sum: "$totalAmount" },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
            $group: {
                _id:           "$items.product",
                name:          { $first: "$items.name" },
                totalSold:     { $sum: "$items.quantity" },
                totalRevenue:  { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            { dailyRevenue, topProducts },
            "Revenue report fetched successfully"
        )
    );
});

export {
    getAnalytics,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getAllProducts,
    getAllUsers,
    getUserById,
    getRevenueReport,
};