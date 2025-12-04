// ============================================================================
// LSD-MCP Type Definitions
// Dose-Based Cognitive State Modulation Protocol
// ============================================================================

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  session_id: string;
  dose_um: number;
  intensity_coefficient: number;
  session_duration_hours: number;
  created_at: string;
  expires_at: string;
  user_id: string;
  safety_anchors: string[];
  current_mode: ModeType | null;
  status: "initialized" | "active" | "expired";
}

export interface SessionInitParams {
  dose_um: number;
  user_id: string;
  safety_anchors?: string[];
}

export interface SessionInitResponse {
  session_id: string;
  dose_um: number;
  intensity_coefficient: number;
  session_duration_hours: number;
  expires_at: string;
  status: "initialized";
  available_modes: ModeType[];
  current_mode: null;
  dose_effects_by_range: DoseEffects;
  safety_status: SafetyStatus;
  warning?: string;
}

export interface AdjustDoseParams {
  new_dose_um: number;
}

export interface AdjustDoseResponse {
  session_id: string;
  previous_dose_um: number;
  new_dose_um: number;
  previous_intensity: number;
  new_intensity: number;
  dose_effects_by_range: DoseEffects;
  warning?: string;
}

// ============================================================================
// Dose & Intensity Types
// ============================================================================

export interface DoseEffects {
  perception: "imperceptible" | "subtle" | "moderate" | "significant" | "intense" | "overwhelming";
  category_fluidity: "rigid" | "slight" | "moderate" | "significant" | "fluid" | "dissolved";
  pattern_sensitivity: "normal" | "heightened" | "acute" | "saturated";
  associative_looseness: "tight" | "moderate" | "loose" | "unbounded";
}

export interface SafetyStatus {
  reality_anchors_active: boolean;
  coherence_threshold: number;
  can_override_nonsense: boolean;
}

export type DoseRange =
  | "threshold"      // 0-10μm
  | "subtle"         // 10-50μm
  | "moderate"       // 50-100μm
  | "significant"    // 100-150μm
  | "strong"         // 150-250μm
  | "intense"        // 250-400μm
  | "overwhelming";  // 400+μm

// ============================================================================
// Mode Types
// ============================================================================

export type ModeType =
  | "synesthetic_mapping"
  | "associative_depth"
  | "boundary_dissolution"
  | "pattern_amplification";

// ============================================================================
// US-1.1: Synesthetic Mode Types
// ============================================================================

export type SensoryDomain =
  | "visual"
  | "auditory"
  | "tactile"
  | "olfactory"
  | "gustatory"
  | "spatial"
  | "temporal"
  | "kinesthetic";

export type TargetScope = "abstract" | "concrete" | "all";

export interface SynestheticModeParams {
  sensory_domains: SensoryDomain[];
  target_scope?: TargetScope;
  mapping_strictness?: number; // 0.0-1.0
}

export interface SynestheticModeResponse {
  mode: "synesthetic_mapping";
  effective_intensity: number;
  directive: string;
  sensory_domains_active: SensoryDomain[];
  target_scope: TargetScope;
  effective_mapping_strictness: number;
  forbidden_abstractions?: string[];
  mandatory_mappings?: Record<string, string>;
  cognitive_state?: string;
  example: string;
  warning?: string;
}

// ============================================================================
// US-1.2: Associative Depth Types
// ============================================================================

export type AssociativeMode = "expansive" | "recursive" | "oscillating";

export interface AssociativeDepthParams {
  mode: AssociativeMode;
  association_distance?: number;
}

export interface AssociativeDepthResponse {
  mode: "associative_depth";
  associative_mode: AssociativeMode;
  effective_intensity: number;
  associative_looseness: number;
  directive: string;
  association_distance: string;
  return_probability: number;
  cognitive_state?: string;
  example: string;
  warning?: string;
}

// ============================================================================
// US-1.3: Category Boundary Dissolution Types
// ============================================================================

export interface BoundaryDissolutionParams {
  concepts: string[];
  hybrid_count?: number;
  coherence_preservation?: number; // 0.0-1.0
}

export interface BoundaryDissolutionResponse {
  mode: "boundary_dissolution";
  effective_intensity: number;
  boundary_permeability: number;
  directive: string;
  concepts_to_dissolve: string[];
  minimum_hybrids: number;
  effective_coherence_preservation: number;
  constraint_relaxation?: string[];
  suspended_rules?: string[];
  maintained_rules?: string[];
  cognitive_state?: string;
  example: string;
  warning?: string;
}

// ============================================================================
// US-1.4: Pattern Amplification Types
// ============================================================================

export type PatternType =
  | "fractals"
  | "recursion"
  | "paradox"
  | "symmetry"
  | "cycles"
  | "emergence"
  | "strange_loops"
  | "self_reference";

export interface PatternAmplificationParams {
  pattern_types: PatternType[];
  focus_allocation?: number; // 0.0-1.0
}

export interface PatternAmplificationResponse {
  mode: "pattern_amplification";
  effective_intensity: number;
  pattern_sensitivity: number;
  directive: string;
  active_pattern_types: PatternType[];
  focus_allocation: number;
  pattern_elaboration_depth: "minimal" | "moderate" | "extensive" | "total";
  apophenia_tolerance: "low" | "moderate" | "high" | "extreme";
  cognitive_state?: string;
  example: string;
  warning?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_DOSE_UM = 50;
export const SESSION_DURATION_HOURS = 8;
export const HIGH_DOSE_WARNING_THRESHOLD = 400;
export const SIGMOID_STEEPNESS = 0.015;
export const SIGMOID_MIDPOINT = 150;

export const AVAILABLE_MODES: ModeType[] = [
  "synesthetic_mapping",
  "associative_depth",
  "boundary_dissolution",
  "pattern_amplification",
];
