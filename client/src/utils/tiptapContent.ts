import type { JSONContent } from "@tiptap/core";

export const EMPTY_TIPTAP_DOC: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }]
};

const sanitizeNode = (node: JSONContent | null | undefined): JSONContent | null => {
  if (!node || typeof node !== "object") {
    return null;
  }

  if (node.type === "text") {
    const text = typeof node.text === "string" ? node.text : "";
    if (!text) {
      return null;
    }
    return { ...node, text };
  }

  const content = Array.isArray(node.content)
    ? (node.content
        .map((child) => sanitizeNode(child))
        .filter(Boolean) as JSONContent[])
    : undefined;

  return {
    ...node,
    content: content && content.length > 0 ? content : undefined
  };
};

export const sanitizeTipTapContent = (content: unknown): JSONContent => {
  let parsed: unknown = content;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as JSONContent;
    } catch {
      return EMPTY_TIPTAP_DOC;
    }
  }

  const sanitized = sanitizeNode(parsed as JSONContent);
  if (!sanitized || sanitized.type !== "doc") {
    return EMPTY_TIPTAP_DOC;
  }

  if (!Array.isArray(sanitized.content) || sanitized.content.length === 0) {
    return EMPTY_TIPTAP_DOC;
  }

  return sanitized;
};
