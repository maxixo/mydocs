# Database Migrations

## Overview

This directory contains SQL migration files that define the database schema for the MyDocs application. Migrations are automatically managed and tracked by the application's migration system.

## How It Works

The migration system:
1. Reads SQL files from this directory in alphabetical order
2. Tracks applied migrations in the `schema_migrations` table
3. Skips migrations that have already been applied
4. Executes new migrations and marks them as applied
5. Logs all migration operations

## Running Migrations

### Automatic (Recommended)

Migrations run automatically when the server starts:

```bash
npm run dev
```

The server will:
- Run Better Auth migrations (auth tables)
- Run document migrations (files in this directory)
- Verify database connection and required tables
- Start the server if everything is successful

### Manual (CLI)

Use the migration runner script for manual control:

```bash
# Run all pending migrations
npm run migrations:run

# Check migration status
npm run migrations:status

# Run a specific migration
npm run migrations:run 001_create_documents.sql
```

## Migration Files

### Naming Convention

Migration files must follow this naming pattern:
```
<number>_<description>.sql
```

**Example:** `001_create_documents.sql`

The numeric prefix determines the execution order (must be unique).

### Current Migrations

#### 001_create_documents.sql
- Creates `documents` table for storing collaborative documents
- Creates `document_members` table for permissions and sharing
- Adds performance indexes
- Adds database comments for documentation

## Creating New Migrations

### Step 1: Create SQL File

```bash
# Create a new migration file
touch server/migrations/002_add_document_tags.sql
```

### Step 2: Write Migration SQL

```sql
-- Migration: Add tags to documents
-- Description: Adds tag support for better document organization
-- Created: 2026-01-18

-- Add tags column
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- Create index for tag queries
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
```

### Step 3: Test Migration

```bash
# Run the specific migration
npm run migrations:run 002_add_document_tags.sql

# Check status
npm run migrations:status
```

### Step 4: Update Application Code

Update TypeScript models and services to use the new schema.

## Best Practices

1. **Always create new migrations** - Never modify existing migration files
2. **Use IF NOT EXISTS** - Makes migrations idempotent and safe to re-run
3. **Document your changes** - Add comments explaining what the migration does
4. **Test locally first** - Run migrations on a local database before committing
5. **Keep migrations small** - Split large changes into multiple small migrations
6. **Use transactions** - For complex changes, wrap in BEGIN/COMMIT blocks
7. **Add indexes** - Create indexes for columns you'll query frequently
8. **Backup first** - Always have a database backup before running migrations

## Common Patterns

### Adding a Column

```sql
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
```

### Creating an Index

```sql
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
```

### Adding a Foreign Key

```sql
ALTER TABLE document_members 
ADD CONSTRAINT fk_document_members_document 
FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
```

### Creating a New Table

```sql
CREATE TABLE IF NOT EXISTS document_comments (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_comments_document 
ON document_comments(document_id);
```

## Troubleshooting

### Migration Already Applied

If you see "Migration already applied", the migration has been run before. This is normal and expected behavior.

### Migration Failed

If a migration fails:
1. Check the error message in the logs
2. Verify the SQL syntax is correct
3. Ensure the database user has required permissions
4. Check that previous migrations have been applied
5. Fix the issue and restart the server

### Database Out of Sync

If your database is out of sync with migrations:
1. Check which migrations have been applied: `npm run migrations:status`
2. Compare with the files in this directory
3. Run missing migrations: `npm run migrations:run`
4. If needed, reset the database (CAUTION: This deletes all data)

## Rollbacks

Currently, the migration system does not support automatic rollbacks. To rollback a migration:

1. Manually write SQL to reverse the migration
2. Execute it in the database
3. Remove the migration record from `schema_migrations` table:
   ```sql
   DELETE FROM schema_migrations WHERE filename = '001_create_documents.sql';
   ```

**Warning:** Rollbacks should only be done in development. In production, create a new migration to fix issues instead.

## Related Documentation

- [Database Documentation](../../../database.md) - Complete database schema and usage guide
- [Migration System](../src/config/migrations.ts) - Migration runner implementation
- [Database Configuration](../src/config/db.ts) - Database connection setup

---

**Last Updated:** 2026-01-18
