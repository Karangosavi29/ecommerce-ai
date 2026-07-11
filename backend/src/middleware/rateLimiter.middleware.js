import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js"; 

const makeLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args), 
        }),
        message: { success: false, statusCode: 429, message },
    });

const isDev = process.env.NODE_ENV !== "production";

export const authLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 100 : 10, // generous in dev so testing doesn't lock you out
    message: "Too many attempts. Please try again in 15 minutes.",
});

// Looser: general API traffic
export const generalApiLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: "Too many requests. Please slow down.",
});

// Payment endpoints: tighter than general, looser than auth (legitimate retries happen here)
export const paymentLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: "Too many payment attempts. Please try again shortly.",
});