import type { Editor } from "@tiptap/react";

type ToolbarProps = {
  editor: Editor | null;
  className?: string;
};

const buttonClassName = (active: boolean) => {
  const base = "rounded p-1.5 transition-colors";
  const activeClasses = "bg-background-light text-primary dark:bg-primary/20 dark:text-white";
  const inactiveClasses =
    "text-[#4c4d9a] hover:bg-background-light hover:text-primary dark:text-[#8a8bbd] dark:hover:bg-primary/20";
  return `${base} ${active ? activeClasses : inactiveClasses}`;
};

export const Toolbar = ({ editor, className }: ToolbarProps) => {
  const containerClassName = className
    ? `flex items-center gap-1 rounded-xl border border-[#e7e7f3] bg-white p-1.5 shadow-xl dark:border-[#2d2e4a] dark:bg-[#1c1d3a] ${className}`
    : "flex items-center gap-1 rounded-xl border border-[#e7e7f3] bg-white p-1.5 shadow-xl dark:border-[#2d2e4a] dark:bg-[#1c1d3a]";

  const canInteract = Boolean(editor);

  return (
    <div className={containerClassName}>
      <button
        className={buttonClassName(Boolean(editor?.isActive("bold")))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("bold"))}
        onClick={() => editor?.chain().focus().toggleBold().run()}
      >
        <span className="material-symbols-outlined">format_bold</span>
      </button>
      <button
        className={buttonClassName(Boolean(editor?.isActive("italic")))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("italic"))}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
      >
        <span className="material-symbols-outlined">format_italic</span>
      </button>
      <button
        className={buttonClassName(Boolean(editor?.isActive("heading", { level: 2 })))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("heading", { level: 2 }))}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="material-symbols-outlined">title</span>
      </button>
      <div className="mx-1 h-5 w-px bg-[#e7e7f3] dark:bg-[#2d2e4a]"></div>
      <button
        className={buttonClassName(Boolean(editor?.isActive("bulletList")))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("bulletList"))}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
      >
        <span className="material-symbols-outlined">format_list_bulleted</span>
      </button>
      <button
        className={buttonClassName(Boolean(editor?.isActive("orderedList")))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("orderedList"))}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
      >
        <span className="material-symbols-outlined">format_list_numbered</span>
      </button>
      <button
        className={buttonClassName(Boolean(editor?.isActive("blockquote")))}
        type="button"
        disabled={!canInteract}
        aria-pressed={Boolean(editor?.isActive("blockquote"))}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
      >
        <span className="material-symbols-outlined">format_quote</span>
      </button>
    </div>
  );
};
