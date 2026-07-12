import couponRepository from "../repositories/coupon.repository.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";

const validateCoupon = async (code, userId, orderValue) => {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) throw new ApiError(404, "Invalid coupon code");

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
        throw new ApiError(400, "This coupon has expired or is not yet active");
    }

    if (orderValue < coupon.minOrderValue) {
        throw new ApiError(400, `This coupon requires a minimum order value of ₹${coupon.minOrderValue}`);
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
        throw new ApiError(400, "This coupon has reached its usage limit");
    }

    // Per-user usage check — count how many of this user's paid orders used this coupon
    const userUsageCount = await Order.countDocuments({
        user: userId,
        couponCode: coupon.code,
        paymentStatus: "paid",
    });
    if (userUsageCount >= coupon.maxUsesPerUser) {
        throw new ApiError(400, "You have already used this coupon");
    }

    return coupon;
};

const calculateDiscount = (coupon, orderValue) => {
    let discount;
    if (coupon.discountType === "percentage") {
        discount = (orderValue * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount !== null) {
            discount = Math.min(discount, coupon.maxDiscountAmount);
        }
    } else {
        discount = coupon.discountValue;
    }
    return Math.min(discount, orderValue); // never discount more than the order is worth
};


const applyCoupon = async (code, userId, orderValue) => {
    const coupon = await validateCoupon(code, userId, orderValue);
    const discountAmount = calculateDiscount(coupon, orderValue);

   
    const reserved = await couponRepository.incrementUsageIfAvailable(coupon._id, coupon.maxUses);
    if (!reserved) throw new ApiError(400, "This coupon has just reached its usage limit");

    return { couponCode: coupon.code, discountAmount };
};

const releaseCoupon = async (couponCode) => {
    if (!couponCode) return;
    const coupon = await couponRepository.findByCode(couponCode);
    if (coupon) await couponRepository.decrementUsage(coupon._id);
};

// Admin CRUD
const createCoupon = (data) => couponRepository.create(data);
const updateCoupon = (id, data) => couponRepository.updateById(id, data);
const listCoupons = async (page, limit) => {
    const skip = (page - 1) * limit;
    const [coupons, total] = await Promise.all([
        couponRepository.findAll({ skip, limit }),
        couponRepository.countAll(),
    ]);
    return { coupons, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

export default { validateCoupon, applyCoupon, releaseCoupon, calculateDiscount, createCoupon, updateCoupon, listCoupons };