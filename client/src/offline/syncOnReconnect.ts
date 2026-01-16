export const syncOnReconnect = (onSync: () => void) => {
  const handler = () => {
    // TODO: flush offline queue and resync state.
    onSync();
  };

  window.addEventListener("online", handler);

  return () => {
    window.removeEventListener("online", handler);
  };
};
