import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../config/cloudinary.js";
import { getCache, setCache, deleteCache, deleteCachePattern } from "../utils/cache.js";

// Cache TTLs
const PRODUCTS_TTL   = 300;  // 5 min
const PRODUCT_TTL    = 600;  // 10 min
const CATEGORIES_TTL = 3600; // 1 hour

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    // Unique cache key per query combination
    const cacheKey = `products:list:${JSON.stringify({ search, category, minPrice, maxPrice, page, limit })}`;

    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        return res
            .status(200)
            .json(new ApiResponse(200, cached, "Products fetched successfully (cache)"));
    }

    const query = { isActive: true };

    if (search)   query.$text    = { $search: search };
    if (category) query.category = category.toLowerCase();

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
        Product.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
        Product.countDocuments(query),
    ]);

    const data = {
        products,
        pagination: {
            total,
            page:  Number(page),
            pages: Math.ceil(total / Number(limit)),
        },
    };

    // Save to cache
    await setCache(cacheKey, data, PRODUCTS_TTL);

    return res
        .status(200)
        .json(new ApiResponse(200, data, "Products fetched successfully"));
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const cacheKey = `products:single:${req.params.id}`;

    // Check cache first
    const cached = await getCache(cacheKey);
    if (cached) {
        return res
            .status(200)
            .json(new ApiResponse(200, cached, "Product fetched successfully (cache)"));
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    // Save to cache
    await setCache(cacheKey, product, PRODUCT_TTL);

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const cacheKey = "products:categories";

    const cached = await getCache(cacheKey);
    if (cached) {
        return res
            .status(200)
            .json(new ApiResponse(200, cached, "Categories fetched successfully (cache)"));
    }

    const categories = await Product.distinct("category", { isActive: true });

    await setCache(cacheKey, categories, CATEGORIES_TTL);

    return res
        .status(200)
        .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !category) {
        throw new ApiError(400, "Name, description, price and category are required");
    }

    const productData = { name, description, price, stock, category };

    if (req.file) {
        const uploaded = await uploadOncloudinary(req.file.path);
        if (!uploaded) {
            throw new ApiError(500, "Image upload failed");
        }
        productData.imageUrl     = uploaded.url;
        productData.cloudinaryId = uploaded.public_id;
    }

    const product = await Product.create(productData);

    // Invalidate all product listing + category cache
    await deleteCachePattern("products:list:*");
    await deleteCache("products:categories");

    return res
        .status(201)
        .json(new ApiResponse(201, product, "Product created successfully"));
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    const updateData = { ...req.body };

    if (req.file) {
        const uploaded = await uploadOncloudinary(req.file.path);
        if (!uploaded) {
            throw new ApiError(500, "Image upload failed");
        }
        updateData.imageUrl     = uploaded.url;
        updateData.cloudinaryId = uploaded.public_id;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
    );

    // Invalidate this product + all listings
    await deleteCache(`products:single:${req.params.id}`);
    await deleteCachePattern("products:list:*");
    await deleteCache("products:categories");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedProduct, "Product updated successfully"));
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.isActive = false;
    await product.save();

    // Invalidate cache
    await deleteCache(`products:single:${req.params.id}`);
    await deleteCachePattern("products:list:*");
    await deleteCache("products:categories");

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Product deleted successfully"));
});

export {
    getProducts,
    getProductById,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
};