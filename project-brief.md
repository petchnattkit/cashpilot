# CashPilot Project Brief

> **Single Source of Truth** for the CashPilot project.
> Last Updated: January 14, 2026

---

## Overview

**CashPilot** is an AI-powered cashflow dashboard that helps SMEs (Small and Medium Enterprises) plan and manage their organization's financial foundation, giving them the clarity to move forward with confidence.

### Problem Statement

SME owners often struggle with:

- Understanding true cashflow health (not just bank balance)
- Predicting when cash shortages will occur
- Managing payment terms with suppliers and customers
- Identifying risky customers who pay late
- Tracking which products are tying up cash (slow-moving inventory)

### Solution

CashPilot provides:

- Real-time cashflow visualization with predictions
- Risk-adjusted liquidity calculations
- Supplier and customer scoring based on payment behavior
- Cash Conversion Cycle (CCC) tracking
- AI-powered financial insights

---

## Design Philosophy

**"Luxury yet Clean"** - Premium feel without clutter

### Design Tokens

| Token   | Value                       | Usage                        |
| ------- | --------------------------- | ---------------------------- |
| Primary | `#0F2042` (Deep Royal Blue) | Headers, primary actions     |
| Accent  | `#D4AF37` (Gold)            | Highlights, premium elements |
| Success | `#10B981`                   | Positive values, inflows     |
| Warning | `#F59E0B`                   | Alerts, at-risk items        |
| Error   | `#EF4444`                   | Negative values, outflows    |
| Neutral | `#f8fafc` to `#0f172a`      | Backgrounds, text            |

### Typography

- **Font Family**: Inter (fallback: sans-serif)
- **Weights**: 300 (light), 400 (regular), 500 (medium), 600 (semi-bold), 700 (bold)

### Effects

- **Glassmorphism**: `backdrop-blur-xl bg-white/10 border-white/20 shadow-glass`
- **Soft shadows**: Subtle elevation for cards

---

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Charts**: Recharts

### Backend (Planned)

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Disabled for MVP)
- **API**: Supabase Client (direct database access)
- **Data Fetching**: TanStack Query

### Testing

- **Runner**: Vitest
- **DOM Testing**: @testing-library/react
- **User Events**: @testing-library/user-event
- **Coverage**: v8 provider (60% minimum threshold enforced)

---

## Prototype Reference

> **File**: `prototype.jsx` (76KB)
>
> This file contains a complete mockup of the intended application.
> Use it as a visual and functional reference for implementation.

---

## Project Structure

```
cashpilot/
├── src/
│   ├── assets/               # Static assets (images)
│   ├── components/
│   │   ├── layout/           # Layout components
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NavLink.tsx
│   │   │   └── index.ts
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx (Pending)
│   │   │   ├── Chart.tsx (Pending)
│   │   │   └── index.ts
│   │   └── DesignSandbox.tsx # Design system visualization
│   ├── hooks/
│   │   └── useDebounce.ts    # Debounce hook for search
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── SuppliersPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── index.ts
│   ├── test/
│   │   └── setup.ts          # Test configuration
│   ├── App.tsx               # Main app with routing
│   ├── App.css
│   ├── index.css             # Global styles + Tailwind
│   └── main.tsx              # Entry point
├── tailwind.config.js        # Design system tokens
├── vite.config.ts
├── vitest.config.ts
├── package.json
└── project-brief.md          # This file (single source of truth)
```

---

## Current Progress

| Category         | Total | Done | Progress |
| ---------------- | ----- | ---- | -------- |
| Setup & Config   | 3     | 3    | 100%     |
| UI Components    | 8     | 6    | 75%      |
| Backend Services | 6     | 0    | 0%       |
| Pages            | 4     | 0    | 0%       |

### Pending Tasks (Priority Order)

1.  **Modal Component (#6)**
    - Portal-based rendering
    - ConfirmDialog variant
    - No animations
2.  **Chart Component (#16)**
    - Recharts library
    - LineChart & BarChart
    - Design system integration
3.  **Supabase Setup (#7)**
    - Install client
    - Context setup
    - TanStack Query setup
4.  **Database Schema (#9)**
    - SQL migrations
    - TypeScript types

---

## Development Conventions

### Git Workflow

1.  Create branch `cp-<issue>-<name>`
2.  Implement & Test
3.  Create PR
4.  Review & Merge (Squash)

### Component Patterns

- **Named Exports**: `export const Component = ...`
- **Barrel Exports**: `export * from './Component'` in index.ts
- **Functional**: No class components

### Testing

- **Command**: `npm test -- --run` (Important: use --run to avoid watch mode hang)
- **Coverage**: 60% minimum

---

## Database Schema (Planned)

### Tables

- **suppliers**: id (UUID), name, phone, address, payment_terms, dpo, risk_score
- **customers**: id (UUID), name, phone, address, payment_terms, dso, risk_score
- **transactions**: id (UUID), sku, label, category, date_in, cash_out, date_out, cash_in, supplier_id, customer_id, status

### Environment Variables

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Running Database Migration

To run the database migration:

1.  Go to your Supabase project dashboard -> SQL Editor.
2.  Copy the content of `supabase/migrations/001_initial_schema.sql`.
3.  Paste it into the SQL Editor and click "Run".
