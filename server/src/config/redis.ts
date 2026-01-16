import { createClient } from "redis";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const redisOptions = env.redisUrl ? { url: env.redisUrl } : {};

export const redisClient = createClient(redisOptions);

redisClient.on("error", (error) => {
  logger.error("Redis client error", error);
});

export const connectRedis = async () => {
  // TODO: Connect and initialize Redis client.
};
