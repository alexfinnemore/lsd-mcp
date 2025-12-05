// ============================================================================
// Database Layer - Entry Point
// ============================================================================
//
// This module provides session storage abstraction.
//
// For Vercel/serverless: Uses in-memory storage (local-storage.ts)
//   - Serverless functions are stateless, so in-memory works per-invocation
//   - Session IDs are passed by clients to track sessions
//
// For standalone server with Postgres: Could use postgres-storage.ts
//   - Currently disabled due to drizzle-orm/webpack ESM compatibility
//   - To enable: install drizzle-orm, set DATABASE_URL, update imports
//
// ============================================================================

// Export the local storage implementation (no external dependencies)
export { getSessionStorage, getActiveSessionForUser } from "./local-storage";
export type { SessionStorage } from "./local-storage";
