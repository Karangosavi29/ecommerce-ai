import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import analyticsService from "../services/analytics.service.js";
import adminUserService from "../services/adminUser.service.js";
import productRepository from "../repositories/product.repository.js"; // reuse existing repo, no new one needed

const getAnalytics = asyncHandler(async (req, res) => {
    const { data, fromCache } = await analyticsService.getDashboardAnalytics();
    return res.status(200).json(new ApiResponse(200, data, `Analytics fetched successfully${fromCache ? " (cache)" : ""}`));
});

const getRevenueReport = asyncHandler(async (req, res) => {
    const { data, fromCache } = await analyticsService.getRevenueReport();
    return res.status(200).json(new ApiResponse(200, data, `Revenue report fetched successfully${fromCache ? " (cache)" : ""}`));
});

const getAllProducts = asyncHandler(async (req, res) => {
    const { page, limit, isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === "true" } : {};
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
        productRepository.findByFilterAdmin(filter, { skip, limit }), // see note below
        productRepository.countByFilter(filter),
    ]);

    return res.status(200).json(new ApiResponse(200, {
        products,
        pagination: { total, page, pages: Math.ceil(total / limit) },
    }, "Products fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await adminUserService.listUsers(page, limit);
    return res.status(200).json(new ApiResponse(200, data, "Users fetched successfully"));
});

const getUserById = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const data = await adminUserService.getUserWithOrders(req.params.userId, page, limit);
    return res.status(200).json(new ApiResponse(200, data, "User fetched successfully"));
});

export { getAnalytics, getRevenueReport, getAllProducts, getAllUsers, getUserById };