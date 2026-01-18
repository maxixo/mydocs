import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocumentState } from "../types";
import { createDocument, fetchDocumentById, updateDocument } from "../services/document.service";
import { debounce } from "../utils/debounce";
import { EMPTY_TIPTAP_DOC, sanitizeTipTapContent } from "../utils/tiptapContent";

const DEFAULT_AUTOSAVE_MS = 1200;
const EMPTY_CONTENT = EMPTY_TIPTAP_DOC;

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
          const fallbackTitle = documentId.replace(/-/g, " ");
          const created = await createDocument({
            id: documentId,
            title: fallbackTitle || "Untitled document",
            content: EMPTY_CONTENT,
            workspaceId
          });
          if (!isMounted) {
            return;
          }
          setDocument({
            ...created,
            content: sanitizeTipTapContent(created.content) as DocumentState["content"]
          });
          return;
        }

        setDocument({
          ...result,
          content: sanitizeTipTapContent(result.content) as DocumentState["content"]
        });
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

  const persistDocument = useCallback(
    async (next: DocumentState) => {
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
    },
    [documentId, workspaceId]
  );

  const debouncedPersist = useMemo(() => {
    return debounce((next: DocumentState) => {
      void persistDocument(next);
    }, DEFAULT_AUTOSAVE_MS);
  }, [persistDocument]);

  const updateDocumentState = useCallback(
    (next: DocumentState) => {
      setDocument(next);
      debouncedPersist(next);
    },
    [debouncedPersist]
  );

  return { document, updateDocument: updateDocumentState, loading, error };
};
