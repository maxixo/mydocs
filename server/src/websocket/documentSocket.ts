import type { WebSocket } from "ws";

export const registerDocumentSocket = (socket: WebSocket) => {
  socket.on("message", () => {
    // TODO: Apply document updates and broadcast.
  });
};
