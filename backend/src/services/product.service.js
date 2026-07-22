import productRepository from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOncloudinary } from "../config/cloudinary.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";
import fs from "fs/promises";

const PRODUCTS_TTL   = 300;
const PRODUCT_TTL    = 600;
const CATEGORIES_TTL = 3600;

const MAX_LIMIT = 50; // hard ceiling regardless of what client requests
const MAX_IMAGES = 6;


const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const listProducts = async ({ search, category, minPrice, maxPrice, page, limit }) => {
    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit));

    const cacheKey = `products:list:${JSON.stringify({ search, category, minPrice, maxPrice, page: safePage, limit: safeLimit })}`;
    const cached = await getCache(cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const filter = { isActive: true };

    if (search) {
        const safeSearch = escapeRegex(search.trim());
        filter.$or = [
            { name: { $regex: safeSearch, $options: "i" } },
            { description: { $regex: safeSearch, $options: "i" } },
            { category: { $regex: safeSearch, $options: "i" } },
        ];
    }

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

const uploadImages = async (files) => {
    const uploads = await Promise.all(
        files.map(async (file) => {
            const uploaded = await uploadOncloudinary(file.path);
            if (!uploaded) throw new ApiError(500, "Image upload failed");
            await fs.unlink(file.path).catch(() => {});
            return { url: uploaded.url, cloudinaryId: uploaded.public_id };
        })
    );
    return uploads;
};

const createProduct = async ({ name, description, price, mrp, stock, category }, files) => {
    const productData = { name, description, price, stock, category };
    if (mrp !== undefined) productData.mrp = mrp;

    if (files && files.length > 0) {
        const images = await uploadImages(files.slice(0, MAX_IMAGES));
        productData.images = images;
        productData.imageUrl = images[0].url;
        productData.cloudinaryId = images[0].cloudinaryId;
    }

    const product = await productRepository.create(productData);
    await invalidateProductCaches();
    return product;
};

const updateProduct = async (id, updateData, files) => {
    const existing = await productRepository.findById(id);
    if (!existing) throw new ApiError(404, "Product not found");

    const data = { ...updateData };

  
    let keptImages = existing.images ?? [];
    if (typeof data.existingImages === "string") {
        try {
            keptImages = JSON.parse(data.existingImages);
        } catch {
            throw new ApiError(400, "Invalid existingImages format");
        }
    }
    delete data.existingImages;

    let newImages = [];
    if (files && files.length > 0) {
        newImages = await uploadImages(files);
    }

    if (keptImages.length > 0 || newImages.length > 0) {
        const combinedImages = [...keptImages, ...newImages].slice(0, MAX_IMAGES);
        data.images = combinedImages;
        data.imageUrl = combinedImages[0]?.url ?? "";
        data.cloudinaryId = combinedImages[0]?.cloudinaryId ?? "";
    }

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