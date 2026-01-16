import * as Y from "yjs";

export interface YjsProvider {
  doc: Y.Doc;
  connect: () => void;
  disconnect: () => void;
}

export const createYjsProvider = (): YjsProvider => {
  const doc = new Y.Doc();

  return {
    doc,
    connect: () => {
      // TODO: connect to Yjs WebSocket provider.
    },
    disconnect: () => {
      // TODO: disconnect from provider and cleanup.
    }
  };
};
