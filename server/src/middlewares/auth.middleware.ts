import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth.js";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
}

type SessionPayload = {
  session?: {
    userId?: string;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      image?: string;
    };
  };
  user?: {
    id?: string;
    email?: string;
    name?: string;
    image?: string;
  };
};

export const getSessionUser = async (req: Request) => {
  const baseUrl = env.authBaseUrl || `${req.protocol}://${req.get("host")}`;
  const url = new URL("/api/auth/get-session", baseUrl);
  const headers = new Headers();
  const cookieHeader = req.header("cookie");
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }

  const response = await auth.handler(
    new Request(url.toString(), {
      method: "GET",
      headers
    })
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as SessionPayload;
  const user = payload.user ?? payload.session?.user;
  const userId = user?.id ?? payload.session?.userId;

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    email: user?.email,
    name: user?.name,
    image: user?.image
  };
};

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
