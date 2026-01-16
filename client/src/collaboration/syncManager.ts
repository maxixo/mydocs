export interface SyncManager {
  start: () => void;
  stop: () => void;
}

export const createSyncManager = (): SyncManager => {
  return {
    start: () => {
      // TODO: orchestrate Yjs, WebSocket, and offline sync.
    },
    stop: () => {
      // TODO: stop collaboration sync.
    }
  };
};
