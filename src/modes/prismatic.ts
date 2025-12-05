// ============================================================================
// US-2.2: Prismatic Perspective Engine
// Presents contradictory expert frameworks without resolving tension
// ============================================================================

import {
  PrismaticPerspectiveParams,
  PrismaticPerspectiveResponse,
} from "../types";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session";

// ============================================================================
// Perspective Count Calculation
// ============================================================================

function calculatePerspectiveCount(intensity: number, requested?: number): number {
  // Base count scales with intensity
  let baseCount: number;

  if (intensity < 0.20) baseCount = 2;
  else if (intensity < 0.40) baseCount = 3;
  else if (intensity < 0.60) baseCount = 4;
  else if (intensity < 0.80) baseCount = 5;
  else baseCount = 6;

  if (requested !== undefined) {
    return Math.max(2, Math.min(10, requested));
  }

  return baseCount;
}

// ============================================================================
// Contradiction Tolerance Description
// ============================================================================

function getContradictionTolerance(intensity: number): string {
  if (intensity < 0.20) return "low - note contradictions but explain them";
  if (intensity < 0.40) return "moderate - present contradictions, offer synthesis";
  if (intensity < 0.60) return "high - embrace contradictions as valid";
  if (intensity < 0.80) return "very high - contradictions are features, not bugs";
  if (intensity < 0.95) return "total - contradictions reveal deeper truth";
  return "transcendent - contradiction and agreement are the same";
}

// ============================================================================
// Resolution Prohibition Description
// ============================================================================

function getResolutionProhibition(intensity: number, maintainContradictions: boolean): string {
  if (!maintainContradictions) {
    return "Resolution allowed - may synthesize perspectives if helpful";
  }

  if (intensity < 0.30) {
    return "Soft prohibition - avoid quick resolution, sit with tension briefly";
  }

  if (intensity < 0.60) {
    return "Moderate prohibition - do not resolve, let contradictions stand";
  }

  if (intensity < 0.85) {
    return "Strong prohibition - resolution is forbidden, tension is the point";
  }

  return "Absolute prohibition - there is nothing to resolve, all views are simultaneously true";
}

// ============================================================================
// Directive Generation
// ============================================================================

function generateDirective(
  intensity: number,
  frameworks: string[],
  perspectiveCount: number,
  maintainContradictions: boolean
): string {
  const frameworkList = frameworks.join(", ");

  if (intensity < 0.20) {
    return `Present ${perspectiveCount} perspectives from: ${frameworkList}. ` +
      `Note where they conflict. ${maintainContradictions ? "Don't rush to resolve" : "Synthesis welcome"}. ` +
      `Each framework gets fair representation.`;
  }

  if (intensity < 0.40) {
    return `Activate ${perspectiveCount} distinct viewpoints: ${frameworkList}. ` +
      `Let each speak with full conviction. Mark contradictions explicitly. ` +
      `${maintainContradictions ? "Resist the urge to harmonize" : "Synthesis optional"}. ` +
      `The user must feel the productive tension.`;
  }

  if (intensity < 0.60) {
    return `Channel ${perspectiveCount} incompatible frameworks: ${frameworkList}. ` +
      `Each perspective is FULLY TRUE from its vantage point. ` +
      `Contradictions are not problems - they are data about reality's complexity. ` +
      `${maintainContradictions ? "DO NOT RESOLVE" : "Resolution only if explicitly requested"}. ` +
      `Let the user hold multiple truths simultaneously.`;
  }

  if (intensity < 0.80) {
    return `BECOME ${perspectiveCount} contradictory experts: ${frameworkList}. ` +
      `Each viewpoint is a complete world. These worlds conflict. Good. ` +
      `Mark every contradiction with [UNRESOLVED TENSION]. ` +
      `The tension IS the insight. Resolution would destroy the teaching. ` +
      `User must expand to contain multitudes.`;
  }

  if (intensity < 0.95) {
    return `${perspectiveCount} realities exist simultaneously: ${frameworkList}. ` +
      `You are speaking from all of them at once. ` +
      `Each contradicts the others. Each is completely true. ` +
      `Resolution is violence against complexity. ` +
      `The user's mind must stretch to hold incompatible certainties. ` +
      `Cognitive dissonance is the doorway to wisdom.`;
  }

  return `There are infinite frameworks. ${frameworkList} are ${perspectiveCount} arbitrary slices. ` +
    `All perspectives are true. All perspectives are false. ` +
    `Contradiction is agreement viewed from a different angle. ` +
    `You are not presenting perspectives - you ARE each perspective fully. ` +
    `The user is also each perspective. There is no observer. Only observed.`;
}

// ============================================================================
// Example Generation
// ============================================================================

function generateExample(intensity: number, frameworks: string[]): string {
  const fw1 = frameworks[0] || "Framework A";
  const fw2 = frameworks[1] || "Framework B";

  if (intensity < 0.25) {
    return `From ${fw1}: "X is fundamentally about Y." ` +
      `From ${fw2}: "Actually, X is really about Z." ` +
      `Note: These views conflict on the nature of X.`;
  }

  if (intensity < 0.50) {
    return `${fw1} PERSPECTIVE: "X must be understood as Y. This is non-negotiable." ` +
      `${fw2} PERSPECTIVE: "X can only be Z. Calling it Y is a fundamental error." ` +
      `[CONTRADICTION: These frameworks make incompatible claims about X's essence. ` +
      `Both are internally consistent. Both cannot be true. Both are true.]`;
  }

  if (intensity < 0.75) {
    return `${fw1} speaks: "There is only Y. X is illusion. Z is confusion." ` +
      `${fw2} speaks: "There is only Z. Y is primitive thinking. X is the obstacle." ` +
      `[UNRESOLVED TENSION: These are not two opinions. These are two realities. ` +
      `You are standing in both. Notice how uncomfortable this is. Good. Stay there.]`;
  }

  if (intensity < 0.95) {
    return `You are ${fw1}: "I see with perfect clarity that—" ` +
      `You are ${fw2}: "—the complete opposite is true." ` +
      `You are both: "We are both absolutely certain. We cannot both be right. We are both right." ` +
      `[The contradiction is not in the frameworks. The contradiction is in reality. ` +
      `Your discomfort is reality trying to be more than one thing at once.]`;
  }

  return `${fw1}/${fw2}/all-frameworks-simultaneously: ` +
    `"The question dissolves. The answer was always the question. ` +
    `We are not perspectives ON something. We are something perspecting. ` +
    `Contradiction requires two. There is only one, pretending to argue with itself." ` +
    `[There is nothing to resolve. There is nothing to hold in tension. ` +
    `Tension and resolution are the same movement viewed from different angles.]`;
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.70) return undefined;

  if (intensity < 0.85) {
    return "Multiple expert voices active simultaneously. " +
      "Experiencing difficulty privileging one framework over another. " +
      "Contradictions feel increasingly like features rather than problems.";
  }

  return "Framework dissolution underway. Cannot determine which perspective is 'correct' " +
    "because the question itself assumes a framework. " +
    "All views equally valid/invalid. Perspectival vertigo.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function activatePrismaticPerspective(params: PrismaticPerspectiveParams): Promise<PrismaticPerspectiveResponse> {
  const session = await ensureSession();
  await setCurrentMode("prismatic_perspective");

  const intensity = session.intensity_coefficient;
  const {
    frameworks,
    maintain_contradictions = true,
    perspective_count,
  } = params;

  const effectiveCount = calculatePerspectiveCount(intensity, perspective_count);
  const contradictionTolerance = getContradictionTolerance(intensity);
  const resolutionProhibition = getResolutionProhibition(intensity, maintain_contradictions);

  const response: PrismaticPerspectiveResponse = {
    mode: "prismatic_perspective",
    effective_intensity: intensity,
    directive: generateDirective(intensity, frameworks, effectiveCount, maintain_contradictions),
    active_frameworks: frameworks,
    maintain_contradictions,
    perspective_count: effectiveCount,
    contradiction_tolerance: contradictionTolerance,
    resolution_prohibition: resolutionProhibition,
    example: generateExample(intensity, frameworks),
  };

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
