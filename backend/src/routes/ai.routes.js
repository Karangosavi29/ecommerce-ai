import { Router } from "express";
import { aiSearch, aiAssistant, aiProductDescription } from "../controllers/ai.controller.js";
import { validateAISearch, validateAIAssistant } from "../validators/ai.validator.js";
import { aiInputGuard } from "../middleware/aiInputGuard.middleware.js";
import { verifyJWT, adminOnly } from "../middleware/auth.middleware.js";


const router = Router();

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;
const hits = new Map(); 

const aiLimiter = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (hits.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: "Too many AI requests. Please slow down and try again in a minute.",
    });
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  next();
};

setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [key, timestamps] of hits.entries()) {
    const fresh = timestamps.filter((t) => t > cutoff);
    if (fresh.length) hits.set(key, fresh);
    else hits.delete(key);
  }
}, WINDOW_MS).unref();

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

export default router;