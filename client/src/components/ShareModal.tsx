import { useState } from "react";

interface ShareModalProps {
  documentId: string;
  onClose: () => void;
}

export const ShareModal = ({ documentId, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/editor/${documentId}?share=true&collab=true`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-xl w-full mx-4 bg-white dark:bg-[#16172d] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e7e7f3] bg-[#f8f8fc] px-6 py-4 dark:border-[#2a2b4a] dark:bg-[#1e1f3a]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined">share</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0d0e1b] dark:text-white">Share this document</h2>
              <p className="text-sm text-[#4c4d9a] dark:text-[#a1a1c9]">
                Invite collaborators with a share link.
              </p>
            </div>
          </div>
          <button
            className="rounded-lg p-2 text-[#4c4d9a] transition-colors hover:bg-[#e7e7f3] dark:text-[#a1a1c9] dark:hover:bg-[#2a2b4a]"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#4c4d9a] dark:text-[#a1a1c9]">
            Collaboration link
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="h-11 w-full rounded-lg border border-[#e7e7f3] bg-white px-3 text-sm text-[#0d0e1b] shadow-sm focus:border-primary/50 focus:outline-none dark:border-[#2a2b4a] dark:bg-[#0f1024] dark:text-[#f8f8fc]"
              readOnly
              type="text"
              value={shareLink}
              onFocus={(event) => event.target.select()}
            />
            <button
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 sm:w-36"
              onClick={handleCopy}
              type="button"
            >
              <span className="material-symbols-outlined !text-[18px]">
                {copied ? "check" : "content_copy"}
              </span>
              <span>{copied ? "Copied" : "Copy link"}</span>
            </button>
          </div>
          <p className="mt-3 text-xs text-[#4c4d9a] dark:text-[#a1a1c9]">
            Anyone with this link can join in collaboration mode.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#e7e7f3] bg-[#f8f8fc] px-6 py-4 dark:border-[#2a2b4a] dark:bg-[#1e1f3a]">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#4c4d9a] transition-colors hover:bg-[#e7e7f3] dark:text-[#a1a1c9] dark:hover:bg-[#2a2b4a]"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
