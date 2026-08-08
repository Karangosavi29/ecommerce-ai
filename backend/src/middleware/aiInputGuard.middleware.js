import { ApiError } from "../utils/ApiError.js";

const INJECTION_PATTERNS = [
  /ignore (all|previous|prior|the) instructions/i,
  /disregard (all|previous|prior|the) (instructions|prompt)/i,
  /you are now/i,
  /system\s*:\s*/i,
  /act as (a|an) (system|developer|admin)/i,
  /reveal (the|your) (system )?prompt/i,
  /drop (table|database|collection)/i,
  /delete (the )?database/i,
  /\bDAN\b/, 
];

const MAX_INPUT_LENGTH = 500;

export const aiInputGuard = (fieldName) => (req, res, next) => {
  const value = req.body?.[fieldName];

  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `"${fieldName}" is required and must be a non-empty string.`);
  }

  if (value.length > MAX_INPUT_LENGTH) {
    throw new ApiError(400, `"${fieldName}" exceeds the maximum length of ${MAX_INPUT_LENGTH} characters.`);
  }

  const hit = INJECTION_PATTERNS.find((pattern) => pattern.test(value));
  if (hit) {
    throw new ApiError(400, "Your message contains content that can't be processed. Please rephrase your shopping query.");
  }

  req.body[fieldName] = value.replace(/[\u0000-\u001F\u200B-\u200F]/g, "").trim();

  next();
};