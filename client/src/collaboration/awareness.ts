export interface AwarenessState {
  userId: string;
  name: string;
  color: string;
}

export const createAwareness = () => {
  return {
    setLocalState: (_state: AwarenessState) => {
      // TODO: publish local awareness updates.
    },
    getLocalState: (): AwarenessState | null => {
      return null;
    }
  };
};
