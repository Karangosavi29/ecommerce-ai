import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import wishlistService from "../services/wishlist.service.js";

const getWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.getWishlist(req.user._id);
    return res.status(200).json(new ApiResponse(200, wishlist, "Wishlist fetched successfully"));
});

const addToWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.addToWishlist(req.user._id, req.body.productId);
    return res.status(200).json(new ApiResponse(200, wishlist, "Product added to wishlist"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const wishlist = await wishlistService.removeFromWishlist(req.user._id, req.params.productId);
    return res.status(200).json(new ApiResponse(200, wishlist, "Product removed from wishlist"));
});

const clearWishlist = asyncHandler(async (req, res) => {
    await wishlistService.clearWishlist(req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Wishlist cleared"));
});

export { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };