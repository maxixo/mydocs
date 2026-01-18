import { db } from "../config/db.js";

export type DocumentRole = "viewer" | "editor" | "owner";

export const getDocumentRole = async (
  userId: string,
  documentId: string,
  workspaceId: string
): Promise<DocumentRole | null> => {
  if (!userId || !documentId || !workspaceId) {
    return null;
  }

  const { rows } = await db.query(
    `
      SELECT d.owner_id, m.role
      FROM documents d
      LEFT JOIN document_members m
        ON d.id = m.document_id
        AND m.user_id = $2
      WHERE d.id = $1
        AND d.workspace_id = $3
      LIMIT 1
    `,
    [documentId, userId, workspaceId]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0] as { owner_id?: string; role?: string | null };
  if (row.owner_id === userId) {
    return "owner";
  }

  if (row.role === "viewer" || row.role === "editor" || row.role === "owner") {
    return row.role;
  }

  return null;
};

export const checkPermission = async (
  userId: string,
  documentId: string,
  workspaceId: string
) => {
  const role = await getDocumentRole(userId, documentId, workspaceId);
  return role !== null;
};

export const canEditDocument = (role: DocumentRole | null) =>
  role === "editor" || role === "owner";
