// ============================================================================
// Session Storage Abstraction
// Supports both in-memory (local) and Postgres (remote) storage
// ============================================================================

// NOTE: drizzle-orm imports disabled due to webpack compatibility issues
// import { eq, and, lt } from "drizzle-orm";
import { getDb, isRemoteMode, sessions, type Session as DbSession, type NewSession } from "./index";
import type { Session } from "../types";

// ============================================================================
// In-Memory Storage (for local stdio mode)
// ============================================================================

const localSessions: Map<string, Session> = new Map();
let localActiveSessionId: string | null = null;

// ============================================================================
// Storage Interface
// ============================================================================

export interface SessionStorage {
  save(session: Session): Promise<void>;
  get(sessionId: string): Promise<Session | null>;
  getActive(): Promise<Session | null>;
  setActive(sessionId: string): Promise<void>;
  update(sessionId: string, updates: Partial<Session>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  clearExpired(): Promise<number>;
}

// ============================================================================
// Convert between DB and App Session types
// ============================================================================

function dbToAppSession(dbSession: DbSession): Session {
  return {
    session_id: dbSession.id,
    dose_um: dbSession.doseUm,
    intensity_coefficient: dbSession.intensityCoefficient,
    session_duration_hours: 8, // Fixed 8-hour sessions
    created_at: dbSession.createdAt.toISOString(),
    expires_at: dbSession.expiresAt.toISOString(),
    user_id: dbSession.userId,
    safety_anchors: dbSession.safetyAnchors || [],
    current_mode: dbSession.currentMode as Session["current_mode"],
    status: dbSession.status as Session["status"],
  };
}

function appToDbSession(session: Session): NewSession {
  return {
    id: session.session_id,
    userId: session.user_id,
    doseUm: session.dose_um,
    intensityCoefficient: session.intensity_coefficient,
    safetyAnchors: session.safety_anchors,
    currentMode: session.current_mode,
    status: session.status,
    createdAt: new Date(session.created_at),
    expiresAt: new Date(session.expires_at),
  };
}

// ============================================================================
// Local (In-Memory) Storage Implementation
// ============================================================================

class LocalSessionStorage implements SessionStorage {
  async save(session: Session): Promise<void> {
    localSessions.set(session.session_id, session);
    localActiveSessionId = session.session_id;
  }

  async get(sessionId: string): Promise<Session | null> {
    return localSessions.get(sessionId) || null;
  }

  async getActive(): Promise<Session | null> {
    if (!localActiveSessionId) return null;
    const session = localSessions.get(localActiveSessionId);
    if (!session) {
      localActiveSessionId = null;
      return null;
    }
    // Check expiry
    if (new Date() > new Date(session.expires_at)) {
      session.status = "expired";
      localActiveSessionId = null;
      return null;
    }
    return session;
  }

  async setActive(sessionId: string): Promise<void> {
    localActiveSessionId = sessionId;
  }

  async update(sessionId: string, updates: Partial<Session>): Promise<void> {
    const session = localSessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  async delete(sessionId: string): Promise<void> {
    localSessions.delete(sessionId);
    if (localActiveSessionId === sessionId) {
      localActiveSessionId = null;
    }
  }

  async clearExpired(): Promise<number> {
    let cleared = 0;
    const now = new Date();
    for (const [id, session] of localSessions) {
      if (new Date(session.expires_at) < now) {
        localSessions.delete(id);
        cleared++;
      }
    }
    return cleared;
  }
}

// ============================================================================
// Remote (Postgres) Storage Implementation
// ============================================================================

class RemoteSessionStorage implements SessionStorage {
  async save(session: Session): Promise<void> {
    const db = getDb();
    const dbSession = appToDbSession(session);
    await db.insert(sessions).values(dbSession);
  }

  async get(sessionId: string): Promise<Session | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (result.length === 0) return null;
    return dbToAppSession(result[0]);
  }

  async getActive(): Promise<Session | null> {
    // For remote mode, we need to get session by user context
    // This will be called with a user_id in the context
    // For now, return null - the actual lookup happens via getSessionForUser
    return null;
  }

  async setActive(sessionId: string): Promise<void> {
    // No-op for remote mode - sessions are identified by ID
  }

  async update(sessionId: string, updates: Partial<Session>): Promise<void> {
    const db = getDb();

    const dbUpdates: Partial<NewSession> = {};
    if (updates.dose_um !== undefined) dbUpdates.doseUm = updates.dose_um;
    if (updates.intensity_coefficient !== undefined) dbUpdates.intensityCoefficient = updates.intensity_coefficient;
    if (updates.current_mode !== undefined) dbUpdates.currentMode = updates.current_mode;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.safety_anchors !== undefined) dbUpdates.safetyAnchors = updates.safety_anchors;

    await db
      .update(sessions)
      .set(dbUpdates)
      .where(eq(sessions.id, sessionId));
  }

  async delete(sessionId: string): Promise<void> {
    const db = getDb();
    await db.delete(sessions).where(eq(sessions.id, sessionId));
  }

  async clearExpired(): Promise<number> {
    const db = getDb();
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));
    // Drizzle doesn't return count directly, so we approximate
    return 0;
  }
}

// ============================================================================
// Get the appropriate storage implementation
// ============================================================================

let _storage: SessionStorage | null = null;

export function getSessionStorage(): SessionStorage {
  if (!_storage) {
    _storage = isRemoteMode() ? new RemoteSessionStorage() : new LocalSessionStorage();
  }
  return _storage;
}

// ============================================================================
// Remote-specific: Get session by user ID (most recent active)
// ============================================================================

export async function getActiveSessionForUser(userId: string): Promise<Session | null> {
  if (!isRemoteMode()) {
    // In local mode, just return the active session
    return getSessionStorage().getActive();
  }

  const db = getDb();
  const now = new Date();

  const result = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.status, "initialized"),
      )
    )
    .orderBy(sessions.createdAt)
    .limit(1);

  if (result.length === 0) return null;

  const session = result[0];
  if (session.expiresAt < now) {
    // Expired - update status and return null
    await db
      .update(sessions)
      .set({ status: "expired" })
      .where(eq(sessions.id, session.id));
    return null;
  }

  return dbToAppSession(session);
}
