import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOncloudinary } from "../config/cloudinary.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";
import fs from "fs/promises";

const PRODUCTS_TTL   = 300;
const PRODUCT_TTL    = 600;
const CATEGORIES_TTL = 3600;

const MAX_LIMIT = 50; // hard ceiling regardless of what client requests

const listProducts = async ({ search, category, minPrice, maxPrice, page, limit }) => {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

    const cacheKey = `products:list:${JSON.stringify({ search, category, minPrice, maxPrice, page: safePage, limit: safeLimit })}`;
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const filter = { isActive: true };
    if (search)   filter.$text    = { $search: search };
    if (category) filter.category = category.toLowerCase();
    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const skip = (safePage - 1) * safeLimit;
    const [products, total] = await Promise.all([
        productRepository.findActiveByFilter(filter, { skip, limit: safeLimit, sort: { createdAt: -1 } }),
        productRepository.countByFilter(filter),
    ]);

    const data = {
        products,
        pagination: { total, page: safePage, pages: Math.ceil(total / safeLimit) },
    };

    await setCache(cacheKey, data, PRODUCTS_TTL);
    return { data, fromCache: false };
};

const getProductById = async (id) => {
    const cacheKey = `products:single:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const product = await productRepository.findById(id);
    if (!product || !product.isActive) throw new ApiError(404, "Product not found");

    await setCache(cacheKey, product, PRODUCT_TTL);
    return { data: product, fromCache: false };
};

const getCategories = async () => {
    const cacheKey = "products:categories";
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const categories = await productRepository.distinctCategories({ isActive: true });
    await setCache(cacheKey, categories, CATEGORIES_TTL);
    return { data: categories, fromCache: false };
};

const invalidateProductCaches = async (id) => {
    const tasks = [deleteCachePattern("products:list:*"), deleteCache("products:categories")];
    if (id) tasks.push(deleteCache(`products:single:${id}`));
    await Promise.all(tasks);
};

const createProduct = async ({ name, description, price, stock, category }, file) => {
    const productData = { name, description, price, stock, category };

    if (file) {
        const uploaded = await uploadOncloudinary(file.path);
        if (!uploaded) throw new ApiError(500, "Image upload failed");
        productData.imageUrl     = uploaded.url;
        productData.cloudinaryId = uploaded.public_id;
        await fs.unlink(file.path).catch(() => {}); // cleanup temp file after successful Cloudinary upload
    }

    const product = await productRepository.create(productData);
    await invalidateProductCaches();
    return product;
};

const updateProduct = async (id, updateData, file) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");

    const data = { ...updateData };
    if (file) {
        const uploaded = await uploadOncloudinary(file.path);
        if (!uploaded) throw new ApiError(500, "Image upload failed");
        data.imageUrl     = uploaded.url;
        data.cloudinaryId = uploaded.public_id;
        await fs.unlink(file.path).catch(() => {}); // cleanup temp file after successful Cloudinary upload    }

    const updated = await productRepository.updateById(id, data);
    await invalidateProductCaches(id);
    return updated;
};

const deleteProduct = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new ApiError(404, "Product not found");

    await productRepository.updateById(id, { isActive: false });
    await invalidateProductCaches(id);
};

export default {
    listProducts,
    getProductById,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
};