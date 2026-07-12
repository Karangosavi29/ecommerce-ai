import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: [0, "Discount value cannot be negative"],
        },
        minOrderValue: {
            type: Number,
            default: 0,
        },
        maxDiscountAmount: {
            // caps the discount on percentage coupons — e.g., "10% off, max ₹200"
            // prevents a huge order from getting an unbounded percentage discount
            type: Number,
            default: null,
        },
        maxUses: {
            type: Number,
            default: null, // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        maxUsesPerUser: {
            type: Number,
            default: 1,
        },
        validFrom: {
            type: Date,
            default: Date.now,
        },
        validUntil: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);