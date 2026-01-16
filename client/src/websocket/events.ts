export const WS_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  SYNC_REQUEST: "sync_request",
  SYNC_RESPONSE: "sync_response",
  PRESENCE_UPDATE: "presence_update"
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

// TODO: Replace with shared event contracts.
