# Project Context

## Purpose
**CashPilot** is an AI-powered cashflow dashboard for Small and Medium Enterprises (SMEs). It helps business owners visually track real-time cashflow, predict shortages, and manage supplier/customer risk. The goal is to provide clarity and financial confidence through "Luxury yet Clean" design and data-driven insights.

## Tech Stack
-   **Frontend**: React 18, TypeScript, Vite 7
-   **Styling**: TailwindCSS 3.4, Lucide React (Icons)
-   **State/Data**: TanStack Query, React Context
-   **Routing**: React Router DOM 7
-   **Charts**: Recharts
-   **Backend**: Supabase (PostgreSQL)
-   **Testing**: Vitest, React Testing Library (60% coverage target)

## Project Conventions

### Code Style
-   **Component Structure**: Functional components only. Use named exports (`export const Component = ...`).
-   **Barrel Exports**: Use `index.ts` files to re-export components (`export * from './Component'`).
-   **Imports**: Absolute imports where possible (src/*).
-   **Naming**: PascalCase for components, camelCase for hooks/functions.

### Architecture Patterns
-   **Direct Database Access**: Using Supabase Client directly from the frontend for MVP.
-   **Services Layer**: Business logic (CRUD, scoring) resides in `src/services`, separate from UI components.
-   **Custom Hooks**: Encapsulate data fetching and state logic (e.g., `useTransactions`).

### Engineering Standards
-   **Domain-Driven Design (DDD)**: Group code by features/domain (e.g., `transactions/`, `inventory/`) rather than technical type.
-   **SOLID Principles**: Strictly adhere to modularity. Single Responsibility ensures maintainability.
-   **Official Docs First**: Always consult official documentation (TanStack Query, Supabase, React) before implementing custom workarounds.
-   **React Best Patterns**: 
    -   Prefer Composition over Inheritance.
    -   Use Derived State (avoid `useEffect` for state sync).
    -   Keep Effects minimal.

### Testing Strategy
-   **Unit/Component Tests**: Run with `npm test`.
-   **Coverage**: Maintain at least 60% code coverage.
-   **Tooling**: Vitest with v8 provider.

### Git Workflow
-   **Branches**: Format `cp-<issue>-<name>` (e.g., `cp-123-add-login`).
-   **Merges**: PRs is squash-merged into main/master.

## Domain Context
-   **Cash Conversion Cycle (CCC)**: Key metric for efficiency.
-   **DPO (Days Payable Outstanding)**: Used to score Suppliers.
-   **DSO (Days Sales Outstanding)**: Used to score Customers.
-   **Liquidity vs. Cash**: Focus on "true cashflow health" rather than just bank balance.
-   **Risk Scoring**: Automated scoring for suppliers and customers based on payment behavior.

## Important Constraints
-   **Design Philosophy**: "Luxury yet Clean" - Premium feel, deep royal blue (#0F2042) and gold (#D4AF37) accents.
-   **MVP Scope**: Supabase Auth is disabled for the initial MVP.
-   **Environment**: Node.js 20+.

## External Dependencies
-   **Supabase**: Database, Realtime, and (future) Auth.
-   **Google Fonts**: Inter.
