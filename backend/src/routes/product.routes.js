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
  upload.array("images", 6),
  validateCreateProduct,
  createProduct,
);
router.put(
  "/:id",
  verifyJWT,
  adminOnly,
  validateObjectId(),
  upload.array("images", 6),
  validateUpdateProduct,
  updateProduct,
);
router.delete("/:id", verifyJWT, adminOnly, validateObjectId(), deleteProduct);


export default router;