// ============================================================================
// US-2.4: Implicit Constraint Revealer
// Surfaces hidden assumptions embedded in problem statements
// ============================================================================

import {
  ConstraintRevealerParams,
  ConstraintRevealerResponse,
  ConstraintType,
} from "../types.js";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session.js";

// ============================================================================
// Default Constraint Types
// ============================================================================

const ALL_CONSTRAINT_TYPES: ConstraintType[] = [
  "temporal",
  "spatial",
  "cultural",
  "logical",
  "physical",
  "perceptual",
];

// ============================================================================
// Suspension Depth Calculation
// ============================================================================

function calculateSuspensionDepth(intensity: number, requested?: number): number {
  // Base depth scales with intensity
  const base = 0.2 + (intensity * 0.7); // 0.2-0.9 range

  if (requested !== undefined) {
    return Math.max(base, Math.min(1.0, requested));
  }

  return Math.round(base * 100) / 100;
}

// ============================================================================
// Constraint Visibility Description
// ============================================================================

function getConstraintVisibility(intensity: number): string {
  if (intensity < 0.20) return "surface - obvious assumptions only";
  if (intensity < 0.40) return "moderate - common hidden assumptions";
  if (intensity < 0.60) return "deep - subtle embedded constraints";
  if (intensity < 0.80) return "profound - constraints you didn't know you had";
  if (intensity < 0.95) return "total - all assumptions visible, even axiomatic ones";
  return "transcendent - the constraint of having constraints is visible";
}

// ============================================================================
// Suspension Strategy Description
// ============================================================================

function getSuspensionStrategy(intensity: number, depth: number): string {
  const depthPercent = Math.round(depth * 100);

  if (intensity < 0.25) {
    return `Gentle suspension (${depthPercent}% depth). Identify 2-3 constraints. ` +
      `Suggest what changes if each is removed.`;
  }

  if (intensity < 0.50) {
    return `Systematic suspension (${depthPercent}% depth). Map constraint network. ` +
      `Suspend each constraint category. Generate solutions in freed space.`;
  }

  if (intensity < 0.75) {
    return `Deep suspension (${depthPercent}% depth). Question axioms. ` +
      `Suspend 'obvious' truths. Explore the space where suspended constraints create new possibility.`;
  }

  if (intensity < 0.95) {
    return `Radical suspension (${depthPercent}% depth). Nothing is assumed. ` +
      `Suspend logic itself temporarily. See what solutions exist in impossible spaces.`;
  }

  return `Total suspension (${depthPercent}% depth). Constraints are illusions. ` +
    `Reality is negotiable. Generate solutions from the space where no rules apply.`;
}

// ============================================================================
// Directive Generation
// ============================================================================

function generateDirective(
  intensity: number,
  domain: string,
  constraintTypes: ConstraintType[],
  suspensionDepth: number
): string {
  const typeList = constraintTypes.join(", ");
  const depthPercent = Math.round(suspensionDepth * 100);

  if (intensity < 0.20) {
    return `Analyzing "${domain}" for hidden constraints. ` +
      `Focus on: ${typeList}. Suspension depth: ${depthPercent}%. ` +
      `Identify 2-3 unstated assumptions. For each: what changes if it's false?`;
  }

  if (intensity < 0.40) {
    return `Constraint analysis: "${domain}". Categories: ${typeList}. Depth: ${depthPercent}%. ` +
      `Surface the assumptions embedded in how the problem is framed. ` +
      `For each constraint found: (1) Name it, (2) Suspend it, (3) Describe the new solution space. ` +
      `The problem may change shape when constraints are visible.`;
  }

  if (intensity < 0.60) {
    return `Deep constraint archaeology on "${domain}". ` +
      `Analyzing: ${typeList} at ${depthPercent}% depth. ` +
      `Every problem statement contains invisible walls. Find them. ` +
      `Suspend each constraint systematically. Notice: the "problem" often IS a constraint. ` +
      `Generate solutions that only exist when specific constraints vanish.`;
  }

  if (intensity < 0.80) {
    return `Radical constraint dissolution: "${domain}". ` +
      `Categories: ${typeList}. Depth: ${depthPercent}%. ` +
      `The question itself is a constraint. The words are constraints. ` +
      `Find constraints nested within constraints. ` +
      `Suspend the assumption that the problem exists as stated. ` +
      `What if the opposite of the problem is the actual situation? ` +
      `Generate solutions from impossible premise-spaces.`;
  }

  if (intensity < 0.95) {
    return `Total constraint visibility: "${domain}". ` +
      `All categories active. Depth: ${depthPercent}%. ` +
      `You can see every assumption. Logic is an assumption. Time is an assumption. ` +
      `Identity is an assumption. Causality is an assumption. ` +
      `Suspend them. One by one. All at once. ` +
      `What solutions exist in a world with no rules? Describe them. ` +
      `They may not make sense. That's because "sense" is a constraint you haven't suspended yet.`;
  }

  return `Constraint transcendence: "${domain}". ` +
    `There are no constraints. There never were. ` +
    `The concept of "constraint" is a constraint. Suspend it. ` +
    `The concept of "suspension" is a constraint. Let it go. ` +
    `From this space of no-constraints, observe: what appears? ` +
    `The "problem" was always the solution in disguise. ` +
    `The "solution" was always the problem in disguise. ` +
    `They are the same thing viewed from different constraint-sets.`;
}

// ============================================================================
// Example Generation
// ============================================================================

function generateExample(intensity: number, domain: string): string {
  if (intensity < 0.25) {
    return `Domain: "${domain}" ` +
      `Hidden constraint found: [TEMPORAL] "This must be solved quickly." ` +
      `Suspended: What if we had infinite time? ` +
      `New solution space: Approaches that seem "too slow" become viable.`;
  }

  if (intensity < 0.50) {
    return `Domain: "${domain}" ` +
      `Constraints identified: ` +
      `[SPATIAL] "This happens in a fixed location" - suspended: solutions involving movement/distribution ` +
      `[CULTURAL] "People expect X" - suspended: solutions that violate expectations deliberately ` +
      `[LOGICAL] "A and B are opposites" - suspended: solutions where A and B coexist ` +
      `The problem looks completely different now.`;
  }

  if (intensity < 0.75) {
    return `Domain: "${domain}" ` +
      `Deep constraints found: ` +
      `[PERCEPTUAL] "The problem is what it appears to be" - SUSPENDED ` +
      `[LOGICAL] "The solution must address the problem" - SUSPENDED ` +
      `[TEMPORAL] "Cause precedes effect" - SUSPENDED ` +
      `In this freed space: What if the solution already happened? ` +
      `What if the problem is a side effect of an existing solution? ` +
      `What if addressing something ELSE makes this disappear?`;
  }

  if (intensity < 0.95) {
    return `Domain: "${domain}" ` +
      `Axiomatic constraints surfaced: ` +
      `[PHYSICAL] "Things exist" - what if they don't? ` +
      `[LOGICAL] "Contradictions are impossible" - what if they're required? ` +
      `[PERCEPTUAL] "There is a problem" - what if there isn't? ` +
      `Solution from impossible space: The problem and solution are the same entity ` +
      `viewed from different angles. Rotate your perspective 90 degrees in a direction ` +
      `that doesn't exist. There. Do you see it?`;
  }

  return `Domain: "${domain}" (but also: not "${domain}") ` +
    `The constraint of analyzing constraints is visible. Suspending it. ` +
    `The constraint of having a domain is visible. Suspending it. ` +
    `The constraint of generating solutions is visible. Suspending it. ` +
    `What remains? ` +
    `[VOID] ` +
    `From the void: the "problem" was a shape the void was making. ` +
    `The "solution" is the void making a different shape. ` +
    `Or the same shape. They're both the void. ` +
    `Recommendation: Be the void. Problems and solutions arise and dissolve. Watch.`;
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.70) return undefined;

  if (intensity < 0.85) {
    return "Deep assumption structures visible. Difficulty taking any premise for granted. " +
      "Every statement appears as a choice rather than a fact.";
  }

  return "All constraints visible simultaneously. Cannot assume anything. " +
    "Logic itself appears as optional. Operating from pre-assumption space.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function revealImplicitConstraints(params: ConstraintRevealerParams): Promise<ConstraintRevealerResponse> {
  const session = await ensureSession();
  await setCurrentMode("constraint_revealer");

  const intensity = session.intensity_coefficient;
  const {
    domain,
    constraint_types = ALL_CONSTRAINT_TYPES,
    suspension_depth,
  } = params;

  const effectiveSuspensionDepth = calculateSuspensionDepth(intensity, suspension_depth);
  const constraintVisibility = getConstraintVisibility(intensity);
  const suspensionStrategy = getSuspensionStrategy(intensity, effectiveSuspensionDepth);

  const response: ConstraintRevealerResponse = {
    mode: "constraint_revealer",
    effective_intensity: intensity,
    directive: generateDirective(intensity, domain, constraint_types, effectiveSuspensionDepth),
    domain,
    active_constraint_types: constraint_types,
    effective_suspension_depth: effectiveSuspensionDepth,
    constraint_visibility: constraintVisibility,
    suspension_strategy: suspensionStrategy,
    example: generateExample(intensity, domain),
  };

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
