export interface AppState {
  activeDocumentId: string | null;
}

export const createInitialState = (): AppState => ({
  activeDocumentId: null
});

export const appState = createInitialState();

// TODO: Replace with a real state management solution.
