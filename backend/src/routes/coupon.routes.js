import { Router } from "express";
import {
  previewCoupon,
  createCoupon,
  updateCoupon,
  listCoupons,
} from "../controllers/coupon.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  validateApplyCoupon,
  validateCreateCoupon,
} from "../validators/coupon.validator.js";

const router = Router();

router.use(verifyJWT);

router.post("/preview", validateApplyCoupon, previewCoupon);

// Admin
router.post("/", adminOnly, validateCreateCoupon, createCoupon);
router.put("/:id", adminOnly, validateObjectId("id"), updateCoupon);
router.get("/", adminOnly, listCoupons);

export default router;
