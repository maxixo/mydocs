export type TipTapContent = Record<string, unknown>;

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
  ownerId: string;
  workspaceId: string;
}

export interface DocumentDetail extends DocumentSummary {
  content: TipTapContent;
}

export const fetchDocuments = async (_workspaceId: string): Promise<DocumentSummary[]> => {
  // TODO: call documents API.
  return [];
};

export const fetchDocumentById = async (
  _id: string,
  _workspaceId: string
): Promise<DocumentDetail | null> => {
  // TODO: fetch document details.
  return null;
};
