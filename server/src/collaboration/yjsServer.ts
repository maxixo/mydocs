import type { WebSocket } from "ws";

export const createYjsServer = () => {
  return {
    attach: (_socket: WebSocket) => {
      // TODO: Bind Yjs document updates to socket.
    }
  };
};
