import wishlistRepository from "../repositories/wishlist.repository.js";
import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

const formatWishlist = (wishlist) => {
    if (!wishlist) return { products: [] };
    const plain = wishlist.toObject ? wishlist.toObject() : wishlist;
    return {
        ...plain,
        products: plain.products.map((p) => ({ ...p, unavailable: !p.isActive })),
    };
};

const getWishlist = async (userId) => {
    const wishlist = await wishlistRepository.findByUser(userId);
    return formatWishlist(wishlist);
};

const addToWishlist = async (userId, productId) => {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const wishlist = await wishlistRepository.addProduct(userId, productId);
    return formatWishlist(wishlist);
};

const removeFromWishlist = async (userId, productId) => {
    const wishlist = await wishlistRepository.removeProduct(userId, productId);
    return formatWishlist(wishlist);
};

const clearWishlist = async (userId) => {
    await wishlistRepository.clear(userId);
};

export default { getWishlist, addToWishlist, removeFromWishlist, clearWishlist };