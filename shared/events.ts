import type {
  ClientConnectPayload,
  ClientDocumentMetadataUpdatePayload,
  ClientDocumentOpenPayload,
  ClientPresenceUpdatePayload,
  ClientSyncRequestPayload,
  ServerAccessDeniedPayload,
  ServerErrorPayload,
  ServerPresenceBroadcastPayload,
  ServerReadyPayload,
  ServerSyncResponsePayload
} from "./types.js";

export enum ClientEvent {
  Connect = "client:connect",
  Disconnect = "client:disconnect",
  SyncRequest = "client:sync_request",
  PresenceUpdate = "client:presence_update",
  DocumentOpen = "client:document_open",
  DocumentMetadataUpdate = "client:document_metadata_update"
}

export enum ServerEvent {
  Ready = "server:ready",
  SyncResponse = "server:sync_response",
  PresenceBroadcast = "server:presence_broadcast",
  Error = "server:error",
  AccessDenied = "server:access_denied"
}

export type ClientEventPayloadMap = {
  [ClientEvent.Connect]: ClientConnectPayload;
  [ClientEvent.SyncRequest]: ClientSyncRequestPayload;
  [ClientEvent.PresenceUpdate]: ClientPresenceUpdatePayload;
  [ClientEvent.DocumentOpen]: ClientDocumentOpenPayload;
  [ClientEvent.DocumentMetadataUpdate]: ClientDocumentMetadataUpdatePayload;
};

export type ServerEventPayloadMap = {
  [ServerEvent.Ready]: ServerReadyPayload;
  [ServerEvent.SyncResponse]: ServerSyncResponsePayload;
  [ServerEvent.PresenceBroadcast]: ServerPresenceBroadcastPayload;
  [ServerEvent.Error]: ServerErrorPayload;
  [ServerEvent.AccessDenied]: ServerAccessDeniedPayload;
};
