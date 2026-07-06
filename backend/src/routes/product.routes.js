import { Router } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  validateListProducts,
  validateCreateProduct,
  validateUpdateProduct,
} from "../validators/product.validator.js";

const router = Router();

// Public
router.get("/", validateListProducts, getProducts);
router.get("/categories", getCategories);
router.get("/:id", validateObjectId(), getProductById);

// Admin only
router.post(
  "/",
  verifyJWT,
  adminOnly,
  upload.single("image"),
  validateCreateProduct,
  createProduct,
);
router.put(
  "/:id",
  verifyJWT,
  adminOnly,
  validateObjectId(),
  upload.single("image"),
  validateUpdateProduct,
  updateProduct,
);
router.delete("/:id", verifyJWT, adminOnly, validateObjectId(), deleteProduct);
