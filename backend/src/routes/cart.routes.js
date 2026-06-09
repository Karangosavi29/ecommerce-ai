import { Router } from "express";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All cart routes require login
router.use(verifyJWT);

router.get("/",                    getCart);
router.post("/add",                addToCart);
router.put("/update",              updateCartItem);
router.delete("/item/:productId",  removeCartItem);
router.delete("/clear",            clearCart);

export default router;