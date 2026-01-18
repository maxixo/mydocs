import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { createEditorExtensions } from "./editorConfig";
import { Toolbar } from "./Toolbar";
import { createYjsProvider } from "../collaboration/yjsProvider";
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
  loading?: boolean;
  error?: string | null;
};

export const EditorSurface = ({
  documentId,
  content,
  editable,
  onChange,
  docTitle,
  loading = false,
  error = null
}: EditorSurfaceProps) => {
  const provider = useMemo(() => createYjsProvider(), [documentId]);
  const syncManager = useMemo(
    () =>
      createSyncManager(provider, {
        user: DEFAULT_USER
      }),
    [provider]
  );
  const onChangeRef = useRef(onChange);
  const lastHydratedKey = useRef<string | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: createEditorExtensions({
      collaboration: {
        doc: provider.doc,
        awareness: provider.awareness,
        user: DEFAULT_USER
      }
    }),
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
          <h1 className="mb-8 text-4xl font-bold capitalize text-[#0d0e1b] dark:text-white">{docTitle}</h1>
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

