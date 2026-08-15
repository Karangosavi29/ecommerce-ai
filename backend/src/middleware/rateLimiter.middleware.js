import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

const makeLimiter = ({ windowMs, max, message, prefix }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
            prefix: `rl:${prefix}:`,
        }),

        handler: (req, res, _next, options) => {
            const resetTime = req.rateLimit?.resetTime;
            const retryAfterSeconds = resetTime
                ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
                : Math.ceil(options.windowMs / 1000);

            res.status(429).json({
                success: false,
                statusCode: 429,
                message,
                retryAfter: retryAfterSeconds,
            });
        },
    });

const isDev = process.env.NODE_ENV !== "production";

export const authLimiter = makeLimiter({
    windowMs: 5 * 60 * 1000, // was 15 min — shorter window means faster recovery from genuine typos
    max: isDev ? 1000 : 5,   // was 10 in prod — tighter since the window is now shorter too
    message: "Too many login attempts. Please try again shortly.",
    prefix: "auth",
});

// Looser: general API traffic
export const generalApiLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests. Please slow down.",
    prefix: "general",
});

// Payment endpoints: tighter than general, looser than auth (legitimate retries happen here)
export const paymentLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: "Too many payment attempts. Please try again shortly.",
    prefix: "payment",
});