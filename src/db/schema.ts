// ============================================================================
// Database Schema for LSD-MCP
// Using Drizzle ORM with Neon Postgres
// ============================================================================

import {
  pgTable,
  uuid,
  text,
  integer,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================================================
// Sessions Table
// Stores cognitive modulation session state (replaces in-memory Map)
// ============================================================================

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  doseUm: integer("dose_um").notNull(),
  intensityCoefficient: real("intensity_coefficient").notNull(),
  safetyAnchors: text("safety_anchors").array(),
  currentMode: text("current_mode"),
  status: text("status").notNull().default("initialized"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// ============================================================================
// Users Table
// For OAuth authentication
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  name: text("name"),
  image: text("image"),
  provider: text("provider"), // 'github', 'google', etc.
  providerId: text("provider_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// API Keys Table
// For programmatic/CLI access
// ============================================================================

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  keyHash: text("key_hash").notNull(), // Hashed API key
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification
  name: text("name"), // User-provided name for the key
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
});

// ============================================================================
// Type exports for use in application code
// ============================================================================

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
