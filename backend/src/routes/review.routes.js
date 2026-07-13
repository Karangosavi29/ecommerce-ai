import { Router } from "express";
import {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { validateReview, validatePagination } from "../validators/review.validator.js";

const router = Router({ mergeParams: true }); 

router.get("/", validatePagination, getProductReviews);
router.post("/", verifyJWT, validateReview, createReview);
router.put("/", verifyJWT, validateReview, updateReview);
router.delete("/", verifyJWT, deleteReview);

export default router;