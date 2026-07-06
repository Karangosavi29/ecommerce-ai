import cartRepository from "../repositories/cart.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

const computeTotal = (items) => items.reduce((sum, item) => sum + item.price * item.qty, 0);

const withTotal = (cart) => {
    if (!cart) return { items: [], totalPrice: 0 };
    const plain = cart.toObject ? cart.toObject() : cart;
    return { ...plain, totalPrice: computeTotal(plain.items) };
};

const getCart = async (userId) => {
    const cart = await cartRepository.findByUser(userId);
    return withTotal(cart);
};

const addToCart = async (userId, productId, qty = 1) => {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, "Product not found");
    if (product.stock < qty) throw new ApiError(400, `Only ${product.stock} units available`);

    let cart = await cartRepository.findByUser(userId);
    const existing = cart?.items.find((item) => item.product.toString() === productId);

    if (existing) {
        const newQty = existing.qty + qty;
        if (newQty > product.stock) throw new ApiError(400, `Only ${product.stock} units available`);
        cart = await cartRepository.incrementItemQty(userId, productId, qty);
    } else {
        const item = {
            product:  product._id,
            name:     product.name,
            price:    product.price,
            imageUrl: product.imageUrl,
            qty,
        };
        cart = await cartRepository.pushNewItem(userId, item);
    }

    return withTotal(cart);
};

const updateCartItem = async (userId, productId, qty) => {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");
    if (qty > product.stock) throw new ApiError(400, `Only ${product.stock} units available`);

    const cart = await cartRepository.findByUser(userId);
    if (!cart) throw new ApiError(404, "Cart not found");

    const exists = cart.items.some((item) => item.product.toString() === productId);
    if (!exists) throw new ApiError(404, "Item not in cart");

    const updated = await cartRepository.setItemQty(userId, productId, qty);
    return withTotal(updated);
};

const removeCartItem = async (userId, productId) => {
    const cart = await cartRepository.findByUser(userId);
    if (!cart) throw new ApiError(404, "Cart not found");

    const updated = await cartRepository.removeItem(userId, productId);
    return withTotal(updated);
};

const clearCart = async (userId) => {
    const cart = await cartRepository.findByUser(userId);
    if (!cart) throw new ApiError(404, "Cart not found");

    await cartRepository.clearItems(userId);
};

export default { getCart, addToCart, updateCartItem, removeCartItem, clearCart };