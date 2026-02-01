# CashPilot

> AI-powered cashflow dashboard for SMEs

---

## Overview

**CashPilot** helps Small and Medium Enterprises (SMEs) plan and manage their organization's financial foundation, giving them the clarity to move forward with confidence.

### Problem Statement

SME owners often struggle with:

- Understanding true cashflow health (not just bank balance)
- Predicting when cash shortages will occur
- Managing payment terms with suppliers and customers
- Identifying risky customers who pay late

### Solution

CashPilot provides:

- Real-time cashflow visualization with predictions
- Risk-adjusted liquidity calculations
- Supplier and customer scoring based on payment behavior
- Cash Conversion Cycle (CCC) tracking

---

## Features

| Feature          | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| **Dashboard**    | KPI cards (Net Liquidity, Runway, Inflow, Outflow) + Cashflow projection chart       |
| **Transactions** | Track cash inflows/outflows with supplier/customer linking and status management     |
| **Suppliers**    | Manage suppliers with automatic risk scoring based on DPO (Days Payable Outstanding) |
| **Customers**    | Manage customers with automatic risk scoring based on DSO (Days Sales Outstanding)   |

---

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 3.4
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **Charts**: Recharts

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Disabled for MVP)
- **API**: Supabase Client (direct database access)
- **Data Fetching**: TanStack Query

### Testing

- **Runner**: Vitest
- **DOM Testing**: @testing-library/react
- **Coverage**: v8 provider (60% minimum threshold)

---

## Project Structure

```
cashpilot/
├── src/
│   ├── assets/               # Static assets
│   ├── components/
│   │   ├── dev/              # Development utilities (SeedDataButton)
│   │   ├── layout/           # MainLayout, Sidebar, NavLink
│   │   └── ui/               # Reusable UI (Button, Card, Chart, DataTable, Modal, etc.)
│   ├── context/              # React contexts (Supabase, Query)
│   ├── hooks/                # Custom hooks (useTransactions, useSuppliers, useCustomers)
│   ├── lib/                  # Library setup (Supabase client)
│   ├── pages/                # Page components (Dashboard, Transactions, Suppliers, Customers)
│   ├── services/             # Business logic (CRUD operations, scoring)
│   ├── types/                # TypeScript type definitions (database, metrics)
│   └── test/                 # Test setup and utilities
├── supabase/
│   └── migrations/           # Database migration SQL files
├── public/                   # Static public assets
├── tailwind.config.js        # Design system tokens
├── vite.config.ts            # Vite configuration
├── vitest.config.ts          # Test configuration
└── package.json              # Dependencies
```

---

## Design System

**Philosophy**: "Luxury yet Clean" - Premium feel without clutter

### Design Tokens

| Token   | Value                       | Usage                        |
| ------- | --------------------------- | ---------------------------- |
| Primary | `#0F2042` (Deep Royal Blue) | Headers, primary actions     |
| Accent  | `#D4AF37` (Gold)            | Highlights, premium elements |
| Success | `#10B981`                   | Positive values, inflows     |
| Warning | `#F59E0B`                   | Alerts, at-risk items        |
| Error   | `#EF4444`                   | Negative values, outflows    |

### Typography

- **Font Family**: Inter (fallback: sans-serif)
- **Weights**: 300, 400, 500, 600, 700

---

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm
- Supabase account

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/petchnattkit/cashpilot.git
   cd cashpilot
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure environment variables

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Run database migration
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL

5. Start development server
   ```bash
   npm run dev
   ```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

---

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run preview`   | Preview production build |
| `npm test`          | Run tests in watch mode  |
| `npm test -- --run` | Run tests once           |
| `npm run lint`      | Run ESLint               |

---

## Database Schema

### Tables

| Table          | Columns                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `suppliers`    | id, name, phone, address, payment_terms, dpo, risk_score, created_at, updated_at                                         |
| `customers`    | id, name, phone, address, payment_terms, dso, risk_score, created_at, updated_at                                         |
| `transactions` | id, sku, label, category, date_in, cash_out, date_out, cash_in, supplier_id, customer_id, status, created_at, updated_at |

---

## Development Conventions

### Git Workflow

1. Create branch: `cp-<issue>-<name>`
2. Implement & Test
3. Create PR
4. Review & Merge (Squash)

### Component Patterns

- **Named Exports**: `export const Component = ...`
- **Barrel Exports**: `export * from './Component'` in index.ts
- **Functional Only**: No class components

### Testing

- Run tests: `npm test -- --run`
- Minimum coverage: 60%

---

## License

MIT
