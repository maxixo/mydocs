import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocumentState } from "../types";
import { fetchDocumentById, updateDocument } from "../services/document.service";
import { debounce } from "../utils/debounce";

const DEFAULT_AUTOSAVE_MS = 1200;

export const useDocument = (documentId?: string, workspaceId?: string) => {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDocument = async () => {
      if (!documentId || !workspaceId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchDocumentById(documentId, workspaceId);
        if (!isMounted) {
          return;
        }

        if (!result) {
          setError("Document not found");
          setDocument(null);
          return;
        }

        setDocument(result);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load document");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId, workspaceId]);

  const debouncedPersist = useMemo(() => {
    return debounce(async (next: DocumentState) => {
      if (!documentId || !workspaceId) {
        return;
      }

      try {
        await updateDocument({
          id: documentId,
          workspaceId,
          title: next.title,
          content: next.content
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save document");
      }
    }, DEFAULT_AUTOSAVE_MS);
  }, [documentId, workspaceId]);

  const updateDocumentState = useCallback(
    (next: DocumentState) => {
      setDocument(next);
      debouncedPersist(next);
    },
    [debouncedPersist]
  );

  return { document, updateDocument: updateDocumentState, loading, error };
};
