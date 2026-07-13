import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import reviewService from "../services/review.service.js";

const getProductReviews = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const data = await reviewService.getProductReviews(req.params.productId, page, limit);
    return res.status(200).json(new ApiResponse(200, data, "Reviews fetched successfully"));
});

const createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.user._id, req.params.productId, req.body);
    return res.status(201).json(new ApiResponse(201, review, "Review submitted successfully"));
});

const updateReview = asyncHandler(async (req, res) => {
    const review = await reviewService.updateReview(req.user._id, req.params.productId, req.body);
    return res.status(200).json(new ApiResponse(200, review, "Review updated successfully"));
});

const deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.user._id, req.params.productId);
    return res.status(200).json(new ApiResponse(200, null, "Review deleted successfully"));
});

export { getProductReviews, createReview, updateReview, deleteReview };