import { db } from "../config/db.js";
import type { DocumentModel, DocumentSummary, TipTapContent } from "../models/document.model.js";
import { mapDocumentRow, mapDocumentSummaryRow } from "../models/document.model.js";

export const listDocuments = async (
  workspaceId: string,
  userId: string
): Promise<DocumentSummary[]> => {
  const { rows } = await db.query(
    `
      SELECT d.id, d.title, d.updated_at, d.owner_id, d.workspace_id
      FROM documents d
      LEFT JOIN document_members m
        ON d.id = m.document_id
        AND m.user_id = $2
      WHERE d.workspace_id = $1
        AND (d.owner_id = $2 OR m.user_id = $2)
      ORDER BY d.updated_at DESC
    `,
    [workspaceId, userId]
  );

  return rows.map(mapDocumentSummaryRow);
};

export const getDocumentById = async (
  id: string,
  workspaceId: string,
  userId: string
): Promise<DocumentModel | null> => {
  const { rows } = await db.query(
    `
      SELECT d.id, d.title, d.content, d.updated_at, d.owner_id, d.workspace_id
      FROM documents d
      LEFT JOIN document_members m
        ON d.id = m.document_id
        AND m.user_id = $2
      WHERE d.id = $1
        AND d.workspace_id = $3
        AND (d.owner_id = $2 OR m.user_id = $2)
      LIMIT 1
    `,
    [id, userId, workspaceId]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapDocumentRow(rows[0]);
};

export const createDocument = async (payload: {
  id: string;
  title: string;
  content: TipTapContent;
  ownerId: string;
  workspaceId: string;
}): Promise<DocumentModel> => {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `
        INSERT INTO documents (id, title, content, owner_id, workspace_id, updated_at)
        VALUES ($1, $2, $3::jsonb, $4, $5, NOW())
        RETURNING id, title, content, updated_at, owner_id, workspace_id
      `,
      [payload.id, payload.title, JSON.stringify(payload.content), payload.ownerId, payload.workspaceId]
    );

    await client.query(
      `
        INSERT INTO document_members (document_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (document_id, user_id) DO NOTHING
      `,
      [payload.id, payload.ownerId, "owner"]
    );

    await client.query("COMMIT");
    return mapDocumentRow(rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateDocument = async (payload: {
  id: string;
  workspaceId: string;
  title?: string;
  content?: TipTapContent;
}): Promise<DocumentModel | null> => {
  const { rows } = await db.query(
    `
      UPDATE documents
      SET title = COALESCE($2, title),
          content = COALESCE($3::jsonb, content),
          updated_at = NOW()
      WHERE id = $1
        AND workspace_id = $4
      RETURNING id, title, content, updated_at, owner_id, workspace_id
    `,
    [
      payload.id,
      payload.title ?? null,
      payload.content ? JSON.stringify(payload.content) : null,
      payload.workspaceId
    ]
  );

  if (rows.length === 0) {
    return null;
  }

  return mapDocumentRow(rows[0]);
};
