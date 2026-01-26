import { Router } from "express";
import { authMiddleware, type AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  presenceManager,
  type PresenceCursor,
  type PresenceSelection
} from "../collaboration/presenceManager.js";

export const presenceRoutes = Router();

const KEEPALIVE_INTERVAL_MS = 15000;

const parseCursor = (payload: unknown): PresenceCursor | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as { position?: number; range?: PresenceSelection };
  if (typeof data.position !== "number") {
    return null;
  }

  const cursor: PresenceCursor = {
    position: data.position
  };

  if (
    data.range &&
    typeof data.range.from === "number" &&
    typeof data.range.to === "number"
  ) {
    cursor.range = { from: data.range.from, to: data.range.to };
  }

  return cursor;
};

const parseSelection = (payload: unknown): PresenceSelection | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as { from?: number; to?: number };
  if (typeof data.from !== "number" || typeof data.to !== "number") {
    return null;
  }

  return { from: data.from, to: data.to };
};

presenceRoutes.use(authMiddleware);

presenceRoutes.get("/:documentId", (req: AuthenticatedRequest, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ message: "documentId is required" });
    return;
  }

  const userId = req.user?.id ?? "";
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (event: string, payload: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  presenceManager.registerConnection(documentId, userId);

  sendEvent("presence", presenceManager.getPresenceSnapshot(documentId));

  const unsubscribe = presenceManager.subscribe(documentId, (event) => {
    sendEvent(event.type, event.payload);
  });

  const keepalive = setInterval(() => {
    res.write(`:keepalive ${Date.now()}\n\n`);
  }, KEEPALIVE_INTERVAL_MS);

  req.on("close", () => {
    clearInterval(keepalive);
    unsubscribe();
    presenceManager.unregisterConnection(documentId, userId);
    res.end();
  });
});

presenceRoutes.post("/:documentId/join", (req: AuthenticatedRequest, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ message: "documentId is required" });
    return;
  }

  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const cursor = parseCursor((req.body as { cursor?: PresenceCursor } | undefined)?.cursor);

  presenceManager.joinUser(
    documentId,
    {
      id: user.id,
      name: user.name ?? user.email ?? "Anonymous",
      avatar: user.image
    },
    cursor
  );

  res.json({ presence: presenceManager.getPresenceSnapshot(documentId) });
});

presenceRoutes.post("/:documentId/leave", (req: AuthenticatedRequest, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ message: "documentId is required" });
    return;
  }

  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  presenceManager.leaveUser(documentId, userId);
  res.json({ ok: true });
});

presenceRoutes.post("/:documentId/cursor", (req: AuthenticatedRequest, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ message: "documentId is required" });
    return;
  }

  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const cursor = parseCursor(req.body);
  if (!cursor) {
    res.status(400).json({ message: "cursor position is required" });
    return;
  }

  presenceManager.updateCursor(
    documentId,
    {
      id: user.id,
      name: user.name ?? user.email ?? "Anonymous",
      avatar: user.image
    },
    cursor
  );

  res.json({ ok: true });
});

presenceRoutes.post("/:documentId/selection", (req: AuthenticatedRequest, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ message: "documentId is required" });
    return;
  }

  const user = req.user;
  if (!user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const selection = parseSelection(req.body);
  if (!selection) {
    res.status(400).json({ message: "selection range is required" });
    return;
  }

  presenceManager.updateSelection(
    documentId,
    {
      id: user.id,
      name: user.name ?? user.email ?? "Anonymous",
      avatar: user.image
    },
    selection
  );

  res.json({ ok: true });
});
