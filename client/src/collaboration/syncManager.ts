import type { AwarenessState } from "./awareness";
import { createAwareness } from "./awareness";
import type { YjsProvider } from "./yjsProvider";

export interface SyncManager {
  start: () => void;
  stop: () => void;
}

type SyncManagerOptions = {
  user?: AwarenessState;
  onAwarenessChange?: (users: AwarenessState[]) => void;
};

export const createSyncManager = (
  provider: YjsProvider,
  options?: SyncManagerOptions
): SyncManager => {
  const awareness = createAwareness(provider.awareness);
  let disposeAwareness: (() => void) | null = null;

  const handleAwarenessChange = () => {
    if (!options?.onAwarenessChange) {
      return;
    }
    const states = Array.from(provider.awareness.getStates().values()) as Array<{
      user?: AwarenessState;
    }>;
    const users = states.map((state) => state.user).filter(Boolean) as AwarenessState[];
    options.onAwarenessChange(users);
  };

  return {
    start: () => {
      provider.connect();
      if (options?.user) {
        awareness.setLocalState(options.user);
      }
      disposeAwareness = awareness.onChange(handleAwarenessChange);
    },
    stop: () => {
      if (disposeAwareness) {
        disposeAwareness();
        disposeAwareness = null;
      }
      provider.disconnect();
    }
  };
};
