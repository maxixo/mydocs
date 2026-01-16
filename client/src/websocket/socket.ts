export interface WebSocketClient {
  socket: WebSocket;
  send: (data: string) => void;
  close: () => void;
}

export const createWebSocketClient = (url: string): WebSocketClient => {
  const socket = new WebSocket(url);

  socket.addEventListener("open", () => {
    // TODO: send auth handshake.
  });

  socket.addEventListener("message", () => {
    // TODO: handle incoming collaboration events.
  });

  socket.addEventListener("close", () => {
    // TODO: handle reconnect strategy.
  });

  return {
    socket,
    send: (data) => socket.send(data),
    close: () => socket.close()
  };
};
