import { Router } from "express";

export const authRoutes = Router();

authRoutes.post("/login", (_req, res) => {
  res.json({ message: "login placeholder" });
});

authRoutes.post("/logout", (_req, res) => {
  res.json({ message: "logout placeholder" });
});

authRoutes.get("/me", (_req, res) => {
  res.json({ message: "current user placeholder" });
});
