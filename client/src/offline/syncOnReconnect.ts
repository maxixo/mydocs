type SyncCallbacks = {
  flushQueue?: () => Promise<void> | void;
  resync?: () => Promise<void> | void;
  onSync?: () => Promise<void> | void;
  onError?: (error: unknown) => void;
};

export const syncOnReconnect = (callbacks: SyncCallbacks | (() => void)) => {
  const handlers: SyncCallbacks =
    typeof callbacks === "function" ? { onSync: callbacks } : callbacks;

  const runSync = async () => {
    try {
      if (handlers.flushQueue) {
        await handlers.flushQueue();
      }
      if (handlers.resync) {
        await handlers.resync();
      }
      if (handlers.onSync) {
        await handlers.onSync();
      }
    } catch (error) {
      handlers.onError?.(error);
    }
  };

  const handler = () => {
    if (!navigator.onLine) {
      return;
    }
    void runSync();
  };

  window.addEventListener("online", handler);

  return () => {
    window.removeEventListener("online", handler);
  };
};
