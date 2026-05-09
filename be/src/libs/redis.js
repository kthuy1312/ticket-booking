import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
let redis = null;

if (redisUrl) {
  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1, //mỗi requ chỉ retry 1 lần
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying after 3 times
        return Math.min(times * 50, 2000);
      },
    });

    redis.on("error", (err) => {
      console.warn("Redis Error:", err.message);
      // We don't throw here to allow the app to run without Redis if needed
    });
  } catch (err) {
    console.error("Failed to initialize Redis:", err.message);
  }
} else {
  console.log("REDIS_URL not found. Running without Redis cache/locking.");
}

/**
 * Acquire a distributed lock
 * @param {string} key Lock key
 * @param {number} ttl thời gian sỗng
 * @returns {Promise<boolean>}
 */

//acquireLock = xin quyền xử lý tài nguyên
export const acquireLock = async (key, ttl = 5000) => {
  if (!redis) return true; // Fallback to DB-only safety if Redis is missing

  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, "locked", "PX", ttl, "NX");
  return result === "OK";
};

/**
 * Release a distributed lock
 * @param {string} key Lock key
 */

//releaseLock = trả quyền lại cho hệ thống
export const releaseLock = async (key) => {
  if (!redis) return;
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
};

export default redis;
