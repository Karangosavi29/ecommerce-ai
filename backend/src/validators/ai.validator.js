import { ApiError } from "../utils/ApiError.js";

const MAX_TEXT_LENGTH = 500;

export const validateAISearch = (req, res, next) => {
  const { query, page, limit } = req.body;

  if (typeof query !== "string" || !query.trim()) {
    throw new ApiError(400, "query is required and must be a non-empty string.");
  }
  if (query.length > MAX_TEXT_LENGTH) {
    throw new ApiError(400, `query must be under ${MAX_TEXT_LENGTH} characters.`);
  }

  if (page !== undefined) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      throw new ApiError(400, "page must be a positive integer.");
    }
  }

  if (limit !== undefined) {
    const l = Number(limit);
    if (!Number.isInteger(l) || l < 1 || l > 50) {
      throw new ApiError(400, "limit must be an integer between 1 and 50.");
    }
  }

  next();
};

export const validateAIAssistant = (req, res, next) => {
  const { message, history } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    throw new ApiError(400, "message is required and must be a non-empty string.");
  }
  if (message.length > MAX_TEXT_LENGTH) {
    throw new ApiError(400, `message must be under ${MAX_TEXT_LENGTH} characters.`);
  }

  if (history !== undefined) {
    if (!Array.isArray(history)) {
      throw new ApiError(400, "history must be an array.");
    }
    for (const turn of history) {
      if (!turn || typeof turn !== "object") {
        throw new ApiError(400, "each history entry must be an object with role and content.");
      }
      if (turn.role !== undefined && !["user", "assistant"].includes(turn.role)) {
        throw new ApiError(400, "history[].role must be 'user' or 'assistant'.");
      }
      if (turn.content !== undefined) {
        if (typeof turn.content !== "string") {
          throw new ApiError(400, "history[].content must be a string.");
        }
        if (turn.content.length > MAX_TEXT_LENGTH) {
          throw new ApiError(400, `history[].content must be under ${MAX_TEXT_LENGTH} characters.`);
        }
      }
    }
  }

  next();
};