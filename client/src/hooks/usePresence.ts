import { useEffect, useCallback } from "react";
import type { Collaborator, CursorPosition } from "../app/store";
import { useAppStore, actions } from "../app/store";

export const usePresence = (documentId?: string | null) => {
  const { presence, connectionStatus, dispatch } = useAppStore();
  const { collaborators, cursorPositions } = presence;

  const handlePresenceUpdate = useCallback((presenceData: any) => {
    // Update collaborator list from presence broadcast
    if (presenceData.users) {
      presenceData.users.forEach((user: Collaborator) => {
        dispatch(actions.addCollaborator(user));
      });
    }
  }, [dispatch]);

  const handleUserJoined = useCallback((user: Collaborator) => {
    dispatch(actions.addCollaborator(user));
  }, [dispatch]);

  const handleUserLeft = useCallback((userId: string) => {
    dispatch(actions.removeCollaborator(userId));
  }, [dispatch]);

  const handleCursorUpdate = useCallback((update: { userId: string; position: CursorPosition }) => {
    dispatch(actions.updateCursor(update.userId, update.position));
  }, [dispatch]);

  useEffect(() => {
    if (!documentId) {
      return;
    }

    // Subscribe to WebSocket presence events
    const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/presence/${documentId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'presence':
            handlePresenceUpdate(data.payload);
            break;
          case 'user_joined':
            handleUserJoined(data.payload);
            break;
          case 'user_left':
            handleUserLeft(data.payload.userId);
            break;
          case 'cursor_update':
            handleCursorUpdate(data.payload);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Error parsing presence event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Presence SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [documentId, handlePresenceUpdate, handleUserJoined, handleUserLeft, handleCursorUpdate]);

  // Clean up presence when document changes or user goes offline
  useEffect(() => {
    if (connectionStatus === 'offline') {
      dispatch(actions.setPresence({ collaborators: [], cursorPositions: new Map() }));
    }
  }, [connectionStatus, dispatch]);

  return {
    onlineCount: collaborators.length,
    collaborators,
    cursorPositions,
    isOnline: connectionStatus === 'online'
  };
};