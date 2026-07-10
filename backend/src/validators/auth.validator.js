import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";

const registerSchema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().trim().optional(),
});

const loginSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z.object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().optional(),
    address: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
    }).optional(),
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

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
export const validateUpdateProfile = validateBody(updateProfileSchema);