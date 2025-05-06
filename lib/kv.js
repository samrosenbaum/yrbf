import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

redis.get = new Proxy(redis.get, {
  apply(target, thisArg, args) {
    console.log("[KV GET]", args);
    return Reflect.apply(target, thisArg, args);
  }
});

export const kv = redis;
