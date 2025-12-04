// ============================================================================
// Database Connection for LSD-MCP
// Neon Serverless Postgres with Drizzle ORM
// ============================================================================

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.js";

// ============================================================================
// Database Connection
// ============================================================================

// Get connection string from environment
const connectionString = process.env.DATABASE_URL;

// Create database instance (lazy initialization for serverless)
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please configure your Neon database connection string."
    );
  }

  if (!_db) {
    const sql = neon(connectionString);
    _db = drizzle(sql, { schema });
  }

  return _db;
}

// ============================================================================
// Check if running in serverless/remote mode
// ============================================================================

export function isRemoteMode(): boolean {
  return !!process.env.DATABASE_URL && !!process.env.VERCEL;
}

// Re-export schema for convenience
export * from "./schema.js";
