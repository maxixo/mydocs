import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DocumentState } from "../types";
import { createDocument, fetchDocumentById, updateDocument } from "../services/document.service";
import { saveDocument as cacheDocument } from "../offline/indexedDb";
import { indexDocument } from "../offline/searchIndex";
import { debounce } from "../utils/debounce";
import { EMPTY_TIPTAP_DOC, sanitizeTipTapContent } from "../utils/tiptapContent";

const DEFAULT_AUTOSAVE_MS = 1200;
const EMPTY_CONTENT = EMPTY_TIPTAP_DOC;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const useDocument = (documentId?: string, workspaceId?: string) => {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveCounterRef = useRef(0);
  const pendingSaveRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadDocument = async () => {
      if (!documentId || !workspaceId) {
        return;
      }

      setLoading(true);
      setError(null);
      setSaveStatus("idle");
      setSaveError(null);

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
          const nextDocument = {
            ...created,
            content: sanitizeTipTapContent(created.content) as DocumentState["content"]
          };
          setDocument(nextDocument);
          void cacheDocument(nextDocument).catch(() => undefined);
          void indexDocument(nextDocument);
          return;
        }

        const nextDocument = {
          ...result,
          content: sanitizeTipTapContent(result.content) as DocumentState["content"]
        };
        setDocument(nextDocument);
        void cacheDocument(nextDocument).catch(() => undefined);
        void indexDocument(nextDocument);
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
    async (next: DocumentState, saveId: number) => {
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
        if (pendingSaveRef.current === saveId) {
          setSaveStatus("saved");
          setSaveError(null);
        }
      } catch (err) {
        if (pendingSaveRef.current === saveId) {
          setSaveStatus("error");
          setSaveError(err instanceof Error ? err.message : "Failed to save document");
        }
      }
    },
    [documentId, workspaceId]
  );

  const debouncedPersist = useMemo(() => {
    return debounce((next: DocumentState, saveId: number) => {
      void persistDocument(next, saveId);
    }, DEFAULT_AUTOSAVE_MS);
  }, [persistDocument]);

  const debouncedIndexUpdate = useMemo(() => {
    return debounce((next: DocumentState) => {
      void indexDocument(next);
    }, DEFAULT_AUTOSAVE_MS);
  }, [indexDocument]);

  const updateDocumentState = useCallback(
    (next: DocumentState) => {
      setDocument(next);
      void cacheDocument(next).catch(() => undefined);
      saveCounterRef.current += 1;
      const saveId = saveCounterRef.current;
      pendingSaveRef.current = saveId;
      setSaveStatus("saving");
      debouncedPersist(next, saveId);
      debouncedIndexUpdate(next);
    },
    [debouncedIndexUpdate, debouncedPersist]
  );

  return {
    document,
    updateDocument: updateDocumentState,
    loading,
    error,
    saveStatus,
    saveError
  };
};
