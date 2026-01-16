import { Pool } from "pg";
import { env } from "./env.js";

const dbConfig = env.databaseUrl ? { connectionString: env.databaseUrl } : {};

export const db = new Pool(dbConfig);

export const checkDatabaseConnection = async () => {
  // TODO: Implement database health check.
  return true;
};
