# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CashPilot** is an AI-powered cashflow dashboard for SMEs (Small and Medium Enterprises). It's a React 18 + TypeScript SPA built with Vite, using Supabase (PostgreSQL) as the backend.

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Type check and build for production
npm run preview          # Preview production build locally

# Testing
npm test                 # Run tests in watch mode
npm test -- --run        # Run tests once (CI mode)
npm run test:ui          # Run tests with Vitest UI

# Linting
npm run lint             # Run ESLint
```

### Running Single Tests

```bash
# Run a specific test file
npm test -- src/components/ui/Button.test.tsx

# Run tests matching a pattern
npm test -- -t "Button"

# Run once without watch mode
npm test -- --run src/components/ui/Button.test.tsx
```

## Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite 7, TailwindCSS 3.4
- **State/Data**: TanStack Query, React Context
- **Routing**: React Router DOM 7
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL) with direct client access
- **Testing**: Vitest with React Testing Library (60% coverage target)

### Directory Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI primitives (Button, Card, Modal, etc.)
│   ├── layout/       # MainLayout, Sidebar, NavLink
│   ├── dashboard/    # Dashboard-specific widgets
│   ├── settings/     # Settings page components
│   └── dev/          # Development utilities (SeedDataButton)
├── pages/            # Route-level page components
├── services/         # Business logic (CRUD, scoring algorithms)
├── hooks/            # Custom React hooks for data fetching
├── context/          # React contexts (Supabase, Query)
├── lib/              # Library setup (Supabase client)
└── types/            # TypeScript definitions (database.ts, metrics.ts)

supabase/
└── migrations/       # Database migration SQL files

openspec/             # Specification-driven development framework
├── project.md        # Project conventions
├── WORKFLOW.md       # Task workflow rules
├── AGENTS.md         # AI assistant instructions
├── specs/            # Current specifications (built capabilities)
└── changes/          # Active change proposals
```

### Key Architectural Patterns

1. **Services Layer**: Business logic (CRUD, scoring) resides in `src/services/`, separate from UI components.
2. **Custom Hooks**: Data fetching is encapsulated in hooks (e.g., `useTransactions`, `useSuppliers`).
3. **Direct Database Access**: Supabase Client is used directly from the frontend for MVP (auth disabled).
4. **Domain-Driven Design**: Code is grouped by features (transactions, suppliers, customers) rather than technical type.
5. **Barrel Exports**: Components use `index.ts` files for clean imports.

### Design System

**Philosophy**: "Luxury yet Clean"
- **Primary**: `#0F2042` (Deep Royal Blue)
- **Accent**: `#D4AF37` (Gold)
- **Font**: Inter

## Development Conventions

### Code Style
- **Components**: Functional components only, named exports (`export const Component = ...`)
- **Naming**: PascalCase for components, camelCase for hooks/functions
- **Imports**: Absolute imports preferred (`src/*`)

### Testing
- Tests are co-located with source files (e.g., `Button.tsx` + `Button.test.tsx`)
- Minimum 60% coverage required
- Test setup in `src/test/setup.ts`

### Git Workflow
- **Branch naming**: `cp-<change-id>-<task-id>` (e.g., `cp-add-core-features-1.1`)
- **Pre-commit**: Runs `npm run lint` via Husky
- **Merges**: Squash merge to main

## OpenSpec Workflow

This project uses **OpenSpec** for specification-driven development. Always check the `openspec/` directory before starting work.

### Essential Commands
```bash
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [change] --strict --no-interactive  # Validate changes
openspec archive <change-id> --yes  # Archive after deployment
```

### When to Create Proposals
Create a change proposal for:
- New features or functionality
- Breaking changes (API, schema)
- Architecture or pattern changes
- Performance optimizations

Skip proposals for:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Tests for existing behavior

### Workflow
1. Read `openspec/project.md`, `openspec/WORKFLOW.md`, and `openspec/AGENTS.md`
2. Check existing specs: `openspec list` and `openspec list --specs`
3. Create proposal in `openspec/changes/<change-id>/`
4. Validate with `openspec validate <change-id> --strict --no-interactive`
5. Get approval before implementing
6. Implement tasks sequentially (1 Task = 1 File)
7. Archive after deployment: `openspec archive <change-id> --yes`

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

## Domain Context

- **Cash Conversion Cycle (CCC)**: Key efficiency metric
- **DPO (Days Payable Outstanding)**: Used to score Suppliers
- **DSO (Days Sales Outstanding)**: Used to score Customers
- **Risk Scoring**: Automated scoring based on payment behavior

## Quality Assurance Skills

This project includes enhanced skills for ensuring code quality. Use them when appropriate:

**Skill Location**: Project-local skills in `.agent/skills/<skill-name>/SKILL.md`
**Invocation**: `/skill <name>` command (e.g., `/skill quality-gate`)

- **`/skill quality-gate`** - Master orchestration combining all quality checks (use before completing any task)
- **`/skill code-reviewer`** - Security (OWASP), performance, SOLID principles, OpenSpec compliance
- **`/skill react-expert`** - React 18 patterns, TanStack Query, Supabase integration, Recharts
- **`/skill tester`** - Vitest, React Testing Library, TDD, 60%+ coverage enforcement

### When to Use Skills

| Situation | Skill to Use |
|-----------|--------------|
| Before marking task complete | `quality-gate` |
| Reviewing code for security issues | `code-reviewer` |
| Implementing React components | `react-expert` |
| Writing tests | `tester` |
| Complex feature implementation | All four in sequence |

### Delegation Protocol

**IMPORTANT**: When continuing from a checkpoint or starting new work, **ALWAYS delegate to sub-agents with the appropriate skills** rather than working directly. See `openspec/WORKFLOW.md` Section 3 for the full Sub-Agent Delegation Protocol.

**Summary**:
- Use `Task` tool with `subagent_type` matching the skill needed
- Provide clear task context and acceptance criteria
- Let specialized sub-agents handle implementation
- Verify results with quality gates before proceeding
