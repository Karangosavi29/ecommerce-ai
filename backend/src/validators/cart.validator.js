import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID");

const addToCartSchema = z.object({
    productId: objectIdString,
    qty: z.coerce.number().int().min(1).max(100).default(1),
});

const updateCartItemSchema = z.object({
    productId: objectIdString,
    qty: z.coerce.number().int().min(1).max(100),
});

const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    }
    req.body = result.data;
    next();
};

export const validateAddToCart      = validateBody(addToCartSchema);
export const validateUpdateCartItem = validateBody(updateCartItemSchema);