import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export interface YjsProvider {
  doc: Y.Doc;
  awareness: Awareness;
  connect: () => void;
  disconnect: () => void;
  destroy: () => void;
  isConnected: () => boolean;
}

class LocalYjsProvider implements YjsProvider {
  doc: Y.Doc;
  awareness: Awareness;
  private connected = false;

  constructor() {
    this.doc = new Y.Doc();
    // Ensure the collaboration fragment exists for TipTap bindings.
    this.doc.getXmlFragment("content");
    this.awareness = new Awareness(this.doc);
  }

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    this.awareness.setLocalState(null);
  }

  isConnected(): boolean {
    return this.connected;
  }

  destroy(): void {
    this.disconnect();
    this.doc.destroy();
  }
}

const providers = new Map<string, LocalYjsProvider>();

export const getYjsProvider = (documentId: string): YjsProvider => {
  // Create a new provider for this document
  if (!providers.has(documentId)) {
    providers.set(documentId, new LocalYjsProvider());
  }
  return providers.get(documentId)!;
};

export const destroyYjsProvider = (documentId: string): void => {
  const provider = providers.get(documentId);
  if (!provider) {
    return;
  }
  provider.destroy();
  providers.delete(documentId);
};

// Destroy all providers - useful for cleanup during tests or app shutdown
export const destroyAllYjsProviders = (): void => {
  providers.forEach((provider) => provider.destroy());
  providers.clear();
};
