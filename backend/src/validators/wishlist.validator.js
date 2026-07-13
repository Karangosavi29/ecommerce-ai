import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const addToWishlistSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID"),
});

export const validateAddToWishlist = (req, res, next) => {
    const result = addToWishlistSchema.safeParse(req.body);
    if (!result.success) {
        return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    }
    req.body = result.data;
    next();
};