import { createClient } from "redis";
import logger from "../utils/logger.js";

const redisUrl = process.env.REDIS_URL;

const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err) => logger.error("redis client error:", err));
redisClient.on("connect", () => logger.info("redis connection success!"));

await redisClient.connect();

export default redisClient;
