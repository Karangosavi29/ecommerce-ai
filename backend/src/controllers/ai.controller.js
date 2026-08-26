import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import * as aiService from "../services/ai.service.js";

// POST /api/ai/search
export const aiSearch = asyncHandler(async (req, res) => {
  const { query, page, limit } = req.body;

  const { filters, products, pagination } = await aiService.searchProductsWithAI(query, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { filters, products, pagination }, "Search completed."));
});

// POST /api/ai/assistant
export const aiAssistant = asyncHandler(async (req, res) => {
  const { message, history, state } = req.body;

  if (history && !Array.isArray(history)) {
    throw new ApiError(400, "history must be an array of { role, content } turns.");
  }

  const { message: reply, needsMoreInfo, products, state: newState, quickReplies } =
    await aiService.runProductAssistant(message, history || [], state || {});

  return res
    .status(200)
    .json(new ApiResponse(200, { message: reply, needsMoreInfo, products, state: newState, quickReplies }, "Assistant responded."));
});

// POST /api/ai/product-description (admin only)
export const aiProductDescription = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "name is required.");
  }
  if (typeof category !== "string" || !category.trim()) {
    throw new ApiError(400, "category is required.");
  }

  const description = await aiService.generateProductDescription({
    name: name.trim(),
    category: category.trim(),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { description }, "Description generated."));
});


// POST /api/ai/product-specifications (admin only)
export const aiProductSpecifications = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "name is required.");
  }
  if (typeof category !== "string" || !category.trim()) {
    throw new ApiError(400, "category is required.");
  }

  const specifications = await aiService.generateProductSpecifications({
    name: name.trim(),
    category: category.trim(),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { specifications }, "Specifications generated."));
});
