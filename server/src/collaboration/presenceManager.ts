import { EventEmitter } from "events";

export type PresenceSelection = {
  from: number;
  to: number;
};

export type PresenceCursor = {
  position: number;
  range?: PresenceSelection;
};

export type PresenceEventType = "presence" | "user_joined" | "user_left" | "cursor_update";

export type PresenceUserInfo = {
  id: string;
  name?: string;
  avatar?: string;
};

export type PresenceEvent = {
  documentId: string;
  type: PresenceEventType;
  payload: unknown;
};

export type WebSocketPresenceBroadcast = {
  documentId: string;
  userId: string;
  cursor: PresenceCursor | null;
  selection: PresenceSelection | null;
  eventType: PresenceEventType;
  excludeUserId?: string;
};

type PresenceUser = {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  status: "online" | "offline";
  cursor: PresenceCursor | null;
  lastSeen: number;
};

type DocumentPresence = {
  users: Map<string, PresenceUser>;
  connections: Map<string, number>;
  disconnectTimers: Map<string, NodeJS.Timeout>;
  cleanupTimers: Map<string, NodeJS.Timeout>;
};

type BroadcastSource = "http" | "ws" | "timeout";

const COLORS = [
  "#f97316",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#06b6d4",
  "#22c55e"
];

const DEFAULT_DISCONNECT_TIMEOUT_MS = 30000;

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const pickColor = (userId: string) => COLORS[hashString(userId) % COLORS.length];

const toCollaborator = (user: PresenceUser) => ({
  id: user.id,
  name: user.name,
  avatar: user.avatar,
  color: user.color
});

const toCursorPosition = (user: PresenceUser) => {
  if (!user.cursor) {
    return null;
  }

  return {
    userId: user.id,
    position: user.cursor.position,
    range: user.cursor.range
  };
};

export class PresenceManager {
  private emitter = new EventEmitter();
  private documents = new Map<string, DocumentPresence>();
  private disconnectTimeoutMs = DEFAULT_DISCONNECT_TIMEOUT_MS;
  private webSocketBroadcaster: ((payload: WebSocketPresenceBroadcast) => void) | null = null;

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  setWebSocketBroadcaster(handler: (payload: WebSocketPresenceBroadcast) => void) {
    this.webSocketBroadcaster = handler;
  }

  subscribe(documentId: string, handler: (event: PresenceEvent) => void) {
    const key = this.getEventKey(documentId);
    this.emitter.on(key, handler);
    return () => {
      this.emitter.off(key, handler);
    };
  }

  registerConnection(documentId: string, userId: string) {
    const documentPresence = this.getDocumentPresence(documentId);
    const current = documentPresence.connections.get(userId) ?? 0;
    documentPresence.connections.set(userId, current + 1);
    this.clearDisconnectTimer(documentId, userId);
  }

  unregisterConnection(documentId: string, userId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    const current = (documentPresence.connections.get(userId) ?? 1) - 1;
    if (current <= 0) {
      documentPresence.connections.delete(userId);
      this.scheduleDisconnect(documentId, userId);
    } else {
      documentPresence.connections.set(userId, current);
    }
  }

  getPresenceSnapshot(documentId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return { users: [], cursors: [] };
    }

    const users = Array.from(documentPresence.users.values())
      .filter((user) => user.status === "online")
      .map(toCollaborator);

    const cursors = Array.from(documentPresence.users.values())
      .filter((user) => user.status === "online")
      .map(toCursorPosition)
      .filter((cursor): cursor is NonNullable<typeof cursor> => Boolean(cursor));

    return { users, cursors };
  }

  joinUser(
    documentId: string,
    userInfo: PresenceUserInfo,
    cursor?: PresenceCursor | null,
    source: BroadcastSource = "http"
  ) {
    const { user, wasOnline, documentPresence } = this.upsertUser(documentId, userInfo);

    if (cursor) {
      user.cursor = cursor;
    }

    this.clearDisconnectTimer(documentId, user.id);
    this.clearCleanupTimer(documentId, user.id);

    if (!wasOnline) {
      this.emitEvent(documentId, "user_joined", {
        user: toCollaborator(user),
        cursor: toCursorPosition(user)
      });
    } else if (cursor) {
      this.emitCursorUpdate(documentId, user);
    }

    this.broadcastToWebSocket(documentId, user, "user_joined", source);

    if ((documentPresence.connections.get(user.id) ?? 0) === 0) {
      this.scheduleDisconnect(documentId, user.id);
    }
  }

  leaveUser(documentId: string, userId: string, source: BroadcastSource = "http") {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    const user = documentPresence.users.get(userId);
    if (!user) {
      return;
    }

    if (user.status === "offline") {
      return;
    }

    user.status = "offline";
    user.cursor = null;
    user.lastSeen = Date.now();
    documentPresence.users.set(userId, user);

    this.emitEvent(documentId, "user_left", { userId });
    this.broadcastToWebSocket(documentId, user, "user_left", source);

    this.clearDisconnectTimer(documentId, userId);
    this.scheduleCleanup(documentId, userId);
  }

  updateCursor(
    documentId: string,
    userInfo: PresenceUserInfo,
    cursor: PresenceCursor,
    source: BroadcastSource = "http"
  ) {
    const { user, wasOnline, documentPresence } = this.upsertUser(documentId, userInfo);
    user.cursor = cursor;
    user.lastSeen = Date.now();
    user.status = "online";

    this.clearDisconnectTimer(documentId, user.id);
    this.clearCleanupTimer(documentId, user.id);

    if (!wasOnline) {
      this.emitEvent(documentId, "user_joined", {
        user: toCollaborator(user),
        cursor: toCursorPosition(user)
      });
    }

    this.emitCursorUpdate(documentId, user);
    this.broadcastToWebSocket(documentId, user, "cursor_update", source);

    if ((documentPresence.connections.get(user.id) ?? 0) === 0) {
      this.scheduleDisconnect(documentId, user.id);
    }
  }

  updateSelection(
    documentId: string,
    userInfo: PresenceUserInfo,
    selection: PresenceSelection,
    source: BroadcastSource = "http"
  ) {
    const cursor: PresenceCursor = {
      position: selection.to,
      range: selection
    };
    this.updateCursor(documentId, userInfo, cursor, source);
  }

  handleWebSocketPresenceUpdate(payload: {
    documentId: string;
    userInfo: PresenceUserInfo;
    cursor: { x: number; y: number } | null;
    selection: { anchor: number; head: number } | null;
  }) {
    const { documentId, userInfo, cursor, selection } = payload;

    if (selection) {
      const normalized = {
        from: selection.anchor,
        to: selection.head
      };
      this.updateSelection(documentId, userInfo, normalized, "ws");
      return;
    }

    if (cursor) {
      this.updateCursor(
        documentId,
        userInfo,
        {
          position: cursor.x
        },
        "ws"
      );
    }
  }

  handleDisconnect(documentId: string, userId: string) {
    this.scheduleDisconnect(documentId, userId);
  }

  private emitCursorUpdate(documentId: string, user: PresenceUser) {
    const cursor = toCursorPosition(user);
    if (!cursor) {
      return;
    }

    this.emitEvent(documentId, "cursor_update", {
      userId: user.id,
      position: cursor
    });
  }

  private broadcastToWebSocket(
    documentId: string,
    user: PresenceUser,
    eventType: PresenceEventType,
    source: BroadcastSource
  ) {
    if (!this.webSocketBroadcaster || source === "ws") {
      return;
    }

    const selection = user.cursor?.range ?? null;

    this.webSocketBroadcaster({
      documentId,
      userId: user.id,
      cursor: user.cursor,
      selection,
      eventType,
      excludeUserId: user.id
    });
  }

  private upsertUser(documentId: string, userInfo: PresenceUserInfo) {
    const documentPresence = this.getDocumentPresence(documentId);
    const existing = documentPresence.users.get(userInfo.id);
    const wasOnline = existing?.status === "online";
    const now = Date.now();

    const next: PresenceUser = {
      id: userInfo.id,
      name: userInfo.name ?? existing?.name ?? "Anonymous",
      avatar: userInfo.avatar ?? existing?.avatar,
      color: existing?.color ?? pickColor(userInfo.id),
      status: "online",
      cursor: existing?.cursor ?? null,
      lastSeen: now
    };

    documentPresence.users.set(userInfo.id, next);

    return { user: next, wasOnline, documentPresence };
  }

  private getDocumentPresence(documentId: string): DocumentPresence {
    const existing = this.documents.get(documentId);
    if (existing) {
      return existing;
    }

    const next: DocumentPresence = {
      users: new Map(),
      connections: new Map(),
      disconnectTimers: new Map(),
      cleanupTimers: new Map()
    };

    this.documents.set(documentId, next);
    return next;
  }

  private scheduleDisconnect(documentId: string, userId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    if (documentPresence.disconnectTimers.has(userId)) {
      return;
    }

    const timer = setTimeout(() => {
      const currentDoc = this.documents.get(documentId);
      if (!currentDoc) {
        return;
      }

      currentDoc.disconnectTimers.delete(userId);

      if ((currentDoc.connections.get(userId) ?? 0) > 0) {
        return;
      }

      const user = currentDoc.users.get(userId);
      if (!user || user.status === "offline") {
        return;
      }

      this.leaveUser(documentId, userId, "timeout");
    }, this.disconnectTimeoutMs);

    documentPresence.disconnectTimers.set(userId, timer);
  }

  private scheduleCleanup(documentId: string, userId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    if (documentPresence.cleanupTimers.has(userId)) {
      return;
    }

    const timer = setTimeout(() => {
      const currentDoc = this.documents.get(documentId);
      if (!currentDoc) {
        return;
      }

      currentDoc.cleanupTimers.delete(userId);

      const user = currentDoc.users.get(userId);
      if (!user || user.status === "online") {
        return;
      }

      currentDoc.users.delete(userId);

      if (currentDoc.users.size === 0 && currentDoc.connections.size === 0) {
        this.documents.delete(documentId);
      }
    }, this.disconnectTimeoutMs);

    documentPresence.cleanupTimers.set(userId, timer);
  }

  private clearDisconnectTimer(documentId: string, userId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    const timer = documentPresence.disconnectTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      documentPresence.disconnectTimers.delete(userId);
    }
  }

  private clearCleanupTimer(documentId: string, userId: string) {
    const documentPresence = this.documents.get(documentId);
    if (!documentPresence) {
      return;
    }

    const timer = documentPresence.cleanupTimers.get(userId);
    if (timer) {
      clearTimeout(timer);
      documentPresence.cleanupTimers.delete(userId);
    }
  }

  private emitEvent(documentId: string, type: PresenceEventType, payload: unknown) {
    this.emitter.emit(this.getEventKey(documentId), {
      documentId,
      type,
      payload
    });
  }

  private getEventKey(documentId: string) {
    return `presence:${documentId}`;
  }
}

export const presenceManager = new PresenceManager();
