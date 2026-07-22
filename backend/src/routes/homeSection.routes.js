import { Router } from "express";
import {
  getAllHomeSections,
  getHomeSection,
  updateHomeSection,
} from "../controllers/homeSection.controller.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { validateUpdateHomeSection } from "../validators/homeSection.validator.js";

const router = Router();

// Public
router.get("/", getAllHomeSections);
router.get("/:key", getHomeSection);

// Admin-only 
router.put("/:key", verifyJWT, adminOnly, validateUpdateHomeSection, updateHomeSection);

export default router;