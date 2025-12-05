// ============================================================================
// Local (In-Memory) Session Storage
// Used for serverless deployments and standalone mode without database
// ============================================================================

import type { Session } from "../types";

// In-memory session store
const sessions: Map<string, Session> = new Map();
let activeSessionId: string | null = null;

// Per-user session tracking (for remote mode)
const userSessions: Map<string, string> = new Map(); // userId -> sessionId

// ============================================================================
// Storage Interface
// ============================================================================

export interface SessionStorage {
  save(session: Session): Promise<void>;
  get(sessionId: string): Promise<Session | null>;
  getActive(): Promise<Session | null>;
  getActiveForUser(userId: string): Promise<Session | null>;
  setActive(sessionId: string): Promise<void>;
  update(sessionId: string, updates: Partial<Session>): Promise<void>;
  delete(sessionId: string): Promise<void>;
  clearExpired(): Promise<number>;
}

// ============================================================================
// Local Storage Implementation
// ============================================================================

class LocalSessionStorage implements SessionStorage {
  async save(session: Session): Promise<void> {
    sessions.set(session.session_id, session);
    activeSessionId = session.session_id;
    if (session.user_id) {
      userSessions.set(session.user_id, session.session_id);
    }
  }

  async get(sessionId: string): Promise<Session | null> {
    return sessions.get(sessionId) || null;
  }

  async getActive(): Promise<Session | null> {
    if (!activeSessionId) return null;
    const session = sessions.get(activeSessionId);
    if (!session) {
      activeSessionId = null;
      return null;
    }
    // Check expiry
    if (new Date() > new Date(session.expires_at)) {
      session.status = "expired";
      activeSessionId = null;
      return null;
    }
    return session;
  }

  async getActiveForUser(userId: string): Promise<Session | null> {
    const sessionId = userSessions.get(userId);
    if (!sessionId) return null;

    const session = sessions.get(sessionId);
    if (!session) {
      userSessions.delete(userId);
      return null;
    }

    // Check expiry
    if (new Date() > new Date(session.expires_at)) {
      session.status = "expired";
      userSessions.delete(userId);
      return null;
    }

    return session;
  }

  async setActive(sessionId: string): Promise<void> {
    activeSessionId = sessionId;
  }

  async update(sessionId: string, updates: Partial<Session>): Promise<void> {
    const session = sessions.get(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  async delete(sessionId: string): Promise<void> {
    const session = sessions.get(sessionId);
    if (session?.user_id) {
      userSessions.delete(session.user_id);
    }
    sessions.delete(sessionId);
    if (activeSessionId === sessionId) {
      activeSessionId = null;
    }
  }

  async clearExpired(): Promise<number> {
    let cleared = 0;
    const now = new Date();
    for (const [id, session] of sessions) {
      if (new Date(session.expires_at) < now) {
        if (session.user_id) {
          userSessions.delete(session.user_id);
        }
        sessions.delete(id);
        cleared++;
      }
    }
    return cleared;
  }
}

// Singleton instance
let _storage: SessionStorage | null = null;

export function getSessionStorage(): SessionStorage {
  if (!_storage) {
    _storage = new LocalSessionStorage();
  }
  return _storage;
}

// For backwards compatibility
export async function getActiveSessionForUser(userId: string): Promise<Session | null> {
  return getSessionStorage().getActiveForUser(userId);
}
