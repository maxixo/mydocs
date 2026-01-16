export interface DocumentModel {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export const mapDocumentRow = (_row: unknown): DocumentModel => {
  // TODO: Map database row to document model.
  return {
    id: "",
    title: "",
    content: "",
    updatedAt: new Date().toISOString()
  };
};
