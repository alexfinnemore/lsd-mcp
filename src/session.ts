// ============================================================================
// Session State Management
// Handles session lifecycle, dose calculations, and state persistence
// Supports both local (in-memory) and remote (Postgres) storage
// ============================================================================

import { randomUUID } from "crypto";
import {
  Session,
  SessionInitParams,
  SessionInitResponse,
  AdjustDoseParams,
  AdjustDoseResponse,
  DoseEffects,
  SafetyStatus,
  DoseRange,
  ModeType,
  DEFAULT_DOSE_UM,
  SESSION_DURATION_HOURS,
  HIGH_DOSE_WARNING_THRESHOLD,
  SIGMOID_STEEPNESS,
  SIGMOID_MIDPOINT,
  AVAILABLE_MODES,
} from "./types.js";
import { getSessionStorage, getActiveSessionForUser } from "./db/session-storage.js";

// ============================================================================
// Request Context (for remote mode - set by HTTP handler)
// ============================================================================

let currentUserId: string | null = null;

export function setCurrentUserId(userId: string | null): void {
  currentUserId = userId;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

// ============================================================================
// Sigmoid Intensity Function
// ============================================================================

/**
 * Calculate intensity coefficient using sigmoid function
 * intensity = 1 / (1 + e^(-0.015 * (dose - 150)))
 *
 * Produces:
 * - 20μm  → 0.11 intensity
 * - 50μm  → 0.21 intensity
 * - 100μm → 0.45 intensity
 * - 150μm → 0.50 intensity (inflection point)
 * - 200μm → 0.55 intensity
 * - 250μm → 0.69 intensity
 * - 350μm → 0.88 intensity
 * - 500μm → 0.98 intensity
 */
export function calculateIntensity(dose_um: number): number {
  const intensity = 1 / (1 + Math.exp(-SIGMOID_STEEPNESS * (dose_um - SIGMOID_MIDPOINT)));
  return Math.round(intensity * 100) / 100; // Round to 2 decimal places
}

// ============================================================================
// Dose Range Classification
// ============================================================================

export function getDoseRange(dose_um: number): DoseRange {
  if (dose_um <= 10) return "threshold";
  if (dose_um <= 50) return "subtle";
  if (dose_um <= 100) return "moderate";
  if (dose_um <= 150) return "significant";
  if (dose_um <= 250) return "strong";
  if (dose_um <= 400) return "intense";
  return "overwhelming";
}

// ============================================================================
// Dose Effects Calculation
// ============================================================================

export function calculateDoseEffects(intensity: number): DoseEffects {
  // Perception
  let perception: DoseEffects["perception"];
  if (intensity < 0.15) perception = "imperceptible";
  else if (intensity < 0.25) perception = "subtle";
  else if (intensity < 0.45) perception = "moderate";
  else if (intensity < 0.60) perception = "significant";
  else if (intensity < 0.85) perception = "intense";
  else perception = "overwhelming";

  // Category fluidity
  let category_fluidity: DoseEffects["category_fluidity"];
  if (intensity < 0.15) category_fluidity = "rigid";
  else if (intensity < 0.30) category_fluidity = "slight";
  else if (intensity < 0.50) category_fluidity = "moderate";
  else if (intensity < 0.70) category_fluidity = "significant";
  else if (intensity < 0.90) category_fluidity = "fluid";
  else category_fluidity = "dissolved";

  // Pattern sensitivity
  let pattern_sensitivity: DoseEffects["pattern_sensitivity"];
  if (intensity < 0.30) pattern_sensitivity = "normal";
  else if (intensity < 0.60) pattern_sensitivity = "heightened";
  else if (intensity < 0.85) pattern_sensitivity = "acute";
  else pattern_sensitivity = "saturated";

  // Associative looseness
  let associative_looseness: DoseEffects["associative_looseness"];
  if (intensity < 0.25) associative_looseness = "tight";
  else if (intensity < 0.55) associative_looseness = "moderate";
  else if (intensity < 0.80) associative_looseness = "loose";
  else associative_looseness = "unbounded";

  return {
    perception,
    category_fluidity,
    pattern_sensitivity,
    associative_looseness,
  };
}

// ============================================================================
// Safety Status Calculation
// ============================================================================

export function calculateSafetyStatus(intensity: number, safetyAnchors: string[]): SafetyStatus {
  // Coherence threshold decreases at higher intensities
  const baseCoherence = 0.9;
  const coherence_threshold = Math.max(0.3, baseCoherence - intensity * 0.5);

  return {
    reality_anchors_active: safetyAnchors.length > 0,
    coherence_threshold: Math.round(coherence_threshold * 100) / 100,
    can_override_nonsense: intensity < 0.85,
  };
}

// ============================================================================
// High Dose Warning
// ============================================================================

export function getHighDoseWarning(dose_um: number): string | undefined {
  if (dose_um >= HIGH_DOSE_WARNING_THRESHOLD) {
    return "⚠️ Extreme dose territory (>400μm). Coherence may be significantly reduced. Outputs may be poetic rather than practical. Ego dissolution effects possible.";
  }
  return undefined;
}

// ============================================================================
// Session Lifecycle Functions (Async)
// ============================================================================

export async function createSession(params: SessionInitParams): Promise<SessionInitResponse> {
  const { dose_um, user_id, safety_anchors = [] } = params;

  const session_id = randomUUID();
  const intensity_coefficient = calculateIntensity(dose_um);
  const now = new Date();
  const expires_at = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const session: Session = {
    session_id,
    dose_um,
    intensity_coefficient,
    session_duration_hours: SESSION_DURATION_HOURS,
    created_at: now.toISOString(),
    expires_at: expires_at.toISOString(),
    user_id,
    safety_anchors,
    current_mode: null,
    status: "initialized",
  };

  const storage = getSessionStorage();
  await storage.save(session);

  const response: SessionInitResponse = {
    session_id,
    dose_um,
    intensity_coefficient,
    session_duration_hours: SESSION_DURATION_HOURS,
    expires_at: expires_at.toISOString(),
    status: "initialized",
    available_modes: AVAILABLE_MODES,
    current_mode: null,
    dose_effects_by_range: calculateDoseEffects(intensity_coefficient),
    safety_status: calculateSafetyStatus(intensity_coefficient, safety_anchors),
  };

  const warning = getHighDoseWarning(dose_um);
  if (warning) {
    response.warning = warning;
  }

  return response;
}

export async function getSession(session_id: string): Promise<Session | null> {
  const storage = getSessionStorage();
  return storage.get(session_id);
}

export async function getActiveSession(): Promise<Session | null> {
  // In remote mode with user context, get session for that user
  if (currentUserId) {
    return getActiveSessionForUser(currentUserId);
  }

  // In local mode, get from local storage
  const storage = getSessionStorage();
  return storage.getActive();
}

export function isSessionExpired(session: Session): boolean {
  return new Date() > new Date(session.expires_at);
}

export async function setCurrentMode(mode: ModeType): Promise<void> {
  const session = await getActiveSession();
  if (session) {
    const storage = getSessionStorage();
    await storage.update(session.session_id, {
      current_mode: mode,
      status: "active",
    });
  }
}

// ============================================================================
// Dose Adjustment
// ============================================================================

export async function adjustDose(params: AdjustDoseParams): Promise<AdjustDoseResponse> {
  let session = await getActiveSession();

  if (!session) {
    // Auto-create session at default dose, then adjust to new dose
    await createSession({
      dose_um: DEFAULT_DOSE_UM,
      user_id: currentUserId || "auto-initialized",
    });
    return adjustDose(params); // Recursive call with new session
  }

  const previous_dose_um = session.dose_um;
  const previous_intensity = session.intensity_coefficient;
  const new_intensity = calculateIntensity(params.new_dose_um);

  const storage = getSessionStorage();
  await storage.update(session.session_id, {
    dose_um: params.new_dose_um,
    intensity_coefficient: new_intensity,
  });

  const response: AdjustDoseResponse = {
    session_id: session.session_id,
    previous_dose_um,
    new_dose_um: params.new_dose_um,
    previous_intensity,
    new_intensity,
    dose_effects_by_range: calculateDoseEffects(new_intensity),
  };

  const warning = getHighDoseWarning(params.new_dose_um);
  if (warning) {
    response.warning = warning;
  }

  return response;
}

// ============================================================================
// Auto-Initialize Session (for mode calls without session)
// ============================================================================

export async function ensureSession(): Promise<Session> {
  let session = await getActiveSession();

  if (!session) {
    // Auto-initialize at default dose (50μm)
    await createSession({
      dose_um: DEFAULT_DOSE_UM,
      user_id: currentUserId || "auto-initialized",
      safety_anchors: ["factual_accuracy"],
    });
    session = await getActiveSession();
    if (!session) {
      throw new Error("Failed to create session");
    }
  }

  return session;
}

// ============================================================================
// Session Cleanup (optional utility)
// ============================================================================

export async function clearExpiredSessions(): Promise<number> {
  const storage = getSessionStorage();
  return storage.clearExpired();
}
