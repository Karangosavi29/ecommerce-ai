import Product from "../models/product.model.js";

const findActiveByFilter = (filter, { skip, limit, sort } = {}) =>
    Product.find(filter).skip(skip).limit(limit).sort(sort);

const countByFilter = (filter) => Product.countDocuments(filter);

const findById = (id) => Product.findById(id);

const create = (data) => Product.create(data);

const updateById = (id, data) =>
    Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });

const distinctCategories = (filter) => Product.distinct("category", filter);

export default {
    findActiveByFilter,
    countByFilter,
    findById,
    create,
    updateById,
    distinctCategories,
};