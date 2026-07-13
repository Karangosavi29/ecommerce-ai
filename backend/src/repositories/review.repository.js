import Review from "../models/review.model.js";

const findByProduct = (productId, { skip, limit }) =>
    Review.find({ product: productId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name");

const countByProduct = (productId) => Review.countDocuments({ product: productId });

const findByUserAndProduct = (userId, productId) => Review.findOne({ user: userId, product: productId });

const create = (data) => Review.create(data);

const updateByUserAndProduct = (userId, productId, data) =>
    Review.findOneAndUpdate({ user: userId, product: productId }, { $set: data }, { new: true });

const deleteByUserAndProduct = (userId, productId) =>
    Review.findOneAndDelete({ user: userId, product: productId });

const getAggregateForProduct = (productId) =>
    Review.aggregate([
        { $match: { product: productId } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

export default {
    findByProduct,
    countByProduct,
    findByUserAndProduct,
    create,
    updateByUserAndProduct,
    deleteByUserAndProduct,
    getAggregateForProduct,
};