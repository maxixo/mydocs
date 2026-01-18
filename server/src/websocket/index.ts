import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { registerDocumentSocket } from "./documentSocket.js";
import { registerPresenceSocket } from "./presenceSocket.js";
import { logger } from "../utils/logger.js";
import { getSessionUser } from "../middlewares/auth.middleware.js";

/**
 * WebSocket connection metadata
 * Stores information about each connected client
 */
interface SocketMetadata {
  userId: string;
  documentId?: string;
  workspaceId?: string;
}

/**
 * Store metadata for each WebSocket connection
 */
const socketMetadata = new Map<WebSocket, SocketMetadata>();

/**
 * Initialize the WebSocket server
 * 
 * This sets up a WebSocket server that:
 * 1. Authenticates connections using Better Auth
 * 2. Stores user information with each socket
 * 3. Routes messages to appropriate handlers
 */
export const initWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws"
  });

  wss.on("connection", async (socket, request) => {
    try {
      // Extract cookies from the HTTP request
      const cookieHeader = request.headers.cookie;

      // Authenticate the WebSocket connection
      const user = await authenticateSocket(request);
      if (!user) {
        socket.send(JSON.stringify({
          type: "server:error",
          payload: { message: "Unauthorized: Please sign in" }
        }));
        socket.close(1008, "Unauthorized");
        return;
      }

      // Store user metadata with this socket
      socketMetadata.set(socket, {
        userId: user.id
      });

      logger.info(`WebSocket connected: ${user.id}`);

      // Register message handlers for this socket
      registerDocumentSocket(socket, socketMetadata);
      registerPresenceSocket(socket, socketMetadata, wss);

      // Send ready confirmation to client
      socket.send(JSON.stringify({
        type: "server:ready",
        payload: {
          serverTime: new Date().toISOString()
        }
      }));

      // Handle socket disconnect
      socket.on("close", () => {
        const metadata = socketMetadata.get(socket);
        if (metadata) {
          logger.info(`WebSocket disconnected: ${metadata.userId}`);
          
          // If user was in a document, notify other users
          if (metadata.documentId) {
            broadcastPresenceLeave(metadata.documentId, metadata.userId, wss);
          }
        }
        socketMetadata.delete(socket);
      });

      // Handle errors
      socket.on("error", (error) => {
        logger.error(`WebSocket error: ${error}`);
      });

    } catch (error) {
      logger.error(`WebSocket connection error: ${error}`);
      socket.close(1011, "Internal Server Error");
    }
  });

  logger.info("WebSocket server initialized on path /ws");

  return wss;
};

/**
 * Authenticate a WebSocket connection
 * Uses the same authentication as HTTP requests
 */
const authenticateSocket = async (request: unknown) => {
  try {
    // Create a fake request object for auth middleware
    const fakeRequest = {
      headers: {
        get: (name: string) => {
          if (name === "cookie") {
            const req = request as { headers?: { cookie?: string } };
            return req.headers?.cookie;
          }
          return undefined;
        }
      }
    };

    const user = await getSessionUser(fakeRequest as any);
    return user;
  } catch (error) {
    logger.error(`WebSocket authentication error: ${error}`);
    return null;
  }
};

/**
 * Broadcast a presence leave message to all users in a document
 */
const broadcastPresenceLeave = (
  documentId: string,
  userId: string,
  wss: WebSocketServer
) => {
  const message = JSON.stringify({
    type: "server:presence_broadcast",
    payload: {
      documentId,
      presence: {
        userId,
        cursor: null,
        selection: null
      }
    }
  });

  wss.clients.forEach((client) => {
    const metadata = socketMetadata.get(client);
    if (metadata && metadata.documentId === documentId && metadata.userId !== userId) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });
};