import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  authSecret: process.env.AUTH_SECRET ?? process.env.JWT_SECRET ?? "",
  authBaseUrl:
    process.env.AUTH_BASE_URL ?? `http://localhost:${Number(process.env.PORT ?? 4000)}`,
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
};
