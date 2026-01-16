import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.message);
  res.status(500).json({ error: "Internal server error" });
};
