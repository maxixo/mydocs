import type { Server } from "http";
import { WebSocketServer } from "ws";
import { registerDocumentSocket } from "./documentSocket.js";
import { registerPresenceSocket } from "./presenceSocket.js";
import { logger } from "../utils/logger.js";

export const initWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({
    server,
    path: "/ws"
  });

  wss.on("connection", (socket) => {
    // TODO: Authenticate socket and join rooms.
    registerDocumentSocket(socket);
    registerPresenceSocket(socket);
  });

  logger.info("WebSocket server initialized");

  return wss;
};
