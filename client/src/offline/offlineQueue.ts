export interface OfflineQueueItem {
  id: string;
  payload: unknown;
}

export const createOfflineQueue = () => {
  const queue: OfflineQueueItem[] = [];

  return {
    enqueue: (item: OfflineQueueItem) => {
      queue.push(item);
    },
    dequeue: (): OfflineQueueItem | undefined => queue.shift(),
    size: () => queue.length
  };
};

// TODO: Persist queue entries to IndexedDB.
