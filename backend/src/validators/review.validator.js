import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const reviewSchema = z.object({
    rating: z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().trim().max(1000, "Comment cannot exceed 1000 characters").optional(),
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    req.body = result.data;
    next();
};

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    for (const key of Object.keys(req.query)) delete req.query[key]; 
    Object.assign(req.query, result.data);
    next();
};

export const validateReview = validateBody(reviewSchema);
export const validatePagination = validateQuery(paginationSchema);