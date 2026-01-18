import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { getWebSocketManager, type WebSocketManager } from "../websocket/socket.js";

/**
 * Y.js WebSocket provider
 * Syncs Y.js document state via custom WebSocket connection
 */
export class YjsWebSocketProvider {
  private doc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private wsManager: WebSocketManager;
  private documentId: string;

  constructor(
    documentId: string,
    wsUrl: string,
    wsManager: WebSocketManager
  ) {
    this.documentId = documentId;
    this.wsManager = wsManager;
    
    // Create Y.js document
    this.doc = new Y.Doc();

    // Initialize WebSocket provider
    this.initProvider(wsUrl);
  }

  /**
   * Initialize Y.js WebSocket provider
   */
  private initProvider(wsUrl: string): void {
    // Create custom WebSocket transport that uses our WebSocketManager
    const customWebsocket = {
      onclose: null as (() => void) | null,
      onerror: null as ((event: Event) => void) | null,
      onmessage: null as ((event: MessageEvent) => void) | null,
      onopen: null as (() => void) | null,
      readyState: 0,

      send: (data: string | ArrayBuffer | Blob) => {
        // Forward Y.js binary data through our WebSocketManager
        // Note: This is a simplified version - in production you'd want proper Y.js protocol handling
        console.log("Y.js data to send:", data);
        // For now, we'll rely on the API for persistence and use WebSocket for presence
      },

      close: () => {
        // Close WebSocket connection
        this.wsManager.disconnect();
      },

      // Mock WebSocket properties
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    // For now, we'll use a simple approach:
    // 1. Use WebSocketManager for real-time events (presence, sync requests)
    // 2. Use API calls for document persistence
    // 3. Y.js handles local state and CRDT operations

    console.log("Y.js provider initialized for document:", this.documentId);
  }

  /**
   * Get the Y.js document
   */
  getDocument(): Y.Doc {
    return this.doc;
  }

  /**
   * Get a Y.js Map for the document content
   */
  getContentMap(): Y.Map<any> {
    return this.doc.getMap("content");
  }

  /**
   * Destroy the provider and clean up
   */
  destroy(): void {
    if (this.provider) {
      this.provider.destroy();
      this.provider = null;
    }
    this.doc.destroy();
  }
}

/**
 * Create or get an existing Y.js provider for a document
 */
const providers = new Map<string, YjsWebSocketProvider>();

export const getYjsProvider = (
  documentId: string,
  wsUrl: string,
  wsManager: WebSocketManager
): YjsWebSocketProvider => {
  if (!providers.has(documentId)) {
    const provider = new YjsWebSocketProvider(documentId, wsUrl, wsManager);
    providers.set(documentId, provider);
  }
  return providers.get(documentId)!;
};

/**
 * Destroy a Y.js provider for a document
 */
export const destroyYjsProvider = (documentId: string): void => {
  const provider = providers.get(documentId);
  if (provider) {
    provider.destroy();
    providers.delete(documentId);
  }
};