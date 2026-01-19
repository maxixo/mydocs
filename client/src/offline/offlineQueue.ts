import { clearOperations, listOperations, removeOperation, saveOperation } from "./indexedDb";

export interface OfflineQueueItem {
  id: string;
  documentId: string;
  workspaceId?: string;
  payload: unknown;
  createdAt: number;
}

type EnqueueInput = Omit<OfflineQueueItem, "id" | "createdAt"> & {
  id?: string;
  createdAt?: number;
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `op_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const createOfflineQueue = () => {
  return {
    enqueue: async (item: EnqueueInput): Promise<OfflineQueueItem> => {
      const entry: OfflineQueueItem = {
        id: item.id ?? generateId(),
        documentId: item.documentId,
        workspaceId: item.workspaceId,
        payload: item.payload,
        createdAt: item.createdAt ?? Date.now()
      };

      await saveOperation(entry);
      return entry;
    },
    dequeue: async (): Promise<OfflineQueueItem | undefined> => {
      const items = await listOperations();
      const next = items[0];
      if (next) {
        await removeOperation(next.id);
      }
      return next;
    },
    list: async (): Promise<OfflineQueueItem[]> => listOperations(),
    size: async (): Promise<number> => {
      const items = await listOperations();
      return items.length;
    },
    remove: async (id: string): Promise<void> => {
      await removeOperation(id);
    },
    clear: async (): Promise<void> => {
      await clearOperations();
    },
    flush: async (handler: (item: OfflineQueueItem) => Promise<void>): Promise<void> => {
      const items = await listOperations();
      for (const item of items) {
        await handler(item);
        await removeOperation(item.id);
      }
    }
  };
};
