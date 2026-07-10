import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
});

const productListSchema = paginationSchema.extend({
    isActive: z.enum(["true", "false"]).optional(),
});

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    for (const key of Object.keys(req.query)) delete req.query[key]; // getter-only req.query fix, per Security module
    Object.assign(req.query, result.data);
    next();
};

export const validatePagination = validateQuery(paginationSchema);
export const validateProductList = validateQuery(productListSchema);