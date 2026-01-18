import type { Awareness } from "y-protocols/awareness";

export interface AwarenessState {
  userId: string;
  name: string;
  color: string;
}

type AwarenessUserState = {
  user?: AwarenessState;
};

export const createAwareness = (awareness: Awareness) => {
  return {
    setLocalState: (state: AwarenessState) => {
      awareness.setLocalStateField("user", state);
    },
    getLocalState: (): AwarenessState | null => {
      const current = awareness.getLocalState() as AwarenessUserState | null;
      return current?.user ?? null;
    },
    onChange: (handler: (...args: unknown[]) => void) => {
      awareness.on("change", handler);
      return () => awareness.off("change", handler);
    }
  };
};
