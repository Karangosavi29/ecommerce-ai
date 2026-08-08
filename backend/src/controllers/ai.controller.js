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
  const { message, history } = req.body;

  if (history && !Array.isArray(history)) {
    throw new ApiError(400, "history must be an array of { role, content } turns.");
  }

  const { message: reply, needsMoreInfo, products } = await aiService.runProductAssistant(
    message,
    history || []
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { message: reply, needsMoreInfo, products }, "Assistant responded."));
});