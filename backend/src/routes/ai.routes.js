import { Router } from "express";
import { aiSearch, aiAssistant, aiProductDescription, aiProductSpecifications } from "../controllers/ai.controller.js";
import { validateAISearch, validateAIAssistant } from "../validators/ai.validator.js";
import { aiInputGuard } from "../middleware/aiInputGuard.middleware.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";
import { aiLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/search",
  aiLimiter,
  validateAISearch,
  aiInputGuard("query"),
  aiSearch
);

router.post(
  "/assistant",
  aiLimiter,
  validateAIAssistant,
  aiInputGuard("message"),
  aiAssistant
);
router.post(
  "/product-description",
  verifyJWT,
  adminOnly,
  aiLimiter,
  aiInputGuard("name"),
  aiProductDescription
);

router.post(
  "/product-specifications",
  verifyJWT,
  adminOnly,
  aiLimiter,
  aiInputGuard("name"),
  aiProductSpecifications
);

export default router;