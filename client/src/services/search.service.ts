import type { DocumentDetail, DocumentSummary } from "./document.service";
import { fetchDocumentById, fetchDocuments } from "./document.service";
import { indexDocument, searchDocumentsLocal, type SearchResult } from "../offline/searchIndex";

const hydratedWorkspaces = new Set<string>();

const hydrateWorkspaceIndex = async (workspaceId: string, documents: DocumentSummary[]) => {
  const detailResults = await Promise.all(
    documents.map(async (doc) => {
      try {
        return await fetchDocumentById(doc.id, workspaceId);
      } catch {
        return null;
      }
    })
  );

  const details = detailResults.filter(Boolean) as DocumentDetail[];
  await Promise.all(details.map((doc) => indexDocument(doc)));
};

export const searchDocumentsWithFallback = async (
  workspaceId: string,
  query: string
): Promise<{ results: SearchResult[]; source: "local" | "remote" }> => {
  const localResults = await searchDocumentsLocal(workspaceId, query);
  if (localResults.length > 0) {
    return { results: localResults, source: "local" };
  }

  if (!hydratedWorkspaces.has(workspaceId)) {
    try {
      const documents = await fetchDocuments(workspaceId);
      if (documents.length > 0) {
        await hydrateWorkspaceIndex(workspaceId, documents);
      }
      hydratedWorkspaces.add(workspaceId);
    } catch {
      // Ignore remote failures; return local results below.
    }
  }

  const remoteResults = await searchDocumentsLocal(workspaceId, query);
  return { results: remoteResults, source: "remote" };
};
