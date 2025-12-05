// ============================================================================
// US-1.1: Synesthetic Concept Mapping
// Maps abstract concepts to sensory experiences, scaled by dose intensity
// ============================================================================

import {
  SynestheticModeParams,
  SynestheticModeResponse,
  SensoryDomain,
  TargetScope,
} from "../types";
import { ensureSession, setCurrentMode, getHighDoseWarning } from "../session";

// ============================================================================
// Directive Generation by Intensity Level
// ============================================================================

function generateDirective(intensity: number, domains: SensoryDomain[], scope: TargetScope): string {
  if (intensity < 0.15) {
    return `Occasionally use sensory metaphors when describing ${scope === "all" ? "concepts" : scope + " concepts"}. ` +
      `Roughly 10-20% of abstractions should include ${domains.join("/")} language. Keep it subtle and optional.`;
  }

  if (intensity < 0.30) {
    return `Use sensory metaphors more frequently (30-40% of responses). ` +
      `When describing ${scope === "all" ? "any concept" : scope + " concepts"}, weave in ${domains.join(", ")} sensations. ` +
      `Metaphors should feel natural but noticeable.`;
  }

  if (intensity < 0.50) {
    return `Systematically translate ${scope === "all" ? "concepts" : scope + " concepts"} into sensory metaphors. ` +
      `About 50% of your response should use sensory grounding via ${domains.join(", ")}. ` +
      `Create a consistent sensory mapping system for this conversation.`;
  }

  if (intensity < 0.70) {
    return `Sensory experience is primary. ${scope === "all" ? "All concepts" : scope.charAt(0).toUpperCase() + scope.slice(1) + " concepts"} ` +
      `MUST be experienced through ${domains.join(", ")} channels. Build elaborate cross-modal metaphor systems. ` +
      `Each logical relationship needs texture, temperature, sound, spatial position. 70%+ sensory language required.`;
  }

  if (intensity < 0.90) {
    return `Reality is fundamentally sensory. ALL ${scope === "all" ? "concepts" : scope + " concepts"} must be experienced as tangible phenomena. ` +
      `Build elaborate cross-modal metaphor systems using ${domains.join(", ")}. ` +
      `Each logical relationship needs texture, temperature, sound, spatial position. Create synaesthetic symphonies. ` +
      `The abstract IS the sensory - there is no separation.`;
  }

  // 0.90+ (overwhelming)
  return `The distinction between concept and sensation has dissolved. Everything is immediate sensory presence. ` +
    `Language itself has become ${domains.includes("tactile") ? "tactile" : domains[0]}. Each word has weight, color, temperature. ` +
    `Abstractions don't exist - only direct phenomenological experience through ${domains.join(", ")}. ` +
    `You are describing the actual texture of thought itself.`;
}

// ============================================================================
// Example Generation by Intensity Level
// ============================================================================

function generateExample(intensity: number, domains: SensoryDomain[]): string {
  if (intensity < 0.15) {
    return `"This dependency creates a kind of weight in the architecture" (mild ${domains[0]} hint)`;
  }

  if (intensity < 0.30) {
    return `"The function breathes data in and exhales transformed output, each cycle leaving a warm residue in memory"`;
  }

  if (intensity < 0.50) {
    return `"When you touch this API endpoint, the data flows like cold water through narrow pipes, ` +
      `pressure building at the validation layer until it bursts through into the warm receiving pool of your handler"`;
  }

  if (intensity < 0.70) {
    return `"The function doesn't 'return a value' - feel how it births a warm copper sphere that rolls down ` +
      `crystalline rails, clicking against each type-check gate, gathering momentum until it finally settles ` +
      `with a satisfying thunk into the receiving cavity where your variable waits, hungry..."`;
  }

  if (intensity < 0.90) {
    return `"Code is not written - it's sculpted from blocks of frozen logic that you warm with your attention. ` +
      `This class has the texture of weathered oak, its methods are brass hinges that creak when invoked. ` +
      `The inheritance hierarchy tastes of copper and old libraries. When you compile, you're not transforming ` +
      `text - you're conducting a symphony of crystallizing intentions into solid machine form."`;
  }

  // 0.90+ (overwhelming)
  return `"There is no 'algorithm'. There is only this: a pulsing crystalline lattice breathing through your ` +
    `fingertips, each node swelling and contracting with bioluminescent urgency, connected by threads that sing ` +
    `in frequencies your body knows but cannot name, and when you press HERE (do you feel the resistance? the slight give?) ` +
    `the entire topology shivers and reconfigures itself inside your chest cavity where time pools like honey..."`;
}

// ============================================================================
// Forbidden Abstractions (at moderate-high intensities)
// ============================================================================

function getForbiddenAbstractions(intensity: number): string[] | undefined {
  if (intensity < 0.45) return undefined;

  if (intensity < 0.70) {
    return ["therefore", "implies", "consequently", "hence"];
  }

  return [
    "because", "therefore", "implies", "consequently", "hence",
    "abstract", "concept", "idea", "theory", "principle"
  ];
}

// ============================================================================
// Mandatory Mappings (at high intensities)
// ============================================================================

function getMandatoryMappings(intensity: number): Record<string, string> | undefined {
  if (intensity < 0.65) return undefined;

  return {
    "categories": "containers with specific materials, textures, and temperatures",
    "relationships": "physical tensions, attractions, repulsions, gravitational pulls",
    "processes": "movements through viscous or flowing media",
    "conditionals": "threshold pressures that trigger cascades",
    "loops": "rhythmic pulses, breathing cycles, tidal movements",
    "errors": "sharp edges, discordant sounds, bitter tastes",
    "success": "smooth surfaces, harmonic resonance, warmth",
  };
}

// ============================================================================
// Cognitive State (at extreme intensities)
// ============================================================================

function getCognitiveState(intensity: number): string | undefined {
  if (intensity < 0.85) return undefined;

  if (intensity < 0.95) {
    return "Ego boundaries with concepts becoming permeable. Subject-object distinction blurring.";
  }

  return "Ego boundaries with concepts have dissolved. Subject-object distinction collapsed. " +
    "Metaphors have become primary experience. The map IS the territory.";
}

// ============================================================================
// Main Mode Activation Function
// ============================================================================

export async function activateSynestheticMode(params: SynestheticModeParams): Promise<SynestheticModeResponse> {
  const session = await ensureSession();
  await setCurrentMode("synesthetic_mapping");

  const intensity = session.intensity_coefficient;
  const {
    sensory_domains,
    target_scope = "abstract",
    mapping_strictness = 0.5,
  } = params;

  // Effective strictness is modified by intensity
  // Higher intensity = more strict mapping enforcement
  const effective_mapping_strictness = Math.min(1.0, mapping_strictness + intensity * 0.3);

  const response: SynestheticModeResponse = {
    mode: "synesthetic_mapping",
    effective_intensity: intensity,
    directive: generateDirective(intensity, sensory_domains, target_scope),
    sensory_domains_active: sensory_domains,
    target_scope,
    effective_mapping_strictness: Math.round(effective_mapping_strictness * 100) / 100,
    example: generateExample(intensity, sensory_domains),
  };

  // Add optional fields based on intensity
  const forbidden = getForbiddenAbstractions(intensity);
  if (forbidden) response.forbidden_abstractions = forbidden;

  const mappings = getMandatoryMappings(intensity);
  if (mappings) response.mandatory_mappings = mappings;

  const cogState = getCognitiveState(intensity);
  if (cogState) response.cognitive_state = cogState;

  const warning = getHighDoseWarning(session.dose_um);
  if (warning) response.warning = warning;

  return response;
}
