import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// @desc    Get all products (filter, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (search) {
        query.$text = { $search: search };
    }

    if (category) {
        query.category = category.toLowerCase();
    }

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

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    total,
                    page:  Number(page),
                    pages: Math.ceil(total / Number(limit)),
                },
            },
            "Products fetched successfully"
        )
    );
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product fetched successfully"));
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.distinct("category", { isActive: true });

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

    // Upload image to Cloudinary if provided
    if (req.file) {
        const uploaded = await uploadOncloudinary(req.file.path);
        if (!uploaded) {
            throw new ApiError(500, "Image upload failed");
        }
        productData.imageUrl     = uploaded.url;
        productData.cloudinaryId = uploaded.public_id;
    }

    const product = await Product.create(productData);

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

    // Upload new image if provided
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