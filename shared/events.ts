export enum ClientEvent {
  Connect = "client:connect",
  Disconnect = "client:disconnect",
  SyncRequest = "client:sync_request",
  PresenceUpdate = "client:presence_update"
}

export enum ServerEvent {
  Ready = "server:ready",
  SyncResponse = "server:sync_response",
  PresenceBroadcast = "server:presence_broadcast",
  Error = "server:error"
}

// TODO: Expand event set as collaboration features are implemented.
