import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateHomeSectionSchema = z.object({
  productIds: z
    .array(z.string().regex(objectIdRegex, "Invalid product id"))
    .max(20, "A section can hold at most 20 products"),
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
  req.body = result.data;
  next();
};

export const validateUpdateHomeSection = validateBody(updateHomeSectionSchema);