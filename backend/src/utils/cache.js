import redis from "../config/redis.js";

const DEFAULT_TTL = 300; // 5 minutes

// Get from cache
const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Cache get error:", error);
        return null; // fail silently — fallback to DB
    }
};

// Set cache
const setCache = async (key, data, ttl = DEFAULT_TTL) => {
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
        console.error("Cache set error:", error); // fail silently
    }
};

// Delete single key
const deleteCache = async (key) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error("Cache delete error:", error);
    }
};

// Delete multiple keys by pattern
// e.g. pattern = "products:*" deletes all product cache
const deleteCachePattern = async (pattern) => {
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`Cache invalidated: ${keys.length} keys matching "${pattern}"`);
        }
    } catch (error) {
        console.error("Cache pattern delete error:", error);
    }
};

export { getCache, setCache, deleteCache, deleteCachePattern };