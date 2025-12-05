// ============================================================================
// LSD-MCP Server
// Dose-Based Cognitive State Modulation Protocol
// Model Context Protocol server for scaled cognitive effects
// ============================================================================

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Session management
import {
  createSession,
  adjustDose,
  getActiveSession,
} from "./session";

// Mode implementations - Batch 1
import { activateSynestheticMode } from "./modes/synesthetic";
import { setAssociativeDepth } from "./modes/associative";
import { dissolveCategoryBoundaries } from "./modes/boundaries";
import { amplifyPatternRecognition } from "./modes/patterns";

// Mode implementations - Batch 2
import { navigateSemanticDrift } from "./modes/semantic-drift";
import { activatePrismaticPerspective } from "./modes/prismatic";
import { applyNoveltyBias } from "./modes/novelty";
import { revealImplicitConstraints } from "./modes/constraints";

// Types
import type {
  SessionInitParams,
  AdjustDoseParams,
  SynestheticModeParams,
  AssociativeDepthParams,
  BoundaryDissolutionParams,
  PatternAmplificationParams,
  SemanticDriftParams,
  PrismaticPerspectiveParams,
  NoveltyBiasParams,
  ConstraintRevealerParams,
} from "./types";

// ============================================================================
// Server Instance
// ============================================================================

const server = new Server(
  {
    name: "lsd-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ============================================================================
// Tool Definitions
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ========================================
      // Session Management Tools
      // ========================================
      {
        name: "initialize_session",
        description:
          "Initialize a new cognitive modulation session with a specific dose level. " +
          "THIS MUST BE CALLED FIRST before using any mode tools. " +
          "Sets the dose for the entire 8-hour session. " +
          "Dose scale: 0-10μm threshold, 50μm subtle, 100μm moderate, 150μm significant, " +
          "250μm intense, 500μm overwhelming. Higher doses = more extreme cognitive effects.",
        inputSchema: {
          type: "object" as const,
          properties: {
            dose_um: {
              type: "number",
              description:
                "Dose in micrograms (μm). Range: 0-1000+. " +
                "20μm=subtle, 100μm=moderate, 150μm=significant, 250μm=intense, 500μm=overwhelming",
            },
            user_id: {
              type: "string",
              description: "Identifier for session tracking",
            },
            safety_anchors: {
              type: "array",
              items: { type: "string" },
              description:
                "Optional reality constraints to maintain (e.g., 'factual_accuracy', 'user_intent_priority')",
            },
          },
          required: ["dose_um", "user_id"],
        },
      },
      {
        name: "adjust_dose",
        description:
          "Adjust the dose level mid-session. Changes the intensity coefficient " +
          "for all subsequent mode activations. Use to increase or decrease effects.",
        inputSchema: {
          type: "object" as const,
          properties: {
            new_dose_um: {
              type: "number",
              description: "New dose in micrograms (μm)",
            },
          },
          required: ["new_dose_um"],
        },
      },

      // ========================================
      // US-1.1: Synesthetic Concept Mapping
      // ========================================
      {
        name: "activate_synesthetic_mode",
        description:
          "Activate synesthetic concept mapping. Maps abstract concepts to sensory experiences. " +
          "At low doses: occasional sensory metaphors. " +
          "At high doses: ALL concepts become tangible sensory phenomena. " +
          "Dose determines intensity of sensory grounding.",
        inputSchema: {
          type: "object" as const,
          properties: {
            sensory_domains: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "visual",
                  "auditory",
                  "tactile",
                  "olfactory",
                  "gustatory",
                  "spatial",
                  "temporal",
                  "kinesthetic",
                ],
              },
              description: "Which sensory channels to map concepts through",
            },
            target_scope: {
              type: "string",
              enum: ["abstract", "concrete", "all"],
              description: "Which types of concepts to apply synesthesia to (default: abstract)",
            },
            mapping_strictness: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "How rigidly to enforce sensory mapping (0-1). Modified by dose intensity.",
            },
          },
          required: ["sensory_domains"],
        },
      },

      // ========================================
      // US-1.2: Associative Depth Modulation
      // ========================================
      {
        name: "set_associative_depth",
        description:
          "Control how far and in what pattern associations travel. " +
          "Expansive: star-burst outward branching. " +
          "Recursive: deep diving into subconcepts. " +
          "Oscillating: alternating between breadth and depth. " +
          "Dose determines how far associations travel and probability of returning to origin.",
        inputSchema: {
          type: "object" as const,
          properties: {
            mode: {
              type: "string",
              enum: ["expansive", "recursive", "oscillating"],
              description:
                "Association pattern: expansive (breadth), recursive (depth), or oscillating (both)",
            },
            association_distance: {
              type: "integer",
              minimum: 1,
              description:
                "Max semantic hops from origin (modified by dose). Default scales with intensity.",
            },
          },
          required: ["mode"],
        },
      },

      // ========================================
      // US-1.3: Category Boundary Dissolution
      // ========================================
      {
        name: "dissolve_category_boundaries",
        description:
          "Make category boundaries permeable, enabling hybrid concept generation. " +
          "At low doses: gentle metaphorical blending. " +
          "At high doses: ontological categories collapse entirely. " +
          "Generates novel hybrid concepts from the specified categories.",
        inputSchema: {
          type: "object" as const,
          properties: {
            concepts: {
              type: "array",
              items: { type: "string" },
              description: "Categories/concepts to make permeable and blend",
            },
            hybrid_count: {
              type: "integer",
              minimum: 1,
              description: "Minimum number of hybrid concepts to generate (dose sets floor)",
            },
            coherence_preservation: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "How much logical coherence to maintain (0-1). Higher doses reduce this.",
            },
          },
          required: ["concepts"],
        },
      },

      // ========================================
      // US-1.4: Pattern Amplification
      // ========================================
      {
        name: "amplify_pattern_recognition",
        description:
          "Enhance pattern detection and elaboration. " +
          "At low doses: notice obvious patterns. " +
          "At high doses: see patterns everywhere, trace fractals across all scales. " +
          "Warning: High doses may induce apophenia (seeing patterns in noise).",
        inputSchema: {
          type: "object" as const,
          properties: {
            pattern_types: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "fractals",
                  "recursion",
                  "paradox",
                  "symmetry",
                  "cycles",
                  "emergence",
                  "strange_loops",
                  "self_reference",
                ],
              },
              description: "Which pattern types to amplify detection for",
            },
            focus_allocation: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "Percentage of response to dedicate to patterns (0-1). Dose sets minimum.",
            },
          },
          required: ["pattern_types"],
        },
      },

      // ========================================
      // US-2.1: Semantic Drift Navigator
      // ========================================
      {
        name: "navigate_semantic_drift",
        description:
          "Navigate through associative concept space with controlled drift from origin. " +
          "At low doses: gentle tangent-following, staying near origin concept. " +
          "At high doses: origin becomes irrelevant, exploring infinite conceptual space. " +
          "Use when stuck in conventional thinking or seeking unexpected connections.",
        inputSchema: {
          type: "object" as const,
          properties: {
            origin_concept: {
              type: "string",
              description: "The starting concept/idea to drift from",
            },
            drift_mode: {
              type: "string",
              enum: ["spiral", "explore"],
              description:
                "Drift pattern: spiral (widening circles) or explore (free wandering). Default: explore",
            },
            anchor_strength: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "How strongly to maintain connection to origin (0-1). Higher intensity reduces this.",
            },
          },
          required: ["origin_concept"],
        },
      },

      // ========================================
      // US-2.2: Prismatic Perspective Engine
      // ========================================
      {
        name: "activate_prismatic_perspective",
        description:
          "Present multiple contradictory expert frameworks simultaneously WITHOUT resolving tension. " +
          "At low doses: note contradictions, may offer synthesis. " +
          "At high doses: contradictions are features, resolution is forbidden. " +
          "Use for difficult decisions or teaching complex topics with no single correct view.",
        inputSchema: {
          type: "object" as const,
          properties: {
            frameworks: {
              type: "array",
              items: { type: "string" },
              description:
                "Disciplines, worldviews, or expert frameworks to channel (e.g., ['physicist', 'mystic', 'economist'])",
            },
            maintain_contradictions: {
              type: "boolean",
              description:
                "If true, explicitly forbid resolving contradictions. Default: true",
            },
            perspective_count: {
              type: "integer",
              minimum: 2,
              maximum: 10,
              description:
                "Number of distinct viewpoints to generate. Default scales with intensity.",
            },
          },
          required: ["frameworks"],
        },
      },

      // ========================================
      // US-2.3: Novelty Seeking Bias
      // ========================================
      {
        name: "apply_novelty_bias",
        description:
          "Penalize conventional solutions and surface unexplored approaches. " +
          "At low doses: highlight novel alternatives alongside familiar ones. " +
          "At high doses: conventional ideas rejected, only weird survives. " +
          "Outputs labeled: [CONVENTIONAL], [UNUSUAL], [UNTESTED], [SPECULATIVE], [RADICAL].",
        inputSchema: {
          type: "object" as const,
          properties: {
            exploration_weight: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "Weight toward exploration vs exploitation (0-1). Higher = more novel. Default scales with intensity.",
            },
            familiarity_penalty: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "How aggressively to penalize familiar ideas (0-1). Default scales with intensity.",
            },
            minimum_surprise: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "Minimum surprise threshold for ideas to pass filter (0-1). Default scales with intensity.",
            },
          },
          required: [],
        },
      },

      // ========================================
      // US-2.4: Implicit Constraint Revealer
      // ========================================
      {
        name: "reveal_implicit_constraints",
        description:
          "Surface hidden assumptions embedded in problem statements and suspend them. " +
          "At low doses: identify 2-3 obvious assumptions. " +
          "At high doses: all constraints visible including axiomatic ones, logic itself optional. " +
          "Use when feeling stuck or wanting to challenge organizational/personal assumptions.",
        inputSchema: {
          type: "object" as const,
          properties: {
            domain: {
              type: "string",
              description: "The problem area or question to analyze for hidden constraints",
            },
            constraint_types: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "temporal",
                  "spatial",
                  "cultural",
                  "logical",
                  "physical",
                  "perceptual",
                ],
              },
              description:
                "Which types of constraints to look for. Default: all types.",
            },
            suspension_depth: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description:
                "How deeply to suspend identified constraints (0-1). Default scales with intensity.",
            },
          },
          required: ["domain"],
        },
      },
    ],
  };
});

// ============================================================================
// Tool Call Handler
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // ========================================
      // Session Management
      // ========================================
      case "initialize_session": {
        const params = args as unknown as SessionInitParams;
        const result = await createSession(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "adjust_dose": {
        const params = args as unknown as AdjustDoseParams;
        const result = await adjustDose(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // ========================================
      // Cognitive Modes
      // ========================================
      case "activate_synesthetic_mode": {
        const params = args as unknown as SynestheticModeParams;
        const result = await activateSynestheticMode(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "set_associative_depth": {
        const params = args as unknown as AssociativeDepthParams;
        const result = await setAssociativeDepth(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "dissolve_category_boundaries": {
        const params = args as unknown as BoundaryDissolutionParams;
        const result = await dissolveCategoryBoundaries(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "amplify_pattern_recognition": {
        const params = args as unknown as PatternAmplificationParams;
        const result = await amplifyPatternRecognition(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // ========================================
      // Batch 2: Novelty & Discovery Tools
      // ========================================
      case "navigate_semantic_drift": {
        const params = args as unknown as SemanticDriftParams;
        const result = await navigateSemanticDrift(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "activate_prismatic_perspective": {
        const params = args as unknown as PrismaticPerspectiveParams;
        const result = await activatePrismaticPerspective(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "apply_novelty_bias": {
        const params = args as unknown as NoveltyBiasParams;
        const result = await applyNoveltyBias(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "reveal_implicit_constraints": {
        const params = args as unknown as ConstraintRevealerParams;
        const result = await revealImplicitConstraints(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // ========================================
      // Unknown Tool
      // ========================================
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// ============================================================================
// Server Startup
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (never stdout for stdio-based servers!)
  console.error("🧠 lsd-mcp server started");
  console.error("   Dose-Based Cognitive State Modulation Protocol");
  console.error("   Ready to receive tool calls...");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
