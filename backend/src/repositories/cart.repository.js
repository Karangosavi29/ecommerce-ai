import Cart from "../models/cart.model.js";

const findByUser = (userId) => Cart.findOne({ user: userId });

const createForUser = (userId) => Cart.create({ user: userId, items: [] });

// Atomic increment if item exists, uses arrayFilters to avoid read-modify-write race
const incrementItemQty = (userId, productId, qtyDelta) =>
    Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        { $inc: { "items.$.qty": qtyDelta } },
        { new: true }
    );

const pushNewItem = (userId, item) =>
    Cart.findOneAndUpdate(
        { user: userId },
        { $push: { items: item } },
        { new: true, upsert: true }
    );

const setItemQty = (userId, productId, qty) =>
    Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        { $set: { "items.$.qty": qty } },
        { new: true }
    );

const removeItem = (userId, productId) =>
    Cart.findOneAndUpdate(
        { user: userId },
        { $pull: { items: { product: productId } } },
        { new: true }
    );

const clearItems = (userId) =>
    Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { new: true });

export default {
    findByUser,
    createForUser,
    incrementItemQty,
    pushNewItem,
    setItemQty,
    removeItem,
    clearItems,
};