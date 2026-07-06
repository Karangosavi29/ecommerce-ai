import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";
import {
  validateAddToCart,
  validateUpdateCartItem,
} from "../validators/cart.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getCart);
router.post("/add", validateAddToCart, addToCart);
router.put("/update", validateUpdateCartItem, updateCartItem);
router.delete(
  "/item/:productId",
  validateObjectId("productId"),
  removeCartItem,
);
router.delete("/clear", clearCart);

export default router;
