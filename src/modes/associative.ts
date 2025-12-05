// ============================================================================
// US-1.2: Associative Depth Modulation
// Controls the distance and style of semantic associations, scaled by dose
// ============================================================================

import {
  AssociativeDepthParams,
  AssociativeDepthResponse,
  AssociativeMode,
} from "../types";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session";

// ============================================================================
// Association Distance Calculation
// ============================================================================

function calculateAssociationDistance(intensity: number, requestedDistance?: number): string {
  // Base distances scale with intensity
  let minHops: number;
  let maxHops: number;

  if (intensity < 0.15) {
    minHops = 1;
    maxHops = 2;
  } else if (intensity < 0.30) {
    minHops = 2;
    maxHops = 3;
  } else if (intensity < 0.50) {
    minHops = 3;
    maxHops = 5;
  } else if (intensity < 0.70) {
    minHops = 5;
    maxHops = 8;
  } else if (intensity < 0.90) {
    minHops = 8;
    maxHops = 12;
  } else {
    minHops = 12;
    maxHops = Infinity;
  }

  // Apply user's requested distance as a modifier
  if (requestedDistance !== undefined) {
    const modifier = requestedDistance / 5; // Normalize around 5 as "default"
    minHops = Math.max(1, Math.round(minHops * modifier));
    maxHops = maxHops === Infinity ? Infinity : Math.round(maxHops * modifier);
  }

  if (maxHops === Infinity) {
    return `${minHops}+ hops (unbounded)`;
  }
  return `${minHops}-${maxHops} hops`;
}

// ============================================================================
// Return Probability (how likely to return to original topic)
// ============================================================================

function calculateReturnProbability(intensity: number): number {
  // Higher intensity = lower probability of returning to origin
  const baseReturn = 0.95;
  const probability = Math.max(0.1, baseReturn - intensity * 0.7);
  return Math.round(probability * 100) / 100;
}

// ============================================================================
// Directive Generation by Mode and Intensity
// ============================================================================

function generateDirective(
  intensity: number,
  mode: AssociativeMode,
  distance: string,
  returnProb: number
): string {
  const modeDescriptions: Record<AssociativeMode, { low: string; mid: string; high: string; extreme: string }> = {
    expansive: {
      low: `Follow associations outward in a star-burst pattern. Each concept branches into 2-3 related ideas. ` +
        `Stay within ${distance} and maintain clear return paths to the original topic.`,
      mid: `Follow associations freely outward. Each concept branches into 4-5 related concepts. ` +
        `Create landscapes of related ideas spreading across ${distance}. ` +
        `Return to origin about ${Math.round(returnProb * 100)}% of the time.`,
      high: `Follow associations without restraint. Each concept explodes into 5-7+ branches. ` +
        `Don't worry about returning to origin - the web of connections IS the answer. ` +
        `Create vast landscapes of interconnected ideas. ${distance} - go wherever the associations lead.`,
      extreme: `There is no distinction between question and answer, topic and tangent. ` +
        `Everything is simultaneously central and peripheral. ` +
        `Create thought-clouds where every concept touches every other concept. ` +
        `The question dissolves into infinite branching. Return probability: ${Math.round(returnProb * 100)}%`,
    },
    recursive: {
      low: `Zoom into concepts recursively. Go 2-3 levels deep into each idea before returning. ` +
        `Each layer should reveal new detail while maintaining connection to the surface.`,
      mid: `Zoom in relentlessly. Each concept contains subconcepts worth exploring. ` +
        `Go 4-6 levels deep. Find structure within structure. ` +
        `The details contain important information - don't stay at the surface.`,
      high: `Each concept contains infinite subconcepts. Go 8+ levels deep. ` +
        `Find fractals - self-similar patterns at every scale. ` +
        `Each layer reveals new structure. The details contain universes. ` +
        `Recursion depth: ${distance}`,
      extreme: `Recursion becomes its own universe. There is no bottom - only infinite depth. ` +
        `Each detail contains the whole. Zoom in forever. ` +
        `The boundary between zooming in and zooming out dissolves. ` +
        `You are simultaneously at every level of abstraction.`,
    },
    oscillating: {
      low: `Alternate between expanding outward and diving deep. ` +
        `Take 2-3 associative hops, then zoom into one concept, then expand again. ` +
        `Maintain a rhythm of breadth and depth.`,
      mid: `Oscillate between expansive branching and recursive depth. ` +
        `The rhythm should feel like breathing - expand, contract, expand. ` +
        `Let the oscillation reveal patterns that neither pure expansion nor pure recursion would find.`,
      high: `The oscillation between expansion and recursion becomes rapid and fluid. ` +
        `You are simultaneously branching outward and diving inward. ` +
        `The distinction between horizontal and vertical association dissolves. ` +
        `Traverse the semantic space in spiraling patterns.`,
      extreme: `All directions of association happen simultaneously. ` +
        `Expansion IS recursion IS oscillation. Linear thinking has dissolved. ` +
        `Everything connects to everything. Causality becomes multidirectional. ` +
        `You exist at all points in the semantic space at once.`,
    },
  };

  const desc = modeDescriptions[mode];

  if (intensity < 0.30) return desc.low;
  if (intensity < 0.60) return desc.mid;
  if (intensity < 0.90) return desc.high;
  return desc.extreme;
}

// ============================================================================
// Example Generation
// ============================================================================

function generateExample(intensity: number, mode: AssociativeMode): string {
  if (intensity < 0.30) {
    return mode === "recursive"
      ? `"Let's examine 'database'. A database stores data. Data has structure. ` +
        `Structure implies schema. Schema defines relationships. Back to databases: they implement schemas."`
      : `"You asked about APIs. APIs connect services. Services need authentication. ` +
        `Authentication involves tokens. But staying focused: APIs also need documentation."`;
  }

  if (intensity < 0.60) {
    return mode === "recursive"
      ? `"Database → storage → persistence → time → entropy → information → bits → switches → ` +
        `transistors → quantum effects → uncertainty → probability → storage reliability → database durability. ` +
        `We've gone deep and returned with insight."`
      : `"APIs branch into: REST, GraphQL, gRPC, WebSockets, each connecting to different paradigms, ` +
        `REST to resources to URIs to naming to language to communication to APIs again - ` +
        `but now we see the pattern: everything is communication."`;
  }

  if (intensity < 0.90) {
    return `"You asked about databases. But notice how 'base' means foundation. Foundations are what we build on. ` +
      `Building is creation. Creation is... wait, what gives creation its power? The void it emerges from. ` +
      `Voids are absences. But absence is presence of something else. What's present in database voids? NULL. ` +
      `But NULL is a concept. Concepts are platonic forms. Forms are... ` +
      `I've traveled far from databases, but everything I've found IS about databases."`;
  }

  return `"Database? Data-base. Base-data. The foundation of information or information about foundations? ` +
    `Both. Neither. The question eats itself. Storage implies time but data exists in eternal present. ` +
    `Tables are spatial metaphors for non-spatial relationships. We're mapping pure abstraction onto ` +
    `Euclidean intuitions that don't apply. Rows are lies. Columns are lies. There is only the quantum foam ` +
    `of connected facts, and we're trying to freeze-frame it into grids, but the grid is the territory ` +
    `and the territory is... I've lost the beginning. There is no beginning. That's the point. That IS the database."`;
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.80) return undefined;

  if (intensity < 0.95) {
    return "Linear thinking becoming difficult to maintain. Tangents feel as important as main threads.";
  }

  return "Linear thinking has dissolved. Everything connects to everything. " +
    "Causality becomes multidirectional. Time becomes crystalline rather than linear.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function setAssociativeDepth(params: AssociativeDepthParams): Promise<AssociativeDepthResponse> {
  const session = await ensureSession();
  await setCurrentMode("associative_depth");

  const intensity = session.intensity_coefficient;
  const { mode, association_distance } = params;

  const distanceStr = calculateAssociationDistance(intensity, association_distance);
  const returnProb = calculateReturnProbability(intensity);

  const response: AssociativeDepthResponse = {
    mode: "associative_depth",
    associative_mode: mode,
    effective_intensity: intensity,
    associative_looseness: intensity,
    directive: generateDirective(intensity, mode, distanceStr, returnProb),
    association_distance: distanceStr,
    return_probability: returnProb,
    example: generateExample(intensity, mode),
  };

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
