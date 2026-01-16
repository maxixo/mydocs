import { usePresence } from "../hooks/usePresence";

export const Presence = () => {
  const presence = usePresence();

  return (
    <div className="editor-presence">
      <span>Online collaborators: {presence.onlineCount}</span>
    </div>
  );
};
