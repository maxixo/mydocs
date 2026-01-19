import * as Y from "yjs";
import { db } from "../config/db.js";
import { logger } from "../utils/logger.js";

type PersistenceOptions = {
  saveIntervalMs?: number;
  saveDebounceMs?: number;
};

type BoundDocument = {
  flush: () => Promise<void>;
  destroy: () => void;
};

const toUint8Array = (value: unknown): Uint8Array | null => {
  if (!value) {
    return null;
  }
  if (value instanceof Uint8Array) {
    return value;
  }
  if (Buffer.isBuffer(value)) {
    return new Uint8Array(value);
  }
  return null;
};

export const createPersistenceAdapter = (options?: PersistenceOptions) => {
  const saveIntervalMs = options?.saveIntervalMs ?? 30000;
  const saveDebounceMs = options?.saveDebounceMs ?? 2000;

  const saveDocument = async (documentId: string, doc: Y.Doc): Promise<void> => {
    const update = Y.encodeStateAsUpdate(doc);
    await db.query(
      `
        INSERT INTO document_snapshots (document_id, state, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (document_id)
        DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
      `,
      [documentId, Buffer.from(update)]
    );
  };

  const loadDocument = async (documentId: string, doc?: Y.Doc): Promise<Uint8Array | null> => {
    const { rows } = await db.query(
      "SELECT state FROM document_snapshots WHERE document_id = $1",
      [documentId]
    );

    if (rows.length === 0) {
      return null;
    }

    const update = toUint8Array(rows[0]?.state);
    if (!update) {
      return null;
    }

    if (doc) {
      Y.applyUpdate(doc, update);
    }

    return update;
  };

  const bindDocument = (documentId: string, doc: Y.Doc): BoundDocument => {
    let idleTimer: NodeJS.Timeout | null = null;
    let intervalTimer: NodeJS.Timeout | null = null;
    let saveInFlight = false;
    let saveQueued = false;

    const runSave = async () => {
      if (saveInFlight) {
        saveQueued = true;
        return;
      }

      saveInFlight = true;
      try {
        await saveDocument(documentId, doc);
      } catch (error) {
        logger.error(`Failed to persist Yjs snapshot for ${documentId}`, error);
      } finally {
        saveInFlight = false;
        if (saveQueued) {
          saveQueued = false;
          void runSave();
        }
      }
    };

    const scheduleIdleSave = () => {
      if (saveDebounceMs <= 0) {
        void runSave();
        return;
      }

      if (idleTimer) {
        clearTimeout(idleTimer);
      }

      idleTimer = setTimeout(() => {
        idleTimer = null;
        void runSave();
      }, saveDebounceMs);
    };

    const handleUpdate = () => {
      scheduleIdleSave();
    };

    void loadDocument(documentId, doc).catch((error) => {
      logger.error(`Failed to load Yjs snapshot for ${documentId}`, error);
    });

    doc.on("update", handleUpdate);

    if (saveIntervalMs > 0) {
      intervalTimer = setInterval(() => {
        void runSave();
      }, saveIntervalMs);
    }

    return {
      flush: async () => {
        if (idleTimer) {
          clearTimeout(idleTimer);
          idleTimer = null;
        }
        await runSave();
      },
      destroy: () => {
        doc.off("update", handleUpdate);
        if (idleTimer) {
          clearTimeout(idleTimer);
          idleTimer = null;
        }
        if (intervalTimer) {
          clearInterval(intervalTimer);
          intervalTimer = null;
        }
      }
    };
  };

  return {
    saveDocument,
    loadDocument,
    bindDocument
  };
};
