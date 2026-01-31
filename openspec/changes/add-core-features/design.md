# Design: Core Features Implementation

## Context
We are adding core functionality (Transactions, Dashboard, Inventory, Settings) to CashPilot. The user emphasizes robustness, non-breaking changes, and comprehensive UI testing covering human scenarios.

## Goals
-   Implement new features without breaking existing functionality.
-   Ensure database changes are additive and type-safe.
-   Achieve high confidence through automation testing of user flows.

## Decisions

### Database Schema & Migrations
-   **Approach**: We will use additive migrations to ensure backward compatibility.
-   **New Tables**:
    -   `skus`: id, code, name, description, image_url, created_at.
    -   `categories`: id, name, type (in/out/both), created_at. (Master data for transactions).
-   **Modifications**:
    -   `transactions`: Add nullable foreign keys `sku_id`, `category_id`.
    -   Existing `sku` and `category` text columns in `transactions` (if any) will be preserved or migrated carefully. *Assumption based on README: `transactions` has `sku` and `category` as text/varchar.* We will transition to relations but keep text as fallback or sync if needed, or simply migrate data. *Decision*: We will migrate distinct existing values to the new master tables and link them.

### Testing Strategy
-   **Unit Tests**: For utility logic (scoring, validation).
-   **Component Tests**: For individual widgets and forms (TransactionForm, DashboardCard).
-   **Automation/E2E Tests**:
    -   We will use **Vitest with React Testing Library** for "Integration/Page" tests that simulate full user workflows. This is faster and more stable than browser-based E2E for this stage, but covers the "Human Scenarios" effectively by rendering the full page context.
    -   **Human Scenarios**: We will strictly map the OpenSpec scenarios to test cases.
    -   **Regression**: We will include a regression suite for existing features.

### Interfaces
-   We will update `src/types/database.ts` (or equivalent) to reflect the new schema.
-   We will use `supabase-js` generated types if available, or manually extend the definitions to ensure typescript helps prevent regressions.

## Risks / Trade-offs
-   **Risk**: Migrating existing text-based Categories/SKUs to relation-based might cause data inconsistencies if dirty data exists.
    -   *Mitigation*: The migration script will sanitize and insert distinct values first.
-   **Risk**: UI changes might shift layout for existing users.
    -   *Mitigation*: Strict alignment checks and visual verification.
