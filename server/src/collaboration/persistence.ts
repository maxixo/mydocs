export const createPersistenceAdapter = () => {
  return {
    saveDocument: async (_documentId: string) => {
      // TODO: Persist Yjs document state to PostgreSQL.
    },
    loadDocument: async (_documentId: string) => {
      // TODO: Load Yjs document state from PostgreSQL.
      return null;
    }
  };
};
