// backend/src/services/redisCache.service.js
import redisClient from "../db/redis.js";

// 1. Generic GET (Sabhi ke liye common)
export const getCache = async (key) => {
    try {
        if (!redisClient.isOpen) return null;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Redis Get Error:", error);
        return null;
    }
};

// 2. Generic SET (Sabhi ke liye common)
export const setCache = async (key, data, ttlInSeconds = 600) => {
    try {
        if (!redisClient.isOpen) return;
        await redisClient.setEx(key, ttlInSeconds, JSON.stringify(data));
    } catch (error) {
        console.error("Redis Set Error:", error);
    }
};

// 3. Generic Invalidate by Pattern (Kisi bhi feature ka cache clear karne ke liye)
export const invalidatePattern = async (pattern) => {
    try {
        if (!redisClient.isOpen) return;
        // Match all keys with the given pattern
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`[Redis Cache Cleared] Pattern "${pattern}" deleted ${keys.length} keys`);
        }
    } catch (error) {
        console.error("Redis Invalidation Error:", error);
    }
};

// 4. Specific Helper for Notes (Using the generic invalidatePattern)
export const invalidateUserNotesCache = async (userId) => {
    await invalidatePattern(`notes:${userId}:*`);
};
