type PresenceProps = {
  onlineCount: number;
  className?: string;
};

export const Presence = ({ onlineCount, className }: PresenceProps) => {
  if (onlineCount <= 0) {
    return null;
  }

  return (
    <span className={className ?? "editor-presence"}>
      {onlineCount} {onlineCount === 1 ? "collaborator" : "collaborators"} online
    </span>
  );
};
