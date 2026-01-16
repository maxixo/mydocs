export interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  content: string;
}

// TODO: Add shared payload types for API and WebSocket events.
