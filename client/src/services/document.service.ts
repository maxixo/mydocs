export interface DocumentSummary {
  id: string;
  title: string;
}

export const fetchDocuments = async (): Promise<DocumentSummary[]> => {
  // TODO: call documents API.
  return [];
};

export const fetchDocumentById = async (_id: string): Promise<DocumentSummary | null> => {
  // TODO: fetch document details.
  return null;
};
