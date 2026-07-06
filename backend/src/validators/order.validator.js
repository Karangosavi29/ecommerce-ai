import { z } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { ORDER_STATUS_TRANSITIONS } from "../constants/orderStatus.js";

const shippingAddressSchema = z.object({
    fullName: z.string().trim().min(1, "Full name is required"),
    phone: z.string().trim().min(10, "Valid phone number is required"),
    addressLine1: z.string().trim().min(1, "Address line 1 is required"),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().min(4, "Valid pincode is required"),
});

const createOrderSchema = z.object({
    shippingAddress: shippingAddressSchema,
    orderType: z.enum(["online", "whatsapp"]),
    paymentMethod: z.string().optional(),
    notes: z.string().max(500).optional(),
});

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});

const adminListSchema = paginationSchema.extend({
    status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
    orderType: z.enum(["online", "whatsapp"]).optional(),
});

const updateStatusSchema = z.object({
    orderStatus: z.enum(Object.keys(ORDER_STATUS_TRANSITIONS)),
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
    if (!result.success) return next(new ApiError(400, result.error.errors.map((e) => e.message).join(", ")));
    req.query = result.data;
    next();
};

export const validateCreateOrder    = validateBody(createOrderSchema);
export const validatePagination     = validateQuery(paginationSchema);
export const validateAdminOrderList = validateQuery(adminListSchema);
export const validateUpdateStatus   = validateBody(updateStatusSchema);