import { randomUUID } from "crypto";
import { Router } from "express";
import type { DocumentModel } from "../models/document.model.js";
import { authMiddleware, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createDocument,
  getDocumentById,
  listDocuments,
  updateDocument
} from "../services/document.service.js";
import { canEditDocument, getDocumentRole } from "../services/permission.service.js";

export const documentRoutes = Router();

documentRoutes.use(authMiddleware);

documentRoutes.get("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";
    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const userId = req.user?.id ?? "";
    const documents = await listDocuments(workspaceId, userId);
    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

documentRoutes.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id, title, content, workspaceId } = req.body as {
      id?: string;
      title?: string;
      content?: Record<string, unknown>;
      workspaceId?: string;
    };

    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const documentId = typeof id === "string" && id.trim().length > 0 ? id.trim() : randomUUID();
    const document: DocumentModel = {
      id: documentId,
      title: title?.trim() || "Untitled document",
      content: content ?? { type: "doc", content: [] },
      updatedAt: new Date().toISOString(),
      ownerId: req.user?.id ?? "",
      workspaceId
    };

    try {
      const createdDocument = await createDocument(document);
      res.status(201).json({ document: createdDocument });
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === "23505") {
        res.status(409).json({ message: "Document already exists" });
        return;
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

documentRoutes.get("/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";
    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const userId = req.user?.id ?? "";
    const role = await getDocumentRole(userId, req.params.id, workspaceId);
    if (!role) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const document = await getDocumentById(req.params.id, workspaceId, userId);
    if (!document) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json({ document });
  } catch (error) {
    next(error);
  }
});

documentRoutes.patch("/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const workspaceId = typeof req.query.workspaceId === "string" ? req.query.workspaceId : "";
    if (!workspaceId) {
      res.status(400).json({ message: "workspaceId is required" });
      return;
    }

    const { title, content } = req.body as {
      title?: string;
      content?: Record<string, unknown>;
    };

    const userId = req.user?.id ?? "";
    const role = await getDocumentRole(userId, req.params.id, workspaceId);
    if (!canEditDocument(role)) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const updated = await updateDocument({
      id: req.params.id,
      workspaceId,
      title: title?.trim(),
      content
    });

    if (!updated) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    res.json({ document: updated });
  } catch (error) {
    next(error);
  }
});
