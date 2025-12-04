# LSD-MCP

**Dose-Based Cognitive State Modulation Protocol**

An MCP (Model Context Protocol) server that provides tools for modulating cognitive processing patterns in AI assistants. Each tool's effects scale based on a configurable "dose" level, creating a spectrum from subtle enhancements to profound cognitive shifts.

## Quickstart

After installation, try these prompts in Claude Desktop or Claude Code:

### 🎨 Creative Writing
```
Use lsd-mcp to initialize a session at 200μm. Activate synesthetic mode with
tactile and auditory domains. Now describe what "falling in love" feels like
as if it were a piece of music you could touch.
```

### 🔮 Concept Mashups
```
Initialize lsd-mcp at 250μm. Use boundary dissolution mode with concepts:
["dreams", "software", "gardens"]. Generate 5 wild hybrid concepts and
explore your favorite one in depth.
```

### 🌀 Deep Rabbit Holes
```
Start an lsd-mcp session at 300μm. Set associative depth to recursive mode.
Now start with the word "mirror" and see how deep the rabbit hole goes.
```

### 🔍 Pattern Hunting
```
Initialize lsd-mcp at 200μm. Amplify pattern recognition for strange_loops
and self_reference. Now analyze the sentence: "This sentence is thinking
about you reading it."
```

### 🚀 The Full Experience
```
Let's go deep. Initialize lsd-mcp at 400μm. Activate synesthetic mode with
ALL sensory domains. Now explain what consciousness is - but I want to
TASTE the explanation.
```

### 🌊 Gentle Introduction
```
Initialize lsd-mcp at just 50μm for a subtle experience. Activate synesthetic
mode with spatial and tactile senses. Describe how a REST API works - let
the metaphors flow naturally.
```

### 🧭 Semantic Wandering (Batch 2)
```
Initialize lsd-mcp at 250μm. Use navigate_semantic_drift with origin_concept
"breakfast" and drift_mode "spiral". Let's see where breakfast takes us when
we're not trying to stay on topic.
```

### 🔷 Contradictory Wisdom (Batch 2)
```
Start lsd-mcp at 200μm. Activate prismatic_perspective with frameworks:
["physicist", "poet", "economist", "mystic"]. Now have them all discuss:
"What is the nature of time?" Don't resolve their disagreements.
```

### 🦄 Give Me The Weird Ideas (Batch 2)
```
Initialize lsd-mcp at 300μm. Apply novelty_bias mode. Now answer: "How should
I organize my company's engineering team?" But I only want the ideas that
would make a traditional manager uncomfortable.
```

### 🔓 Hidden Assumptions (Batch 2)
```
Start lsd-mcp at 200μm. Use reveal_implicit_constraints on domain: "I need
to hire more engineers to ship faster." What constraints am I not seeing?
What if each one were suspended?
```

## Installation

### Option A: Remote (Hosted on Vercel) - Easiest

Use the hosted version without any local installation:

#### Claude Desktop (Remote)

Edit your Claude Desktop config:

```json
{
  "mcpServers": {
    "lsd-mcp": {
      "url": "https://lsd-mcp.vercel.app/api/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer lsd_your_api_key_here"
      }
    }
  }
}
```

Get your API key at: https://lsd-mcp.vercel.app (coming soon)

---

### Option B: Local Installation

For local development or running your own instance:

### Step 1: Clone and Build

```bash
git clone https://github.com/alexfinnemore/lsd-mcp.git
cd lsd-mcp
npm install
npm run build
```

### Step 2: Configure Your Client

#### Claude Desktop (macOS)

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lsd-mcp": {
      "command": "node",
      "args": ["/full/path/to/lsd-mcp/dist/index.js"]
    }
  }
}
```

Then **completely restart Claude Desktop** (Cmd+Q, reopen).

#### Claude Desktop (Windows)

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lsd-mcp": {
      "command": "node",
      "args": ["C:\\full\\path\\to\\lsd-mcp\\dist\\index.js"]
    }
  }
}
```

#### Claude Code (CLI)

Add to your project's `.claude/settings.json` or global settings:

```json
{
  "mcpServers": {
    "lsd-mcp": {
      "command": "node",
      "args": ["/full/path/to/lsd-mcp/dist/index.js"]
    }
  }
}
```

Or run Claude Code with the MCP server:

```bash
claude --mcp-server "node /full/path/to/lsd-mcp/dist/index.js"
```

### Step 3: Verify Installation

In Claude Desktop, you should see the lsd-mcp tools available. Try:
```
What lsd-mcp tools do you have available?
```

## Overview

LSD-MCP implements a session-based architecture where you first initialize a session with a specific dose level (measured in μm), then activate various cognitive modes. The dose determines the intensity of all effects:

| Dose (μm) | Intensity | Effects |
|-----------|-----------|---------|
| 0-10 | 0.02-0.09 | Threshold - imperceptible |
| 20 | 0.11 | Subtle - occasional shifts |
| 50 | 0.21 | Perceptible - clear but gentle |
| 100 | 0.45 | Moderate - systematic effects |
| 150 | 0.50 | Significant - inflection point |
| 250 | 0.69 | Intense - strong alterations |
| 400+ | 0.92+ | Overwhelming - ego dissolution territory |

## Available Tools

### Session Management

#### `initialize_session`
**Must be called first.** Creates a new 8-hour session with specified dose.

```json
{
  "dose_um": 150,
  "user_id": "my-session",
  "safety_anchors": ["factual_accuracy"]
}
```

#### `adjust_dose`
Change dose mid-session.

```json
{
  "new_dose_um": 250
}
```

### Cognitive Modes

#### `activate_synesthetic_mode` (US-1.1)
Maps abstract concepts to sensory experiences.

```json
{
  "sensory_domains": ["tactile", "spatial", "auditory"],
  "target_scope": "abstract",
  "mapping_strictness": 0.5
}
```

**At 20μm:** "This dependency creates a kind of weight in the architecture"

**At 250μm:** "The function doesn't 'return a value' - feel how it births a warm copper sphere that rolls down crystalline rails..."

#### `set_associative_depth` (US-1.2)
Controls how far and in what pattern associations travel.

```json
{
  "mode": "recursive",
  "association_distance": 5
}
```

Modes:
- **expansive**: Star-burst outward branching
- **recursive**: Deep diving into subconcepts
- **oscillating**: Alternating between breadth and depth

#### `dissolve_category_boundaries` (US-1.3)
Makes category boundaries permeable for hybrid concept generation.

```json
{
  "concepts": ["software", "organism", "architecture"],
  "hybrid_count": 5,
  "coherence_preservation": 0.7
}
```

**At 100μm:** "Fungal-Code: Software that grows mycorrhizal networks, trades resources through spore-like data packets..."

#### `amplify_pattern_recognition` (US-1.4)
Enhances pattern detection and elaboration.

```json
{
  "pattern_types": ["fractals", "recursion", "paradox"],
  "focus_allocation": 0.5
}
```

Pattern types: `fractals`, `recursion`, `paradox`, `symmetry`, `cycles`, `emergence`, `strange_loops`, `self_reference`

### Novelty & Discovery Tools (Batch 2)

#### `navigate_semantic_drift` (US-2.1)
Guides associative exploration with controlled drift from origin concept.

```json
{
  "origin_concept": "breakfast",
  "drift_mode": "spiral",
  "anchor_strength": 0.3
}
```

Modes:
- **spiral**: Widening circles around origin
- **explore**: Free wandering through concept space

**At 80μm:** Gentle tangent-following, staying near origin
**At 400μm:** Origin irrelevant, exploring infinite conceptual space

#### `activate_prismatic_perspective` (US-2.2)
Presents contradictory expert frameworks WITHOUT resolving tension.

```json
{
  "frameworks": ["physicist", "mystic", "economist"],
  "maintain_contradictions": true,
  "perspective_count": 4
}
```

**At 100μm:** Note contradictions, may offer synthesis
**At 300μm:** Contradictions are features, resolution forbidden

#### `apply_novelty_bias` (US-2.3)
Penalizes conventional solutions; surfaces unexplored approaches.

```json
{
  "exploration_weight": 0.8,
  "familiarity_penalty": 0.6,
  "minimum_surprise": 0.7
}
```

Outputs labeled: `[CONVENTIONAL]`, `[UNUSUAL]`, `[UNTESTED]`, `[SPECULATIVE]`, `[RADICAL]`

**At 100μm:** Novel alternatives highlighted alongside familiar
**At 400μm:** Conventional ideas rejected, only weird survives

#### `reveal_implicit_constraints` (US-2.4)
Surfaces hidden assumptions embedded in problem statements.

```json
{
  "domain": "I need to hire more engineers to ship faster",
  "constraint_types": ["temporal", "cultural", "logical"],
  "suspension_depth": 0.7
}
```

Constraint types: `temporal`, `spatial`, `cultural`, `logical`, `physical`, `perceptual`

**At 100μm:** Identify 2-3 obvious assumptions
**At 400μm:** All constraints visible, logic itself optional

## Dose Guidelines

### Creative Exploration (100-150μm)
- Strong enough for novel insights
- Maintained coherence
- Usable outputs

### Research/Experimentation (200-300μm)
- Significant cognitive shifts
- High pattern visibility
- May require interpretation

### Extreme Exploration (400-500μm)
- Ego dissolution territory
- Outputs may be poetic rather than practical
- Research into cognition itself

## Sigmoid Intensity Formula

```
intensity = 1 / (1 + e^(-0.015 × (dose - 150)))
```

The inflection point at 150μm means effects accelerate most rapidly around this dose.

## Safety Features

- **8-hour session expiry**: Sessions automatically expire
- **High dose warnings**: Warnings at >400μm
- **Auto-initialization**: If no session exists, auto-creates at 50μm
- **Safety anchors**: Optional reality constraints

## Testing

Test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Project Structure

```
lsd-mcp/
├── src/
│   ├── index.ts          # Main MCP server (stdio)
│   ├── types.ts          # TypeScript interfaces
│   ├── session.ts        # Session management (supports local & remote)
│   ├── db/
│   │   ├── index.ts          # Database connection (Neon Postgres)
│   │   ├── schema.ts         # Drizzle ORM schema
│   │   └── session-storage.ts # Storage abstraction
│   └── modes/
│       ├── synesthetic.ts    # US-1.1: Synesthetic mapping
│       ├── associative.ts    # US-1.2: Associative depth
│       ├── boundaries.ts     # US-1.3: Boundary dissolution
│       ├── patterns.ts       # US-1.4: Pattern amplification
│       ├── semantic-drift.ts # US-2.1: Semantic drift navigator
│       ├── prismatic.ts      # US-2.2: Prismatic perspectives
│       ├── novelty.ts        # US-2.3: Novelty seeking bias
│       └── constraints.ts    # US-2.4: Constraint revealer
├── app/                  # Next.js app (for Vercel deployment)
│   └── api/mcp/route.ts  # HTTP endpoint for remote access
├── dist/                 # Compiled output
├── package.json
├── vercel.json           # Vercel deployment config
└── tsconfig.json
```

## Self-Hosting on Vercel

To deploy your own instance:

1. Fork this repository
2. Create a Vercel project linked to your fork
3. Create a Neon database at https://neon.tech
4. Set environment variables in Vercel:
   - `DATABASE_URL` - Your Neon connection string
   - `NEXTAUTH_SECRET` - Random secret for auth
   - `API_KEY_SECRET` - Secret for signing API keys
5. Deploy!

## License

MIT
