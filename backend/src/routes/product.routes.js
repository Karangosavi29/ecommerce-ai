import { Router } from "express";
import {
    getProducts,
    getProductById,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import {uploadOncloudinary} from "../utils/cloudinary.js"
import {upload} from "../middleware/multer.middleware.js";
const router = Router();

// Public
router.get("/",            getProducts);
router.get("/categories",  getCategories);
router.get("/:id",         getProductById);

// Admin only
router.post("/",    verifyJWT, adminOnly, upload.single("image"), createProduct);
router.put("/:id",  verifyJWT, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", verifyJWT, adminOnly, deleteProduct);

export default router;