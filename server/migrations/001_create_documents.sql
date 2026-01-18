-- Migration: Create documents and document_members tables
-- Description: Sets up the core document storage and permission system
-- Created: 2026-01-18

-- Create documents table
-- Stores all collaborative documents with TipTap content
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}',
  owner_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_members table
-- Manages document sharing and permissions (owner, editor, viewer)
CREATE TABLE IF NOT EXISTS document_members (
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (document_id, user_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Create indexes for performance
-- Speed up queries filtering by workspace
CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);

-- Speed up queries filtering by owner
CREATE INDEX IF NOT EXISTS idx_documents_owner ON documents(owner_id);

-- Speed up queries filtering by updated_at (for recent documents)
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

-- Speed up permission lookups by user
CREATE INDEX IF NOT EXISTS idx_document_members_user ON document_members(user_id);

-- Add helpful comments for documentation
COMMENT ON TABLE documents IS 'Stores collaborative documents with TipTap editor content';
COMMENT ON TABLE document_members IS 'Manages document access permissions and sharing';

COMMENT ON COLUMN documents.content IS 'TipTap JSON content stored as JSONB for efficient querying';
COMMENT ON COLUMN documents.workspace_id IS 'Logical grouping ID for documents';
COMMENT ON COLUMN document_members.role IS 'Permission level: owner (full control), editor (can edit), viewer (read-only)';