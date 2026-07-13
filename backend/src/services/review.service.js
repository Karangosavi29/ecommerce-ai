import mongoose from "mongoose";
import reviewRepository from "../repositories/review.repository.js";
import productRepository from "../repositories/product.repository.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteCache, deleteCachePattern } from "../utils/cache.js";

const MAX_LIMIT = 50;


const recomputeProductRating = async (productId) => {
    const [result] = await reviewRepository.getAggregateForProduct(productId);
    const averageRating = result ? Math.round(result.avgRating * 10) / 10 : 0;
    const numReviews = result ? result.count : 0;

    await productRepository.updateById(productId, { averageRating, numReviews });

    
    await deleteCache(`products:single:${productId}`);
    await deleteCachePattern("products:list:*");
};

const hasVerifiedPurchase = async (userId, productId) => {
    const order = await Order.findOne({
        user: userId,
        paymentStatus: "paid",
        "items.product": productId,
    });
    return !!order;
};

const getProductReviews = async (productId, page, limit) => {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [reviews, total] = await Promise.all([
        reviewRepository.findByProduct(productId, { skip, limit: safeLimit }),
        reviewRepository.countByProduct(productId),
    ]);

    return { reviews, pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) } };
};

const createReview = async (userId, productId, { rating, comment }) => {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, "Product not found");

    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) throw new ApiError(409, "You have already reviewed this product");

    const verifiedPurchase = await hasVerifiedPurchase(userId, productId);
    if (!verifiedPurchase) {
        throw new ApiError(403, "You can only review products you have purchased");
    }

    const review = await reviewRepository.create({
        product: productId,
        user: userId,
        rating,
        comment,
        verifiedPurchase: true, // always true here, since the gate above already confirmed it
    });

    await recomputeProductRating(productId);
    return review;
};

const updateReview = async (userId, productId, { rating, comment }) => {
    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (!existing) throw new ApiError(404, "Review not found");

    const updated = await reviewRepository.updateByUserAndProduct(userId, productId, { rating, comment });
    await recomputeProductRating(productId);
    return updated;
};

const deleteReview = async (userId, productId) => {
    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (!existing) throw new ApiError(404, "Review not found");

    await reviewRepository.deleteByUserAndProduct(userId, productId);
    await recomputeProductRating(productId);
};

export default { getProductReviews, createReview, updateReview, deleteReview };