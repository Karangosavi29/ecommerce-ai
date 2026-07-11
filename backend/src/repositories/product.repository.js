import Product from "../models/product.model.js";

const findActiveByFilter = (filter, { skip, limit, sort } = {}) =>
    Product.find(filter).skip(skip).limit(limit).sort(sort);

const countByFilter = (filter) => Product.countDocuments(filter);

const findById = (id) => Product.findById(id);

const create = (data) => Product.create(data);

const updateById = (id, data) =>
    Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const distinctCategories = (filter) => Product.distinct("category", filter);


const decrementStock = (productId, qty, session = null) =>
    Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true, session }
    );

const incrementStock = (productId, qty, session = null) =>
    Product.findOneAndUpdate(
        { _id: productId },
        { $inc: { stock: qty } },
        { new: true, session }
    );

const findByFilterAdmin = (filter, { skip, limit }) =>
    Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

export default {
    findActiveByFilter,
    countByFilter,
    findById,
    create,
    updateById,
    distinctCategories,
    decrementStock,
    incrementStock, // used for cancellation/refund restock
    findByFilterAdmin,
};