export type TipTapContent = Record<string, unknown>;

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
  ownerId: string;
  workspaceId: string;
}

export interface DocumentModel extends DocumentSummary {
  content: TipTapContent;
}

export const mapDocumentRow = (_row: unknown): DocumentModel => {
  const row = typeof _row === "object" && _row !== null ? (_row as Record<string, unknown>) : {};
  const updatedAt =
    typeof row.updatedAt === "string"
      ? row.updatedAt
      : typeof row.updated_at === "string"
        ? row.updated_at
        : new Date().toISOString();

  return {
    id: typeof row.id === "string" ? row.id : "",
    title: typeof row.title === "string" ? row.title : "",
    content:
      typeof row.content === "object" && row.content !== null
        ? (row.content as TipTapContent)
        : { type: "doc", content: [] },
    updatedAt,
    ownerId: typeof row.ownerId === "string" ? row.ownerId : typeof row.owner_id === "string" ? row.owner_id : "",
    workspaceId:
      typeof row.workspaceId === "string"
        ? row.workspaceId
        : typeof row.workspace_id === "string"
          ? row.workspace_id
          : ""
  };
};
