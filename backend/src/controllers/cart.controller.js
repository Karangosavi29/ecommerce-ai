import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        return res
            .status(200)
            .json(new ApiResponse(200, { items: [], totalPrice: 0 }, "Cart is empty"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// @route   POST /api/cart/add
const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty = 1 } = req.body;

    if (!productId) {
        throw new ApiError(400, "Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < qty) {
        throw new ApiError(400, `Only ${product.stock} units available`);
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (existingIndex >= 0) {
        const newQty = cart.items[existingIndex].qty + qty;
        if (newQty > product.stock) {
            throw new ApiError(400, `Only ${product.stock} units available`);
        }
        cart.items[existingIndex].qty = newQty;
    } else {
        cart.items.push({
            product:  product._id,
            name:     product.name,
            price:    product.price,
            imageUrl: product.imageUrl,
            qty,
        });
    }

    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Item added to cart"));
});

// @route   PUT /api/cart/update
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;

    if (!productId || qty === undefined) {
        throw new ApiError(400, "Product ID and qty are required");
    }

    if (qty < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (qty > product.stock) {
        throw new ApiError(400, `Only ${product.stock} units available`);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not in cart");
    }

    cart.items[itemIndex].qty = qty;
    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Cart updated"));
});

// @route   DELETE /api/cart/item/:productId
const removeCartItem = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Item removed from cart"));
});

// @route   DELETE /api/cart/clear
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Cart cleared"));
});

export {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};