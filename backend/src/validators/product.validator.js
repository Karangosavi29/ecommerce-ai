import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const createProductSchema = z.object({
    name:        z.string().trim().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    price:       z.coerce.number().min(0, "Price cannot be negative"),
    mrp:         z.coerce.number().min(0, "MRP cannot be negative").optional(),
    stock:       z.coerce.number().min(0).optional(),
    category:    z.string().trim().min(1, "Category is required"),
});

const updateProductSchema = createProductSchema.partial().extend({
    existingImages: z.string().optional(),
});

const listProductsQuerySchema = z.object({
    search:   z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page:     z.coerce.number().int().min(1).default(1),
    limit:    z.coerce.number().int().min(1).default(12),
});

const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const fieldErrors = result.error.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
        return next(new ApiError(400, "Validation failed", fieldErrors));
    }
    req.body = result.data;
    next();
};

const validateQuery = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
        return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    }
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, result.data);
    next();
};

export const validateCreateProduct  = validateBody(createProductSchema);
export const validateUpdateProduct  = validateBody(updateProductSchema);
export const validateListProducts   = validateQuery(listProductsQuerySchema);