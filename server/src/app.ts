import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./api/auth.routes.js";
import { documentRoutes } from "./api/document.routes.js";
import { userRoutes } from "./api/user.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/documents", documentRoutes);
  app.use("/api/users", userRoutes);

  app.use(errorMiddleware);

  return app;
};
