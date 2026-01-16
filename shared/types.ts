export interface SharedUser {
  id: string;
  displayName: string;
}

export interface SharedDocument {
  id: string;
  title: string;
  updatedAt: string;
}

export interface PresenceState {
  userId: string;
  cursor: { x: number; y: number } | null;
  selection: { anchor: number; head: number } | null;
}

// TODO: Add shared payload types for WebSocket messages.
