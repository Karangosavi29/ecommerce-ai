import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import couponService from "../services/coupon.service.js";

// Preview-only endpoint — lets the frontend show the discount before checkout,
// WITHOUT reserving usage (that only happens inside order creation).
const previewCoupon = asyncHandler(async (req, res) => {
    const { code, orderValue } = req.body;
    const coupon = await couponService.validateCoupon(code, req.user._id, orderValue);
    const discountAmount = couponService.calculateDiscount(coupon, orderValue);
    return res.status(200).json(new ApiResponse(200, { discountAmount, code: coupon.code }, "Coupon is valid"));
});

const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    return res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

const listCoupons = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await couponService.listCoupons(page, limit);
    return res.status(200).json(new ApiResponse(200, data, "Coupons fetched successfully"));
});

export { previewCoupon, createCoupon, updateCoupon, listCoupons };