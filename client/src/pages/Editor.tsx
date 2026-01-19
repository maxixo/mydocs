import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { JSONContent } from "@tiptap/core";
import { EditorSurface } from "../editor/Editor";
import { useDocument } from "../hooks/useDocument";
import { createDocument } from "../services/document.service";
import { searchDocumentsWithFallback } from "../services/search.service";
import { indexDocument, type SearchResult } from "../offline/searchIndex";
import { debounce } from "../utils/debounce";
import { EMPTY_TIPTAP_DOC } from "../utils/tiptapContent";
import { connectWebSocket, type WebSocketManager } from "../websocket/socket.js";
import { ClientEvent } from "@shared/events";
import type { ServerSyncResponsePayload, ServerPresenceBroadcastPayload } from "@shared/types";

export const Editor = () => {
  const emptyContent: JSONContent = EMPTY_TIPTAP_DOC;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId") ?? "default";
  const { document, updateDocument, loading, error, saveStatus } = useDocument(id, workspaceId);
  const documentRef = useRef(document);
  const updateDocumentRef = useRef(updateDocument);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editorStats, setEditorStats] = useState({ wordCount: 0, charCount: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "local" | "remote">("idle");
  const fallbackTitle = id ? id.replace(/-/g, " ") : "Untitled document";
  const docTitle = document?.title ?? fallbackTitle;
  const displayTitle = docTitle.trim().length > 0 ? docTitle : "Untitled document";
  const shouldFocusTitle = Boolean((location.state as { focusTitle?: boolean } | null)?.focusTitle);
  const saveLabel = saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Error" : "Saved";
  const saveIcon = saveStatus === "saving" ? "cloud_upload" : saveStatus === "error" ? "error" : "cloud_done";
  const saveClass = saveStatus === "error" ? "text-red-500" : "text-[#4c4d9a]";

  useEffect(() => {
    documentRef.current = document;
  }, [document]);

  useEffect(() => {
    updateDocumentRef.current = updateDocument;
  }, [updateDocument]);

  const debouncedYjsIndexUpdate = useMemo(
    () =>
      debounce((payload: { id: string; title: string; workspaceId: string; content: JSONContent }) => {
        void indexDocument({
          ...payload,
          updatedAt: new Date().toISOString()
        });
      }, 500),
    [indexDocument]
  );

  const handleContentChange = useCallback((nextContent: JSONContent) => {
    const currentDocument = documentRef.current;
    if (!currentDocument) {
      return;
    }

    const nextDocument = {
      ...currentDocument,
      content: nextContent as Record<string, unknown>,
      updatedAt: new Date().toISOString()
    };

    documentRef.current = nextDocument;
    updateDocumentRef.current(nextDocument);
  }, []);

  const handleYjsUpdate = useCallback(
    (nextContent: JSONContent) => {
      const currentDocument = documentRef.current;
      if (!currentDocument) {
        return;
      }

      const documentId = currentDocument.id ?? id;
      if (!documentId) {
        return;
      }

      debouncedYjsIndexUpdate({
        id: documentId,
        title: currentDocument.title ?? "",
        workspaceId: currentDocument.workspaceId ?? workspaceId,
        content: nextContent
      });
    },
    [debouncedYjsIndexUpdate, id, workspaceId]
  );

  const handleTitleChange = useCallback((nextTitle: string) => {
    const currentDocument = documentRef.current;
    if (!currentDocument) {
      return;
    }

    const nextDocument = {
      ...currentDocument,
      title: nextTitle,
      updatedAt: new Date().toISOString()
    };

    documentRef.current = nextDocument;
    updateDocumentRef.current(nextDocument);
  }, []);

  const handleCreateDocument = useCallback(async () => {
    if (isCreating) {
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const created = await createDocument({
        title: "Untitled document",
        content: emptyContent as Record<string, unknown>,
        workspaceId
      });

      navigate(`/editor/${encodeURIComponent(created.id)}?workspaceId=${encodeURIComponent(workspaceId)}`, {
        state: { focusTitle: true }
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create document");
    } finally {
      setIsCreating(false);
    }
  }, [emptyContent, isCreating, navigate, workspaceId]);

  const documentId = document?.id ?? id ?? null;
  const editorContent = (document?.content as JSONContent) ?? emptyContent;
  const isEditable = Boolean(document) && !loading && !error;
  const searchActive = searchQuery.trim().length > 0;

  // WebSocket and collaboration state
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  // Initialize WebSocket connection for collaboration
  useEffect(() => {
    if (!documentId) return;

    // Get WebSocket URL from environment or use default
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;

    // Connect to WebSocket with event handlers
    const manager = connectWebSocket(wsUrl, {
      onReady: (payload) => {
        console.log("WebSocket ready:", payload);
      },
      onSyncResponse: (payload: ServerSyncResponsePayload) => {
        console.log("Document synced:", payload.document);
      },
      onPresenceBroadcast: (payload: ServerPresenceBroadcastPayload) => {
        console.log("Presence update:", payload.presence);
      },
      onError: (payload) => {
        console.error("WebSocket error:", payload);
      }
    });

    wsManagerRef.current = manager;

    // Join document room when connected
    const checkConnection = setInterval(() => {
      if (manager.isConnected() && documentId && workspaceId) {
        manager.send(ClientEvent.DocumentOpen, {
          documentId,
          workspaceId
        });
        clearInterval(checkConnection);
      }
    }, 100);

    return () => {
      clearInterval(checkConnection);
    };
  }, [documentId, workspaceId]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !workspaceId) {
      setSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    let isActive = true;
    const timeoutId = window.setTimeout(async () => {
      setSearchStatus("loading");
      const { results, source } = await searchDocumentsWithFallback(workspaceId, trimmed);
      if (!isActive) {
        return;
      }
      setSearchResults(results);
      setSearchStatus(source);
    }, 200);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, workspaceId]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="editor-view bg-background-light text-[#0d0e1b] dark:bg-background-dark dark:text-[#f8f8fc] font-['Inter',_sans-serif]">
      <div className="flex h-screen overflow-hidden">
        <aside className="flex w-64 flex-col shrink-0 border-r border-[#e7e7f3] bg-background-light dark:border-[#2d2e4a] dark:bg-background-dark">
          <div className="flex h-full flex-col gap-6 p-4">
            <div className="flex flex-col">
              <h1 className="text-base font-bold leading-normal text-[#0d0e1b] dark:text-white">Workspace</h1>
              <p className="text-sm font-normal text-[#4c4d9a] dark:text-[#8a8bbd]">Collaborative Team</p>
            </div>

            <button
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              type="button"
              onClick={handleCreateDocument}
              disabled={isCreating}
            >
              <span className="material-symbols-outlined">add</span>
              <span>{isCreating ? "Creating..." : "New Document"}</span>
            </button>
            {createError ? <p className="text-xs text-red-500">{createError}</p> : null}

            <div className="relative">
              <label className="flex h-10 w-full items-center gap-2 rounded-lg border border-transparent bg-[#e7e7f3] px-3 transition-all focus-within:border-primary/50 dark:bg-[#1c1d3a]">
                <span className="material-symbols-outlined text-[#4c4d9a]">search</span>
                <input
                  className="w-full bg-transparent text-sm placeholder:text-[#4c4d9a] focus:border-none focus:ring-0"
                  placeholder="Search docs..."
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <span className="rounded border border-[#4c4d9a]/30 px-1 text-[10px] font-bold text-[#4c4d9a]">K</span>
              </label>
            </div>

            <nav className="flex flex-grow flex-col gap-1 overflow-y-auto">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-[#4c4d9a]">
                Navigation
              </p>
              <Link
                className="flex items-center gap-3 rounded-lg bg-[#e7e7f3] px-3 py-2 text-[#0d0e1b] dark:bg-[#1c1d3a] dark:text-white"
                to="/editor/recent"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  schedule
                </span>
                <span className="text-sm font-medium">Recent</span>
              </Link>
              <a
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] hover:bg-[#e7e7f3]/50 dark:text-[#8a8bbd] dark:hover:bg-[#1c1d3a]/50"
                href="#"
              >
                <span className="material-symbols-outlined">star</span>
                <span className="text-sm font-medium">Starred</span>
              </a>
              <a
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#4c4d9a] hover:bg-[#e7e7f3]/50 dark:text-[#8a8bbd] dark:hover:bg-[#1c1d3a]/50"
                href="#"
              >
                <span className="material-symbols-outlined">folder</span>
                <span className="text-sm font-medium">Collections</span>
              </a>
              <p className="mb-2 mt-6 px-3 text-[11px] font-bold uppercase tracking-wider text-[#4c4d9a]">
                {searchActive ? "Search Results" : "Recent Docs"}
              </p>
              {searchActive ? (
                <div className="flex flex-col gap-1">
                  {searchStatus === "loading" ? (
                    <p className="px-3 py-1.5 text-xs text-[#4c4d9a] dark:text-[#8a8bbd]">Searching...</p>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        key={result.id}
                        className="truncate px-3 py-1.5 text-sm text-[#4c4d9a] hover:text-primary dark:text-[#8a8bbd]"
                        to={`/editor/${encodeURIComponent(result.id)}?workspaceId=${encodeURIComponent(
                          result.workspaceId || workspaceId
                        )}`}
                      >
                        {result.title || "Untitled document"}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-1.5 text-xs text-[#4c4d9a] dark:text-[#8a8bbd]">No matches found</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <a
                    className="truncate px-3 py-1.5 text-sm text-[#4c4d9a] hover:text-primary dark:text-[#8a8bbd]"
                    href="#"
                  >
                    Q4 Roadmap 2023
                  </a>
                  <a
                    className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-[#0d0e1b] dark:text-white"
                    href="#"
                  >
                    <span className="truncate">Product Strategy 2024</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                  </a>
                  <a
                    className="truncate px-3 py-1.5 text-sm text-[#4c4d9a] hover:text-primary dark:text-[#8a8bbd]"
                    href="#"
                  >
                    Meeting Notes: Kickoff
                  </a>
                </div>
              )}
            </nav>

            <div className="flex items-center gap-3 border-t border-[#e7e7f3] pt-4 dark:border-[#2d2e4a]">
              <div
                className="h-9 w-9 rounded-full bg-cover bg-center"
                data-alt="User profile avatar"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBnHAR0qvuS976iJQFGjmdAYzYdSlvwYLTpOonSARtAYONkjK4RjF2WK1Gt3dO3NA9ORMoZmHLsj15sVV7B2QV8aDQBHWcU-m6_PUfujLRiFInzRFwQv2UiuFIsTkF3tmgSCN8BTp0FCleyGtzKHIug7k4eOgxXYbhMGXPPmeRHwMQgA656gELMdfNiLlF7JobK_DSTzuFenfVeHv1IWy8vgvHc1l6AZXzA_OAYDVivz4Fyr0E2bN5c5QrS6mZIp71ZfnUcQl5pxw')"
                }}
              ></div>
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-bold">Alex Rivera</span>
                <span className="text-xs text-[#4c4d9a]">Pro Plan</span>
              </div>
              <button className="material-symbols-outlined ml-auto text-[#4c4d9a]" type="button">
                settings
              </button>
            </div>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col bg-white dark:bg-background-dark">
          <header className="z-20 flex h-16 items-center justify-between border-b border-[#e7e7f3] bg-white/80 px-8 backdrop-blur-md dark:border-[#2d2e4a] dark:bg-background-dark/80">
            <div className="flex flex-col">
              <div className="mb-0.5 flex items-center gap-1.5 text-xs font-medium text-[#4c4d9a]">
                <Link className="transition-colors hover:text-primary" to="/editor/recent">
                  Docs
                </Link>
                <span>/</span>
                <span className="text-[#0d0e1b] capitalize dark:text-[#f8f8fc]">{displayTitle}</span>
              </div>
              <h2 className="text-base font-bold text-[#0d0e1b] capitalize dark:text-white">{displayTitle}</h2>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <div className="flex -space-x-3 overflow-hidden">
                  <div
                    className="inline-block h-8 w-8 rounded-full bg-cover ring-2 ring-white dark:ring-background-dark"
                    data-alt="Collaborator avatar Sarah"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDAL21GUfQ231Ru5rk8S_mo-xrbrpl-ZLv5Aw6psKZrblirort14zYKzFCwyrNmnjlfcrmnXu_p8SgC7Gzf4VpGMb7xBS7taASasSiro8UkEMI1WfD2sFeXp86_Dil-WzvQYwSFtYSXxbRWUUSpaz42aaLo5fsWwH7c74_Dj2N0cbx5YeAr_DJgrKO29xSwmkHscYC2F-WBNP3ANNFKuu_1Q_U-NkHq1qk0mknd1ID-iNXJBY2yzE6k63qKvA0yZm6SemNAww0M_Q')"
                    }}
                  ></div>
                  <div
                    className="inline-block h-8 w-8 rounded-full bg-cover ring-2 ring-white dark:ring-background-dark"
                    data-alt="Collaborator avatar James"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBFeBpDNUHf1uevsEgvpGGdyVmRvDXsQR676z17h_xsmth0aqVpvTZJcrDz7Bj7LpDEFwOY34HkFrAZpHAPU7BDATOwHzGnx4TWkUnKhUFqYuzzP8_HVawmqsRmFdnL4yJbZi3uP1q-jLTHfmePEEyAS-uVGo9kZqCtzUMuvemmmgXoEjDg7VAElc-Q0QlWwSS4WQaT5Ayxa6UXbdkKEaRtHwCAfov5FzVgViNRgbthRonsdcW_8AZnPfRYgZmUT56yPBonUZ9jsw')"
                    }}
                  ></div>
                  <div
                    className="inline-block h-8 w-8 rounded-full bg-cover ring-2 ring-white dark:ring-background-dark"
                    data-alt="Collaborator avatar Maria"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4s-GGjXk6BbIxNjarp3fAtcQxTDn2H1R-Dl-nRDqNoN8FFHWkiDGydIcvesiCRkb3ND33lewAAzqTY97OT-Un46I1H2mOjeIsyojoszgg-Ef5FFbQndGN18z7TntUpu0AOLmeBaIKUvVpyQrKFhc_tvu4AktGZR5jJA45bdQsImtIYsArg6LBESCqvFBJ8dIbzd-bJvUnvE0l_fqXmDkst7ijTHtRprL1CmLQnp8cxYR6OEU1fy5dKd17NwARiL0b801pxCyvOg')"
                    }}
                  ></div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e7e7f3] text-[10px] font-bold text-[#4c4d9a] ring-2 ring-white dark:bg-[#1c1d3a] dark:ring-background-dark">
                    +2
                  </div>
                </div>
              </div>
              <div className="h-6 w-px bg-[#e7e7f3] dark:bg-[#2d2e4a]"></div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg p-2 text-[#4c4d9a] transition-colors hover:bg-background-light dark:hover:bg-[#1c1d3a]"
                  type="button"
                >
                  <span className="material-symbols-outlined">history</span>
                </button>
                <button
                  className="rounded-lg p-2 text-[#4c4d9a] transition-colors hover:bg-background-light dark:hover:bg-[#1c1d3a]"
                  type="button"
                >
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button
                  className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  type="button"
                >
                  <span className="material-symbols-outlined !text-[18px]">share</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </header>

          <div className="editor-grid relative flex-1 overflow-y-auto dark:bg-[#0b0c18]">
            <EditorSurface
              documentId={documentId}
              content={editorContent}
              editable={isEditable}
              onChange={handleContentChange}
              onTitleChange={handleTitleChange}
              onStatsChange={setEditorStats}
              onYjsUpdate={handleYjsUpdate}
              autoFocusTitle={shouldFocusTitle}
              docTitle={docTitle}
              loading={loading}
              error={error}
            />
          </div>

          <footer className="flex h-8 items-center justify-between border-t border-[#e7e7f3] bg-white px-6 text-[10px] font-medium uppercase tracking-widest text-[#4c4d9a] dark:border-[#2d2e4a] dark:bg-background-dark">
            <div className="flex items-center gap-4">
              <span>Characters: {editorStats.charCount.toLocaleString()}</span>
              <span>Words: {editorStats.wordCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                Online
              </span>
              <span className={`flex items-center gap-1 ${saveClass}`} aria-live="polite">
                <span className="material-symbols-outlined !text-xs">{saveIcon}</span>
                {saveLabel}
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
