import type { DocumentModel, DocumentSummary } from "../models/document.model.js";

export const listDocuments = async (_workspaceId: string): Promise<DocumentSummary[]> => {
  // TODO: Query documents from PostgreSQL by workspace.
  return [];
};

export const getDocumentById = async (_id: string, _workspaceId: string): Promise<DocumentModel | null> => {
  // TODO: Load document by ID for the workspace.
  return null;
};
