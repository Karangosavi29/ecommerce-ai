import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import productService from "../services/product.service.js";

const getProducts = asyncHandler(async (req, res) => {
    const { data, fromCache } = await productService.listProducts(req.query);
    return res.status(200).json(new ApiResponse(200, data, `Products fetched successfully${fromCache ? " (cache)" : ""}`));
});

const getProductById = asyncHandler(async (req, res) => {
    const { data, fromCache } = await productService.getProductById(req.params.id);
    return res.status(200).json(new ApiResponse(200, data, `Product fetched successfully${fromCache ? " (cache)" : ""}`));
});

const getCategories = asyncHandler(async (req, res) => {
    const { data, fromCache } = await productService.getCategories();
    return res.status(200).json(new ApiResponse(200, data, `Categories fetched successfully${fromCache ? " (cache)" : ""}`));
});

const createProduct = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body, req.files);
    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body, req.files);
    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

export { getProducts, getProductById, getCategories, createProduct, updateProduct, deleteProduct };