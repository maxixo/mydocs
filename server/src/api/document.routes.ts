import { randomUUID } from "crypto";
import { Router } from "express";
import { listDocuments, getDocumentById } from "../services/document.service.js";
import { checkPermission } from "../services/permission.service.js";
import type { DocumentModel } from "../models/document.model.js";

export const documentRoutes = Router();

const getUserId = (headerValue: string | undefined): string => {
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue;
  }
  return "anonymous";
};

documentRoutes.get("/", async (req, res, next) => {
  try {
    const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";
    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const documents = await listDocuments(workspaceId);
    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

documentRoutes.post("/", async (req, res, next) => {
  try {
    const { title, content, workspaceId } = req.body as {
      title?: string;
      content?: Record<string, unknown>;
      workspaceId?: string;
    };

    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const ownerId = getUserId(req.header("x-user-id"));
    const document: DocumentModel = {
      id: randomUUID(),
      title: title?.trim() || "Untitled document",
      content: content ?? { type: "doc", content: [] },
      updatedAt: new Date().toISOString(),
      ownerId,
      workspaceId
    };

    res.status(201).json({ document });
  } catch (error) {
    next(error);
  }
});

documentRoutes.get("/:id", async (req, res, next) => {
  try {
    const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";
    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const userId = getUserId(req.header("x-user-id"));
    const allowed = await checkPermission(userId, req.params.id);
    if (!allowed) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const document = await getDocumentById(req.params.id, workspaceId);
    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json({ document });
  } catch (error) {
    next(error);
  }
});
