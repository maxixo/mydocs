import { Router } from "express";

export const userRoutes = Router();

userRoutes.get("/", (_req, res) => {
  res.json({ message: "list users placeholder" });
});

userRoutes.get("/:id", (req, res) => {
  res.json({ message: "get user placeholder", id: req.params.id });
});
