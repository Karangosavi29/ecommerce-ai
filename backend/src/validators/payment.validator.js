import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const objectIdString = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID");

const createRazorpayOrderSchema = z.object({ orderId: objectIdString });

const verifyPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1),
    razorpayPaymentId: z.string().min(1),
    razorpaySignature: z.string().min(1),
    orderId: objectIdString,
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

export const validateCreateRazorpayOrder = validateBody(createRazorpayOrderSchema);
export const validateVerifyPayment = validateBody(verifyPaymentSchema); 