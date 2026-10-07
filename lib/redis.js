import { Redis } from "@upstash/redis";

// Redis is optional. If the keys are missing, every function below quietly does nothing.
const enabled =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = enabled
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function cacheGet(code) {
  if (!redis) return null;
  try {
    return await redis.get(`link:${code}`);
  } catch {
    return null;
  }
}

export async function cacheSet(code, value, ttlSeconds = 3600) {
  if (!redis) return;
  try {
    await redis.set(`link:${code}`, value, { ex: ttlSeconds });
  } catch {}
}
