import { useEffect, useState } from "react";

export const usePresence = () => {
  const [onlineCount, setOnlineCount] = useState(1);

  useEffect(() => {
    // TODO: subscribe to presence updates from WebSocket.
    return () => {
      // TODO: cleanup presence subscriptions.
    };
  }, []);

  return { onlineCount, setOnlineCount };
};
