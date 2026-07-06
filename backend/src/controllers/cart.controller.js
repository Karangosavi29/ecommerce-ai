import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cartService from "../services/cart.service.js";

const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    return res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, qty);
    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;
    const cart = await cartService.updateCartItem(req.user._id, productId, qty);
    return res.status(200).json(new ApiResponse(200, cart, "Cart updated"));
});

const removeCartItem = asyncHandler(async (req, res) => {
    const cart = await cartService.removeCartItem(req.user._id, req.params.productId);
    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Cart cleared"));
});

export { getCart, addToCart, updateCartItem, removeCartItem, clearCart };