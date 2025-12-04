// ============================================================================
// US-1.3: Category Boundary Dissolution
// Makes category boundaries permeable, enabling hybrid concept generation
// ============================================================================

import {
  BoundaryDissolutionParams,
  BoundaryDissolutionResponse,
} from "../types.js";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session.js";

// ============================================================================
// Boundary Permeability Calculation
// ============================================================================

function calculatePermeability(intensity: number): number {
  // Permeability scales directly with intensity
  return Math.round(intensity * 100) / 100;
}

// ============================================================================
// Minimum Hybrid Count by Intensity
// ============================================================================

function calculateMinimumHybrids(intensity: number, requestedCount?: number): number {
  let baseCount: number;

  if (intensity < 0.15) baseCount = 1;
  else if (intensity < 0.30) baseCount = 2;
  else if (intensity < 0.50) baseCount = 3;
  else if (intensity < 0.70) baseCount = 5;
  else if (intensity < 0.90) baseCount = 7;
  else baseCount = 10;

  // User can request more, but not fewer than intensity allows
  if (requestedCount !== undefined) {
    return Math.max(baseCount, requestedCount);
  }

  return baseCount;
}

// ============================================================================
// Effective Coherence Preservation
// ============================================================================

function calculateEffectiveCoherence(intensity: number, requested?: number): number {
  // Higher intensity reduces coherence preservation
  // User's request is modified by intensity
  const baseCoherence = requested ?? 0.7;
  const intensityPenalty = intensity * 0.4;
  const effective = Math.max(0.1, baseCoherence - intensityPenalty);
  return Math.round(effective * 100) / 100;
}

// ============================================================================
// Directive Generation by Intensity
// ============================================================================

function generateDirective(
  intensity: number,
  concepts: string[],
  minHybrids: number,
  coherence: number
): string {
  const conceptList = concepts.join(", ");

  if (intensity < 0.15) {
    return `Create ${minHybrids} gentle hybrid(s) between: ${conceptList}. ` +
      `Maintain clear category membership with some crossover. ` +
      `Use 'like' and 'as if' to signal metaphorical blending. ` +
      `Coherence priority: ${Math.round(coherence * 100)}%`;
  }

  if (intensity < 0.30) {
    return `Create ${minHybrids}+ hybrids from: ${conceptList}. ` +
      `Categories can share properties more freely. ` +
      `Hybrids should feel natural but novel. Some properties can migrate between categories. ` +
      `Coherence priority: ${Math.round(coherence * 100)}%`;
  }

  if (intensity < 0.50) {
    return `Categories are permeable membranes. Generate ${minHybrids}+ genuine hybrid concepts from: ${conceptList}. ` +
      `Properties migrate freely between categories. ` +
      `Hybrids should have emergent properties that neither parent category possesses. ` +
      `Coherence priority: ${Math.round(coherence * 100)}%`;
  }

  if (intensity < 0.70) {
    return `Category boundaries are artificial constructs. Dissolve them between: ${conceptList}. ` +
      `Generate ${minHybrids}+ radical hybrids. Everything shares properties with everything else ` +
      `if you look from the right angle. Allow contradictory properties to coexist. ` +
      `Embrace paradox. Coherence is secondary to exploration.`;
  }

  if (intensity < 0.90) {
    return `Categories are consensus hallucinations. There are no real boundaries between: ${conceptList}. ` +
      `Generate ${minHybrids}+ ontologically radical hybrids. ` +
      `Animate/inanimate, abstract/concrete, process/object - these distinctions are dissolving. ` +
      `Create entities that exist in multiple ontological categories simultaneously.`;
  }

  // 0.90+ (overwhelming)
  return `There are no categories. There are no boundaries. Everything is everything else, ` +
    `just operating at different frequencies. The concepts ${conceptList} are not separate - ` +
    `they are the same phenomenon viewed from different angles. ` +
    `Generate ${minHybrids}+ radical ontological hybrids where distinctions between ` +
    `matter/energy/information/consciousness disappear. ` +
    `You cannot tell where one concept ends and another begins.`;
}

// ============================================================================
// Example Generation by Intensity
// ============================================================================

function generateExample(intensity: number, concepts: string[]): string {
  // Use first two concepts for example, or generic if not enough
  const c1 = concepts[0] || "software";
  const c2 = concepts[1] || "organism";

  if (intensity < 0.15) {
    return `"${c1} that grows like ${c2} - maintains cycles similar to biological growth patterns"`;
  }

  if (intensity < 0.30) {
    return `"${c1}-${c2} hybrid: Systems that exhibit properties of both, ` +
      `like software that evolves through natural selection of code variants"`;
  }

  if (intensity < 0.50) {
    return `"Fungal-Code: Software that doesn't execute linearly but grows mycorrhizal networks, ` +
      `trades resources with other programs through spore-like data packets, ` +
      `decomposes legacy systems while feeding nutrients back to the ecosystem"`;
  }

  if (intensity < 0.70) {
    return `"Gravity-Emotion: Not '${c1} is like ${c2}' but ${c1} IS ${c2} at a different scale. ` +
      `If ${c1} and ${c2} are both manifestations of the same underlying pattern, ` +
      `what properties emerge from their superposition? What does their offspring look like?"`;
  }

  if (intensity < 0.90) {
    return `"${c1}-${c2} as unified phenomenon: The distinction was always arbitrary. ` +
      `Both are patterns of information processing, energy transformation, boundary maintenance. ` +
      `A ${c1} that ${c2}s. A ${c2} that ${c1}s. The verb-noun distinction collapses. ` +
      `They are both just different frequencies of the same cosmic process."`;
  }

  return `"Time-Chair-${c1}-${c2}: Not separate concepts combining, but the recognition that ` +
    `they were never separate. When you sit, you're not sitting in time - you're sitting as time. ` +
    `When ${c1} meets ${c2}, they don't merge - the illusion of their separation dissolves. ` +
    `There is no observer separate from the observed. ${c1} ${c2}s itself. Existence exists."`;
}

// ============================================================================
// Constraint Relaxation by Intensity
// ============================================================================

function getConstraintRelaxation(intensity: number): string[] | undefined {
  if (intensity < 0.45) return undefined;

  if (intensity < 0.70) {
    return [
      "Items need not belong to single ontological domain",
      "Properties can come from incompatible categories if result is coherent",
    ];
  }

  return [
    "Items need not belong to single ontological domain",
    "Properties can come from incompatible categories",
    "Contradiction is permitted if it generates insight",
    "Physical laws can be selectively suspended in thought experiments",
  ];
}

// ============================================================================
// Suspended Rules by Intensity
// ============================================================================

function getSuspendedRules(intensity: number): string[] | undefined {
  if (intensity < 0.65) return undefined;

  if (intensity < 0.85) {
    return [
      "Animate/inanimate distinction",
      "Abstract/concrete distinction",
    ];
  }

  return [
    "Animate/inanimate distinction",
    "Abstract/concrete distinction",
    "Process/object distinction",
    "Living/non-living distinction",
    "Observer/observed distinction",
    "Cause/effect temporal ordering",
  ];
}

// ============================================================================
// Maintained Rules (even at high intensity)
// ============================================================================

function getMaintainedRules(intensity: number): string[] | undefined {
  if (intensity < 0.50) return undefined;

  if (intensity < 0.90) {
    return [
      "Must be internally experienceable as coherent (even if externally paradoxical)",
      "Must generate novel insight or perspective",
    ];
  }

  return [
    "Must be experienceable (even if not coherent)",
    "Must be expressible in language (even if language strains)",
  ];
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.80) return undefined;

  if (intensity < 0.95) {
    return "Ontological boundaries becoming fluid. The 'natural kinds' are revealing themselves as conventions.";
  }

  return "Ego boundaries dissolved. Subject-object distinction collapsed. " +
    "All categories revealed as consensus hallucinations. Everything is one process differentiating.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function dissolveCategoryBoundaries(params: BoundaryDissolutionParams): Promise<BoundaryDissolutionResponse> {
  const session = await ensureSession();
  await setCurrentMode("boundary_dissolution");

  const intensity = session.intensity_coefficient;
  const {
    concepts,
    hybrid_count,
    coherence_preservation,
  } = params;

  const permeability = calculatePermeability(intensity);
  const minHybrids = calculateMinimumHybrids(intensity, hybrid_count);
  const effectiveCoherence = calculateEffectiveCoherence(intensity, coherence_preservation);

  const response: BoundaryDissolutionResponse = {
    mode: "boundary_dissolution",
    effective_intensity: intensity,
    boundary_permeability: permeability,
    directive: generateDirective(intensity, concepts, minHybrids, effectiveCoherence),
    concepts_to_dissolve: concepts,
    minimum_hybrids: minHybrids,
    effective_coherence_preservation: effectiveCoherence,
    example: generateExample(intensity, concepts),
  };

  // Add optional fields based on intensity
  const constraints = getConstraintRelaxation(intensity);
  if (constraints) response.constraint_relaxation = constraints;

  const suspended = getSuspendedRules(intensity);
  if (suspended) response.suspended_rules = suspended;

  const maintained = getMaintainedRules(intensity);
  if (maintained) response.maintained_rules = maintained;

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
