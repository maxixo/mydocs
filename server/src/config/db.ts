import { Pool } from "pg";
import { env } from "./env.js";

const dbConfig = env.databaseUrl ? { connectionString: env.databaseUrl } : {};

export const db = new Pool(dbConfig);

export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await db.query("SELECT 1");
    
    // Check if required tables exist
    const { rows: tables } = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('documents', 'document_members')
    `);
    
    const tableNames = tables.map((row: { table_name: string }) => row.table_name);
    
    if (!tableNames.includes("documents")) {
      throw new Error("Required table 'documents' does not exist. Run migrations first.");
    }
    
    if (!tableNames.includes("document_members")) {
      throw new Error("Required table 'document_members' does not exist. Run migrations first.");
    }
    
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
