import { Router } from "express";

export const documentRoutes = Router();

documentRoutes.get("/", (_req, res) => {
  res.json({ message: "list documents placeholder" });
});

documentRoutes.post("/", (_req, res) => {
  res.json({ message: "create document placeholder" });
});

documentRoutes.get("/:id", (req, res) => {
  res.json({ message: "get document placeholder", id: req.params.id });
});
