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
  private refCount = 1;
  private readonly documentId: string;

  constructor(documentId: string) {
    this.documentId = documentId;
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

  incrementRefCount(): number {
    this.refCount += 1;
    console.log(`[YjsProvider] ${this.documentId} refCount incremented to ${this.refCount}`);
    return this.refCount;
  }

  decrementRefCount(): number {
    this.refCount = Math.max(0, this.refCount - 1);
    console.log(`[YjsProvider] ${this.documentId} refCount decremented to ${this.refCount}`);
    return this.refCount;
  }

  destroy(): void {
    if (this.refCount > 0) {
      console.log(
        `[YjsProvider] ${this.documentId} destroy skipped (refCount=${this.refCount})`
      );
      return;
    }
    this.disconnect();
    this.doc.destroy();
  }

  forceDestroy(): void {
    this.refCount = 0;
    console.log(`[YjsProvider] ${this.documentId} force destroy`);
    this.disconnect();
    this.doc.destroy();
  }
}

const providers = new Map<string, LocalYjsProvider>();

export const getYjsProvider = (documentId: string): YjsProvider => {
  // Create a new provider for this document
  if (!providers.has(documentId)) {
    providers.set(documentId, new LocalYjsProvider(documentId));
    return providers.get(documentId)!;
  }
  const provider = providers.get(documentId)!;
  provider.incrementRefCount();
  return provider;
};

export const resetProvider = (documentId: string): void => {
  const provider = providers.get(documentId);
  if (!provider) {
    return;
  }
  provider.forceDestroy();
  providers.delete(documentId);
};

export const destroyYjsProvider = (documentId: string): void => {
  const provider = providers.get(documentId);
  if (!provider) {
    return;
  }
  const remainingRefs = provider.decrementRefCount();
  if (remainingRefs > 0) {
    return;
  }
  provider.destroy();
  providers.delete(documentId);
};

// Destroy all providers - useful for cleanup during tests or app shutdown
export const destroyAllYjsProviders = (): void => {
  providers.forEach((provider) => provider.forceDestroy());
  providers.clear();
};
