// ============================================================================
// Database Connection for LSD-MCP
// Neon Serverless Postgres with Drizzle ORM
// ============================================================================

// NOTE: Database imports are disabled due to drizzle-orm/webpack incompatibility
// The session-storage.ts uses in-memory storage when isRemoteMode() returns false

// ============================================================================
// Check if running in serverless/remote mode
// ============================================================================

export function isRemoteMode(): boolean {
  // TODO: Re-enable when drizzle-orm/webpack compatibility is fixed
  // return !!process.env.DATABASE_URL && !!process.env.VERCEL;
  return false;
}

// Placeholder database function - not used when isRemoteMode() returns false
export function getDb(): never {
  throw new Error("Database not available - running in local mode");
}

// Placeholder types - not used when isRemoteMode() returns false
export const sessions = null as any;
export type Session = any;
export type NewSession = any;
