import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import type { Editor as TipTapEditor, JSONContent } from "@tiptap/core";
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

type EditorStats = {
  wordCount: number;
  charCount: number;
};

const getTextStats = (value: string): EditorStats => {
  const trimmed = value.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  return { wordCount, charCount: value.length };
};

const mergeStats = (first: EditorStats, second: EditorStats): EditorStats => ({
  wordCount: first.wordCount + second.wordCount,
  charCount: first.charCount + second.charCount
});

type EditorSurfaceProps = {
  documentId?: string | null;
  content: JSONContent;
  editable: boolean;
  onChange: (content: JSONContent) => void;
  docTitle: string;
  onTitleChange: (title: string) => void;
  onStatsChange?: (stats: EditorStats) => void;
  autoFocusTitle?: boolean;
  loading?: boolean;
  error?: string | null;
};

export const EditorSurface = ({
  documentId,
  content,
  editable,
  onChange,
  onTitleChange,
  onStatsChange,
  autoFocusTitle = false,
  docTitle,
  loading = false,
  error = null
}: EditorSurfaceProps) => {
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const onStatsChangeRef = useRef(onStatsChange);
  const [isEmpty, setIsEmpty] = useState(true);
  const didAutoFocusRef = useRef(false);
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

  useEffect(() => {
    onStatsChangeRef.current = onStatsChange;
  }, [onStatsChange]);

  useEffect(() => {
    didAutoFocusRef.current = false;
  }, [documentId]);

  const updateStats = useCallback(
    (editorInstance: TipTapEditor) => {
      const bodyStats = getTextStats(editorInstance.getText());
      const titleStats = getTextStats(docTitle);
      onStatsChangeRef.current?.(mergeStats(bodyStats, titleStats));
      setIsEmpty(editorInstance.isEmpty);
    },
    [docTitle]
  );

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
      updateStats(editorInstance);
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
    updateStats(editor);
  }, [editor, content, documentId, updateStats]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    updateStats(editor);
  }, [docTitle, editor, updateStats]);

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

  useEffect(() => {
    if (!autoFocusTitle || !editable || !titleInputRef.current || didAutoFocusRef.current) {
      return;
    }
    titleInputRef.current.focus();
    titleInputRef.current.select();
    didAutoFocusRef.current = true;
  }, [autoFocusTitle, editable]);

  const handleTitleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      editor?.commands.focus("start");
    },
    [editor]
  );

  const handleSetLink = useCallback(() => {
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const nextUrl = window.prompt("Enter URL", previousUrl ?? "");

    if (nextUrl === null) {
      return;
    }

    const trimmed = nextUrl.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setMark("link", { href: trimmed }).run();
  }, [editor]);

  const showEmptyHint = editable && !loading && !error && isEmpty;

  return (
    <>
      <div className="pointer-events-none sticky top-6 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <Toolbar editor={editor} />
        </div>
      </div>

      <div className="relative mx-auto my-12 min-h-[1000px] max-w-[800px] bg-white p-24 text-[#0d0e1b] dark:text-[#0d0e1b]">
        <article className="max-w-none">
          <div className="mb-8">
            <label className="sr-only" htmlFor="document-title">
              Document title
            </label>
            <input
              id="document-title"
              className="w-full border-0 bg-transparent text-4xl font-bold text-[#0d0e1b] placeholder:text-[#0d0e1b]/40 focus:border-0 focus:outline-none focus:ring-0"
              ref={titleInputRef}
              value={docTitle}
              placeholder="Untitled document"
              readOnly={!editable}
              aria-disabled={!editable}
              onChange={(event) => onTitleChange(event.target.value)}
              onKeyDown={handleTitleKeyDown}
            />
          </div>
          {editor && editable ? (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 150, placement: "top", offset: [0, 8] }}
              shouldShow={({ editor: activeEditor }) =>
                activeEditor.isEditable && !activeEditor.state.selection.empty
              }
              className="flex items-center gap-1 rounded-lg border border-[#e7e7f3] bg-white px-2 py-1 shadow-sm"
            >
              <button
                type="button"
                className={`rounded px-2 py-1 text-sm font-semibold transition-colors ${
                  editor.isActive("bold")
                    ? "bg-[#0d0e1b] text-white"
                    : "text-[#0d0e1b] hover:bg-[#e7e7f3]"
                }`}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                B
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 text-sm font-semibold transition-colors ${
                  editor.isActive("italic")
                    ? "bg-[#0d0e1b] text-white"
                    : "text-[#0d0e1b] hover:bg-[#e7e7f3]"
                }`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                I
              </button>
              <button
                type="button"
                className={`rounded px-2 py-1 text-sm font-semibold transition-colors ${
                  editor.isActive("link")
                    ? "bg-[#0d0e1b] text-white"
                    : "text-[#0d0e1b] hover:bg-[#e7e7f3]"
                }`}
                onClick={handleSetLink}
              >
                Link
              </button>
            </BubbleMenu>
          ) : null}
          {loading ? (
            <p className="text-base text-[#4c4d9a] dark:text-[#8a8bbd]">Loading document...</p>
          ) : error ? (
            <p className="text-base text-red-500">{error}</p>
          ) : (
            <div className="relative">
              <EditorContent editor={editor} className="tiptap text-lg leading-relaxed" />
              <div
                className={`pointer-events-none absolute left-0 top-0 text-lg text-[#8a8bbd] transition-opacity duration-200 ${
                  showEmptyHint ? "opacity-70" : "opacity-0"
                }`}
              >
                Start typing...
              </div>
            </div>
          )}
        </article>

      </div>
    </>
  );
};
