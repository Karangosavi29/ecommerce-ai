import Product from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOncloudinary } from "../utils/cloudinary.js";
import redis from "../config/redis.js";

// ─────────────────────────────────────────────
// HELPER: Clear all product cache keys
// Called after any create/update/delete
// ─────────────────────────────────────────────
const clearProductCache = async () => {
  const keys = await redis.keys("products:*");
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`🗑️  Cleared ${keys.length} product cache keys`);
  }
};

// @desc    Get all products (filter, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

  // ✅ Build unique cache key from all query params
  const cacheKey = `products:${page}:${limit}:${category || "all"}:${search || "none"}:${minPrice || 0}:${maxPrice || 0}`;

  // ✅ Check Redis cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, JSON.parse(cached), "Products fetched successfully")
    );
  }

  // Cache miss — query MongoDB
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

  const data = {
    products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
  };

  // ✅ Store in Redis — 5 minute TTL
  await redis.setex(cacheKey, 300, JSON.stringify(data));

  return res.status(200).json(
    new ApiResponse(200, data, "Products fetched successfully")
  );
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const cacheKey = `product:${req.params.id}`;

  // ✅ Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, JSON.parse(cached), "Product fetched successfully")
    );
  }

  const product = await Product.findById(req.params.id);

  if (!product || !product.isActive) {
    throw new ApiError(404, "Product not found");
  }

  // ✅ Cache single product for 10 minutes
  await redis.setex(cacheKey, 600, JSON.stringify(product));

  return res.status(200).json(
    new ApiResponse(200, product, "Product fetched successfully")
  );
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const cacheKey = "products:categories";

  // ✅ Cache categories for 1 hour (changes rarely)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, JSON.parse(cached), "Categories fetched successfully")
    );
  }

  const categories = await Product.distinct("category", { isActive: true });

  await redis.setex(cacheKey, 3600, JSON.stringify(categories));

  return res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched successfully")
  );
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
    productData.imageUrl = uploaded.url;
    productData.cloudinaryId = uploaded.public_id;
  }

  const product = await Product.create(productData);

  // ✅ Bust cache so new product appears immediately
  await clearProductCache();
  await redis.del("products:categories");

  return res.status(201).json(
    new ApiResponse(201, product, "Product created successfully")
  );
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
    updateData.imageUrl = uploaded.url;
    updateData.cloudinaryId = uploaded.public_id;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  // ✅ Bust listing cache + this specific product cache
  await clearProductCache();
  await redis.del(`product:${req.params.id}`);

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
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

  // ✅ Bust all caches
  await clearProductCache();
  await redis.del(`product:${req.params.id}`);
  await redis.del("products:categories");

  return res.status(200).json(
    new ApiResponse(200, null, "Product deleted successfully")
  );
});

export {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};