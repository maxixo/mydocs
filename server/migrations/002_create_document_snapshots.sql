-- Migration: Create document_snapshots table
-- Description: Stores Yjs document snapshots for CRDT persistence
-- Created: 2026-01-18

CREATE TABLE IF NOT EXISTS document_snapshots (
  document_id TEXT PRIMARY KEY,
  state BYTEA NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_snapshots_updated_at
  ON document_snapshots(updated_at DESC);

COMMENT ON TABLE document_snapshots IS 'Stores Yjs document snapshots for collaboration persistence';
COMMENT ON COLUMN document_snapshots.state IS 'Binary Yjs update representing the document state';
