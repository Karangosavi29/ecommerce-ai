import Wishlist from "../models/wishlist.model.js";

const findByUser = (userId) =>
    Wishlist.findOne({ user: userId }).populate(
        "products",
        "name price imageUrl isActive stock category"
    );

const addProduct = (userId, productId) =>
    Wishlist.findOneAndUpdate(
        { user: userId },
        { $addToSet: { products: productId } },
        { new: true, upsert: true }
    ).populate("products", "name price imageUrl isActive stock category");

const removeProduct = (userId, productId) =>
    Wishlist.findOneAndUpdate(
        { user: userId },
        { $pull: { products: productId } },
        { new: true }
    ).populate("products", "name price imageUrl isActive stock category");

const clear = (userId) =>
    Wishlist.findOneAndUpdate({ user: userId }, { $set: { products: [] } }, { new: true });

export default { findByUser, addProduct, removeProduct, clear };