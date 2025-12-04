// ============================================================================
// MCP HTTP Endpoint for Vercel Deployment
// Streamable HTTP transport for remote MCP clients
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Session management
import {
  createSession,
  adjustDose,
  setCurrentUserId,
} from "../../../dist/session.js";

// Mode implementations - Batch 1
import { activateSynestheticMode } from "../../../dist/modes/synesthetic.js";
import { setAssociativeDepth } from "../../../dist/modes/associative.js";
import { dissolveCategoryBoundaries } from "../../../dist/modes/boundaries.js";
import { amplifyPatternRecognition } from "../../../dist/modes/patterns.js";

// Mode implementations - Batch 2
import { navigateSemanticDrift } from "../../../dist/modes/semantic-drift.js";
import { activatePrismaticPerspective } from "../../../dist/modes/prismatic.js";
import { applyNoveltyBias } from "../../../dist/modes/novelty.js";
import { revealImplicitConstraints } from "../../../dist/modes/constraints.js";

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
} from "../../../dist/types.js";

// ============================================================================
// Authentication Helper
// ============================================================================

async function authenticateRequest(request: NextRequest): Promise<{ userId: string } | null> {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return null;
  }

  // Support Bearer token authentication
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    // Check if it's an API key (starts with lsd_)
    if (token.startsWith("lsd_")) {
      // TODO: Validate API key against database
      // For now, extract a user ID from the key format
      return { userId: `api-key-user-${token.substring(4, 12)}` };
    }

    // Otherwise treat as session token
    // TODO: Validate OAuth session token
    return { userId: `oauth-user-${token.substring(0, 8)}` };
  }

  return null;
}

// ============================================================================
// Tool Handler
// ============================================================================

async function handleToolCall(name: string, args: unknown): Promise<{ content: { type: string; text: string }[]; isError?: boolean }> {
  try {
    switch (name) {
      // Session Management
      case "initialize_session": {
        const params = args as SessionInitParams;
        const result = await createSession(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "adjust_dose": {
        const params = args as AdjustDoseParams;
        const result = await adjustDose(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // Cognitive Modes - Batch 1
      case "activate_synesthetic_mode": {
        const params = args as SynestheticModeParams;
        const result = await activateSynestheticMode(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "set_associative_depth": {
        const params = args as AssociativeDepthParams;
        const result = await setAssociativeDepth(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "dissolve_category_boundaries": {
        const params = args as BoundaryDissolutionParams;
        const result = await dissolveCategoryBoundaries(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "amplify_pattern_recognition": {
        const params = args as PatternAmplificationParams;
        const result = await amplifyPatternRecognition(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      // Cognitive Modes - Batch 2
      case "navigate_semantic_drift": {
        const params = args as SemanticDriftParams;
        const result = await navigateSemanticDrift(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "activate_prismatic_perspective": {
        const params = args as PrismaticPerspectiveParams;
        const result = await activatePrismaticPerspective(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "apply_novelty_bias": {
        const params = args as NoveltyBiasParams;
        const result = await applyNoveltyBias(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "reveal_implicit_constraints": {
        const params = args as ConstraintRevealerParams;
        const result = await revealImplicitConstraints(params);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

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
}

// ============================================================================
// HTTP Handlers
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Please provide a valid API key or OAuth token." },
        { status: 401 }
      );
    }

    // Set user context for session management
    setCurrentUserId(auth.userId);

    const body = await request.json();

    // Handle MCP JSON-RPC requests
    const { method, params, id } = body;

    if (method === "tools/list") {
      // Return tool definitions
      const tools = getToolDefinitions();
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: { tools },
      });
    }

    if (method === "tools/call") {
      const { name, arguments: args } = params;
      const result = await handleToolCall(name, args);
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result,
      });
    }

    // Unknown method
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32601,
        message: `Unknown method: ${method}`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  } finally {
    // Clear user context
    setCurrentUserId(null);
  }
}

export async function GET(request: NextRequest) {
  // Health check / info endpoint
  return NextResponse.json({
    name: "lsd-mcp",
    version: "1.0.0",
    description: "Dose-Based Cognitive State Modulation Protocol",
    status: "online",
    endpoints: {
      mcp: "/api/mcp",
      auth: "/api/auth",
      keys: "/api/keys",
    },
  });
}

export async function OPTIONS(request: NextRequest) {
  // CORS preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// ============================================================================
// Tool Definitions (shared with stdio server)
// ============================================================================

function getToolDefinitions() {
  return [
    {
      name: "initialize_session",
      description:
        "Initialize a new cognitive modulation session with a specific dose level. " +
        "THIS MUST BE CALLED FIRST before using any mode tools. " +
        "Sets the dose for the entire 8-hour session. " +
        "Dose scale: 0-10μm threshold, 50μm subtle, 100μm moderate, 150μm significant, " +
        "250μm intense, 500μm overwhelming. Higher doses = more extreme cognitive effects.",
      inputSchema: {
        type: "object",
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
        type: "object",
        properties: {
          new_dose_um: {
            type: "number",
            description: "New dose in micrograms (μm)",
          },
        },
        required: ["new_dose_um"],
      },
    },
    {
      name: "activate_synesthetic_mode",
      description:
        "Activate synesthetic concept mapping. Maps abstract concepts to sensory experiences.",
      inputSchema: {
        type: "object",
        properties: {
          sensory_domains: {
            type: "array",
            items: {
              type: "string",
              enum: ["visual", "auditory", "tactile", "olfactory", "gustatory", "spatial", "temporal", "kinesthetic"],
            },
            description: "Which sensory channels to map concepts through",
          },
          target_scope: {
            type: "string",
            enum: ["abstract", "concrete", "all"],
            description: "Which types of concepts to apply synesthesia to",
          },
          mapping_strictness: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "How rigidly to enforce sensory mapping (0-1)",
          },
        },
        required: ["sensory_domains"],
      },
    },
    {
      name: "set_associative_depth",
      description:
        "Control how far and in what pattern associations travel.",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["expansive", "recursive", "oscillating"],
            description: "Association pattern",
          },
          association_distance: {
            type: "integer",
            minimum: 1,
            description: "Max semantic hops from origin",
          },
        },
        required: ["mode"],
      },
    },
    {
      name: "dissolve_category_boundaries",
      description:
        "Make category boundaries permeable, enabling hybrid concept generation.",
      inputSchema: {
        type: "object",
        properties: {
          concepts: {
            type: "array",
            items: { type: "string" },
            description: "Categories/concepts to make permeable and blend",
          },
          hybrid_count: {
            type: "integer",
            minimum: 1,
            description: "Minimum number of hybrid concepts to generate",
          },
          coherence_preservation: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "How much logical coherence to maintain (0-1)",
          },
        },
        required: ["concepts"],
      },
    },
    {
      name: "amplify_pattern_recognition",
      description:
        "Enhance pattern detection and elaboration.",
      inputSchema: {
        type: "object",
        properties: {
          pattern_types: {
            type: "array",
            items: {
              type: "string",
              enum: ["fractals", "recursion", "paradox", "symmetry", "cycles", "emergence", "strange_loops", "self_reference"],
            },
            description: "Which pattern types to amplify detection for",
          },
          focus_allocation: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Percentage of response to dedicate to patterns (0-1)",
          },
        },
        required: ["pattern_types"],
      },
    },
    {
      name: "navigate_semantic_drift",
      description:
        "Navigate through associative concept space with controlled drift from origin.",
      inputSchema: {
        type: "object",
        properties: {
          origin_concept: {
            type: "string",
            description: "The starting concept/idea to drift from",
          },
          drift_mode: {
            type: "string",
            enum: ["spiral", "explore"],
            description: "Drift pattern: spiral (widening circles) or explore (free wandering)",
          },
          anchor_strength: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "How strongly to maintain connection to origin (0-1)",
          },
        },
        required: ["origin_concept"],
      },
    },
    {
      name: "activate_prismatic_perspective",
      description:
        "Present multiple contradictory expert frameworks simultaneously WITHOUT resolving tension.",
      inputSchema: {
        type: "object",
        properties: {
          frameworks: {
            type: "array",
            items: { type: "string" },
            description: "Disciplines, worldviews, or expert frameworks to channel",
          },
          maintain_contradictions: {
            type: "boolean",
            description: "If true, explicitly forbid resolving contradictions",
          },
          perspective_count: {
            type: "integer",
            minimum: 2,
            maximum: 10,
            description: "Number of distinct viewpoints to generate",
          },
        },
        required: ["frameworks"],
      },
    },
    {
      name: "apply_novelty_bias",
      description:
        "Penalize conventional solutions and surface unexplored approaches.",
      inputSchema: {
        type: "object",
        properties: {
          exploration_weight: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Weight toward exploration vs exploitation (0-1)",
          },
          familiarity_penalty: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "How aggressively to penalize familiar ideas (0-1)",
          },
          minimum_surprise: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Minimum surprise threshold for ideas (0-1)",
          },
        },
        required: [],
      },
    },
    {
      name: "reveal_implicit_constraints",
      description:
        "Surface hidden assumptions embedded in problem statements and suspend them.",
      inputSchema: {
        type: "object",
        properties: {
          domain: {
            type: "string",
            description: "The problem area or question to analyze for hidden constraints",
          },
          constraint_types: {
            type: "array",
            items: {
              type: "string",
              enum: ["temporal", "spatial", "cultural", "logical", "physical", "perceptual"],
            },
            description: "Which types of constraints to look for",
          },
          suspension_depth: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "How deeply to suspend identified constraints (0-1)",
          },
        },
        required: ["domain"],
      },
    },
  ];
}
