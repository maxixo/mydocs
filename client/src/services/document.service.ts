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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

const parseJson = async <T>(response: Response): Promise<T> => {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      (data as { message?: string }).message ?? "Document request failed";
    throw new Error(message);
  }
  return data;
};

export const fetchDocuments = async (workspaceId: string): Promise<DocumentSummary[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/documents?workspaceId=${encodeURIComponent(workspaceId)}`,
    { credentials: "include" }
  );
  const data = await parseJson<{ documents: DocumentSummary[] }>(response);
  return data.documents ?? [];
};

export const fetchDocumentById = async (
  id: string,
  workspaceId: string
): Promise<DocumentDetail | null> => {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${encodeURIComponent(id)}?workspaceId=${encodeURIComponent(
      workspaceId
    )}`,
    { credentials: "include" }
  );

  if (response.status === 404) {
    return null;
  }

  const data = await parseJson<{ document: DocumentDetail }>(response);
  return data.document ?? null;
};

export const createDocument = async (payload: {
  title?: string;
  content?: TipTapContent;
  workspaceId: string;
}): Promise<DocumentDetail> => {
  const response = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const data = await parseJson<{ document: DocumentDetail }>(response);
  return data.document;
};

export const updateDocument = async (payload: {
  id: string;
  workspaceId: string;
  title?: string;
  content?: TipTapContent;
}): Promise<DocumentDetail> => {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${encodeURIComponent(payload.id)}?workspaceId=${encodeURIComponent(
      payload.workspaceId
    )}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title: payload.title,
        content: payload.content
      })
    }
  );

  const data = await parseJson<{ document: DocumentDetail }>(response);
  return data.document;
};
