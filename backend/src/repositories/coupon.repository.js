import Coupon from "../models/coupon.model.js";

const findByCode = (code) => Coupon.findOne({ code: code.toUpperCase(), isActive: true });

const findById = (id) => Coupon.findById(id);

const create = (data) => Coupon.create(data);

const updateById = (id, data) => Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const findAll = ({ skip, limit }) => Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

const countAll = () => Coupon.countDocuments();


const incrementUsageIfAvailable = (couponId, maxUses) => {
    const filter = { _id: couponId };
    if (maxUses !== null && maxUses !== undefined) {
        filter.usedCount = { $lt: maxUses };
    }
    return Coupon.findOneAndUpdate(filter, { $inc: { usedCount: 1 } }, { new: true });
};

const decrementUsage = (couponId) =>
    Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: -1 } }, { new: true });

export default {
    findByCode,
    findById,
    create,
    updateById,
    findAll,
    countAll,
    incrementUsageIfAvailable,
    decrementUsage,
};