import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { createEditorExtensions } from "./editorConfig";
import { Toolbar } from "./Toolbar";
import { getYjsProvider } from "../collaboration/yjsProvider";
import { createSyncManager } from "../collaboration/syncManager";
import { EMPTY_TIPTAP_DOC, sanitizeTipTapContent } from "../utils/tiptapContent";

const DEFAULT_USER = {
  userId: "local-user",
  name: "You",
  color: "#22c55e"
};

type EditorSurfaceProps = {
  documentId?: string | null;
  content: JSONContent;
  editable: boolean;
  onChange: (content: JSONContent) => void;
  docTitle: string;
  onTitleChange: (title: string) => void;
  loading?: boolean;
  error?: string | null;
};

export const EditorSurface = ({
  documentId,
  content,
  editable,
  onChange,
  onTitleChange,
  docTitle,
  loading = false,
  error = null
}: EditorSurfaceProps) => {
  const provider = useMemo(() => {
    if (!documentId) {
      return null;
    }
    return getYjsProvider(documentId);
  }, [documentId]);
  
  const syncManager = useMemo(
    () =>
      provider ? createSyncManager(provider, {
        user: DEFAULT_USER
      }) : null,
    [provider]
  );
  const onChangeRef = useRef(onChange);
  const lastHydratedKey = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: createEditorExtensions(
      provider
        ? {
            collaboration: {
              doc: provider.doc,
              awareness: provider.awareness,
              user: DEFAULT_USER
            }
          }
        : undefined
    ),
    content: EMPTY_TIPTAP_DOC,
    editable,
    onUpdate: ({ editor: editorInstance }) => {
      const nextContent = editorInstance.getJSON() as JSONContent;
      onChangeRef.current(nextContent);
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const hydrationKey = documentId ?? "local";
    if (lastHydratedKey.current === hydrationKey) {
      return;
    }

    const safeContent = sanitizeTipTapContent(content ?? EMPTY_TIPTAP_DOC);
    editor.commands.setContent(safeContent, false);
    editor.commands.focus("end");
    lastHydratedKey.current = hydrationKey;
  }, [editor, content, documentId]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (!syncManager) {
      return;
    }
    syncManager.start();
    return () => {
      syncManager.stop();
    };
  }, [syncManager]);

  return (
    <>
      <div className="pointer-events-none sticky top-6 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <Toolbar editor={editor} />
        </div>
      </div>

      <div className="relative mx-auto my-12 min-h-[1000px] max-w-[800px] border border-[#e7e7f3] bg-white p-24 shadow-sm dark:border-[#2d2e4a] dark:bg-[#101122]">
        <div
          className="cursor-indicator absolute left-64 top-48 h-6 w-[2px] bg-green-500 transition-all"
          data-name="Sarah"
          style={{ zIndex: 10 }}
        ></div>
        <div
          className="cursor-indicator absolute left-96 top-[420px] h-6 w-[2px] bg-purple-500 transition-all"
          data-name="James"
          style={{ zIndex: 10 }}
        ></div>

        <article className="max-w-none">
          <div className="mb-8">
            <label className="sr-only" htmlFor="document-title">
              Document title
            </label>
            <input
              id="document-title"
              className="w-full bg-transparent text-4xl font-bold text-[#0d0e1b] placeholder:text-[#0d0e1b]/40 focus:outline-none dark:text-white dark:placeholder:text-white/40"
              value={docTitle}
              placeholder="Untitled document"
              readOnly={!editable}
              aria-disabled={!editable}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-base text-[#4c4d9a] dark:text-[#8a8bbd]">Loading document...</p>
          ) : error ? (
            <p className="text-base text-red-500">{error}</p>
          ) : (
            <EditorContent editor={editor} className="tiptap text-lg leading-relaxed" />
          )}
        </article>

        <div className="absolute left-[100px] top-[420px] -z-0 h-6 w-32 border-l-2 border-purple-500 bg-purple-500/10"></div>
      </div>
    </>
  );
};
