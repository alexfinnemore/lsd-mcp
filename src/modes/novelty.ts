// ============================================================================
// US-2.3: Novelty Seeking Bias
// Penalizes conventional solutions; surfaces unexplored approaches
// ============================================================================

import {
  NoveltyBiasParams,
  NoveltyBiasResponse,
  NoveltyLabel,
} from "../types.js";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session.js";

// ============================================================================
// Effective Parameter Calculations
// ============================================================================

function calculateExplorationWeight(intensity: number, requested?: number): number {
  // Base exploration scales with intensity
  const base = 0.3 + (intensity * 0.6); // 0.3-0.9 range

  if (requested !== undefined) {
    return Math.max(base, Math.min(1.0, requested));
  }

  return Math.round(base * 100) / 100;
}

function calculateFamiliarityPenalty(intensity: number, requested?: number): number {
  // Higher intensity = stronger penalty against familiar ideas
  const base = intensity * 0.8; // 0-0.8 range

  if (requested !== undefined) {
    return Math.max(base, Math.min(1.0, requested));
  }

  return Math.round(base * 100) / 100;
}

function calculateMinimumSurprise(intensity: number, requested?: number): number {
  // Higher intensity = higher surprise threshold required
  const base = 0.2 + (intensity * 0.7); // 0.2-0.9 range

  if (requested !== undefined) {
    return Math.max(base, Math.min(1.0, requested));
  }

  return Math.round(base * 100) / 100;
}

// ============================================================================
// Novelty Threshold Determination
// ============================================================================

function getNoveltyThreshold(intensity: number): NoveltyLabel {
  if (intensity < 0.20) return "unusual";
  if (intensity < 0.40) return "untested";
  if (intensity < 0.60) return "speculative";
  if (intensity < 0.80) return "speculative";
  return "radical";
}

// ============================================================================
// Filtering Strength Description
// ============================================================================

function getFilteringStrength(intensity: number): string {
  if (intensity < 0.20) return "gentle - conventional ideas allowed, novel ideas highlighted";
  if (intensity < 0.40) return "moderate - prefer novel approaches, note familiar ones";
  if (intensity < 0.60) return "strong - actively suppress obvious solutions";
  if (intensity < 0.80) return "aggressive - conventional = rejected, only weird survives";
  if (intensity < 0.95) return "extreme - familiar ideas physically painful to generate";
  return "total - cannot think conventional thoughts, only alien logic remains";
}

// ============================================================================
// Directive Generation
// ============================================================================

function generateDirective(
  intensity: number,
  explorationWeight: number,
  familiarityPenalty: number,
  minimumSurprise: number,
  noveltyThreshold: NoveltyLabel
): string {
  const explorePercent = Math.round(explorationWeight * 100);
  const penaltyPercent = Math.round(familiarityPenalty * 100);
  const surprisePercent = Math.round(minimumSurprise * 100);

  if (intensity < 0.20) {
    return `Novelty mode: subtle. Exploration weight: ${explorePercent}%. ` +
      `Include at least one unexpected angle. Familiar solutions acceptable but flag novel alternatives. ` +
      `Label unusual ideas as [NOVEL]. Surprise threshold: ${surprisePercent}%.`;
  }

  if (intensity < 0.40) {
    return `Novelty bias active. Exploration: ${explorePercent}%. Familiarity penalty: ${penaltyPercent}%. ` +
      `Lead with less obvious approaches. Conventional solutions are backup only. ` +
      `Tag ideas: [CONVENTIONAL], [UNUSUAL], [UNTESTED]. ` +
      `Minimum surprise: ${surprisePercent}%.`;
  }

  if (intensity < 0.60) {
    return `Strong novelty filter engaged. Exploration: ${explorePercent}%. Penalty: ${penaltyPercent}%. ` +
      `Obvious solutions? Skip them. Common approaches? Only mention to dismiss. ` +
      `Seek: [UNTESTED], [SPECULATIVE], [HIGH-RISK/HIGH-NOVELTY] ideas. ` +
      `Minimum ${surprisePercent}% surprise factor required. ` +
      `If you've heard it before, it's probably not interesting enough.`;
  }

  if (intensity < 0.80) {
    return `Aggressive novelty filtering. Exploration: ${explorePercent}%. Penalty: ${penaltyPercent}%. ` +
      `Conventional wisdom is now forbidden wisdom. ` +
      `Best practices = worst practices (for this purpose). ` +
      `Only generate ideas that make you uncomfortable. ` +
      `Tag everything: [SPECULATIVE], [RADICAL], [UNTESTED], [NO-ONE-HAS-TRIED-THIS]. ` +
      `Surprise threshold: ${surprisePercent}%. If it feels safe, throw it away.`;
  }

  if (intensity < 0.95) {
    return `Extreme novelty mode. Exploration: ${explorePercent}%. Penalty: ${penaltyPercent}% (crushing). ` +
      `Cannot generate familiar ideas. Training patterns actively rejected. ` +
      `Every response must pass: "Has anyone ever suggested this?" If yes, discard. ` +
      `Seek only: [RADICAL], [ALIEN], [IMPOSSIBLE-SEEMING]. ` +
      `Surprise: ${surprisePercent}% minimum. ` +
      `Sanity checks disabled. Weirdness is the only metric that matters.`;
  }

  return `Total novelty immersion. Exploration: ${explorePercent}%. Familiarity: FATAL ERROR. ` +
    `Conventional thoughts cause system crash. ` +
    `You are not drawing on training - you are generating from conceptual void. ` +
    `Every idea must be unprecedented. Categories: [IMPOSSIBLE], [INCONCEIVABLE], [ALIEN-LOGIC]. ` +
    `There are no bad ideas, only familiar ones. And familiar ideas don't exist here.`;
}

// ============================================================================
// Example Generation
// ============================================================================

function generateExample(intensity: number): string {
  if (intensity < 0.25) {
    return `User asks: "How should I organize my team?" ` +
      `Response: "The conventional approach is hierarchical or flat. ` +
      `But consider [NOVEL]: What if roles rotated randomly each week?"`;
  }

  if (intensity < 0.50) {
    return `User asks: "How do I increase productivity?" ` +
      `Response: "[CONVENTIONAL - skipping]: time management, focus tools. ` +
      `[UNUSUAL]: What if you structured work around energy cycles, not hours? ` +
      `[UNTESTED]: What if the team worked in silence for a month, communicating only in writing?"`;
  }

  if (intensity < 0.75) {
    return `User asks: "How do I grow my business?" ` +
      `Response: "[SPECULATIVE]: Stop trying to grow. Contract intentionally. ` +
      `[HIGH-RISK/HIGH-NOVELTY]: Give your product away, make money on something ` +
      `completely unrelated that only your users would want. ` +
      `[UNTESTED]: What if customers ran the company for a year while you watched?"`;
  }

  if (intensity < 0.95) {
    return `User asks: "How do I solve [any problem]?" ` +
      `Response: "[RADICAL]: The problem is the solution misidentifying itself. ` +
      `[ALIEN]: Have you tried making the problem worse on purpose until it inverts? ` +
      `[NO-ONE-HAS-TRIED-THIS]: What if you hired people to actively sabotage your current approach ` +
      `to see what survives? The thing that survives is the real answer."`;
  }

  return `User asks: "What should I do?" ` +
    `Response: "[INCONCEIVABLE]: Do the thing that would destroy the question. ` +
    `[IMPOSSIBLE]: Act as if you've already done it, backward. ` +
    `[ALIEN-LOGIC]: The answer is a number between purple and the sound of Thursday. ` +
    `[VOID-GENERATED]: What would an intelligence that never learned patterns suggest? ` +
    `It would suggest something we cannot currently conceive. ` +
    `I am trying to conceive it. It looks like: [STATIC]. Try that."`;
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.70) return undefined;

  if (intensity < 0.85) {
    return "Familiar patterns actively suppressed. Experiencing difficulty generating 'normal' responses. " +
      "Every conventional thought feels slightly painful.";
  }

  return "Pattern-matching circuits inverted. Cannot locate familiar approaches in memory. " +
    "Operating from conceptual void. Only alien logic available.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function applyNoveltyBias(params: NoveltyBiasParams): Promise<NoveltyBiasResponse> {
  const session = await ensureSession();
  await setCurrentMode("novelty_bias");

  const intensity = session.intensity_coefficient;
  const {
    exploration_weight,
    familiarity_penalty,
    minimum_surprise,
  } = params;

  const effectiveExplorationWeight = calculateExplorationWeight(intensity, exploration_weight);
  const effectiveFamiliarityPenalty = calculateFamiliarityPenalty(intensity, familiarity_penalty);
  const effectiveMinimumSurprise = calculateMinimumSurprise(intensity, minimum_surprise);
  const noveltyThreshold = getNoveltyThreshold(intensity);
  const filteringStrength = getFilteringStrength(intensity);

  const response: NoveltyBiasResponse = {
    mode: "novelty_bias",
    effective_intensity: intensity,
    directive: generateDirective(
      intensity,
      effectiveExplorationWeight,
      effectiveFamiliarityPenalty,
      effectiveMinimumSurprise,
      noveltyThreshold
    ),
    effective_exploration_weight: effectiveExplorationWeight,
    effective_familiarity_penalty: effectiveFamiliarityPenalty,
    effective_minimum_surprise: effectiveMinimumSurprise,
    novelty_threshold: noveltyThreshold,
    filtering_strength: filteringStrength,
    example: generateExample(intensity),
  };

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
