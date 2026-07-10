import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getMe,
  updateProfile,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getMe);
router.put("/profile", verifyJWT, validateUpdateProfile, updateProfile);

export default router;
