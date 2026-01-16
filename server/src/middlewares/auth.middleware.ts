import type { Request, Response, NextFunction } from "express";

export const authMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // TODO: Validate JWT and attach user context.
  next();
};
