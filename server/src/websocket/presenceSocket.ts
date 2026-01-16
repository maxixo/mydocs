import type { WebSocket } from "ws";

export const registerPresenceSocket = (socket: WebSocket) => {
  socket.on("message", () => {
    // TODO: Handle presence updates.
  });
};
