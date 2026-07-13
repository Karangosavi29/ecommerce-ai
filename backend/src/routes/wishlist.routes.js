import { Router } from "express";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import { validateAddToWishlist } from "../validators/wishlist.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getWishlist);
router.post("/add", validateAddToWishlist, addToWishlist);
router.delete("/item/:productId", validateObjectId("productId"), removeFromWishlist);
router.delete("/clear", clearWishlist);

export default router;