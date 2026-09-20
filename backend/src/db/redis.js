import { createClient } from "redis";

// create redis client to connect with upstash redis 
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

// to check the error in redis connection
redisClient.on("error", (err) => {
    console.error("[Redis Error]:", err.message);
});

// to check the redis is ready to use
redisClient.on("ready", () => {
    console.log("[Redis]: Ready");
});

// to connect with upstash redis
export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (error) {
        console.error("[Redis Connection Failed]:", error.message);
        throw error; // Yahan throw error ka matlab hai ki connection fail hone par error calling code tak jayega. Tumhare server.js ka .catch() usko handle kar lega.
    }
};

export default redisClient;