import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const applyCouponSchema = z.object({
    code: z.string().trim().min(1, "Coupon code is required"),
});

const createCouponSchema = z.object({
    code: z.string().trim().min(1),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().min(0),
    minOrderValue: z.coerce.number().min(0).default(0),
    maxDiscountAmount: z.coerce.number().min(0).nullable().optional(),
    maxUses: z.coerce.number().int().min(1).nullable().optional(),
    maxUsesPerUser: z.coerce.number().int().min(1).default(1),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date(),
});

const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    req.body = result.data;
    next();
};

export const validateApplyCoupon = validateBody(applyCouponSchema);
export const validateCreateCoupon = validateBody(createCouponSchema);