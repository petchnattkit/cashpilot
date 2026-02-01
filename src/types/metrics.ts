/**
 * Cashflow Metrics Types
 *
 * NOTE: These types are designed to be Edge Function compatible.
 * They use only standard TypeScript types with no React or browser dependencies.
 * When migrating to Supabase Edge Functions, copy this file to:
 * supabase/functions/_shared/types/metrics.ts
 */

/**
 * Aggregated cashflow metrics for a given period
 */
export interface CashflowMetrics {
  /** Total incoming cash from all transactions */
  totalCashIn: number;
  /** Total outgoing cash from all transactions */
  totalCashOut: number;
  /** Net cash flow (totalCashIn - totalCashOut) */
  netCashFlow: number;
  /** Current balance (initialBalance + netCashFlow) */
  currentBalance: number;
}

/**
 * Single data point for cashflow chart visualization
 */
export interface ChartDataPoint {
  /** Date in ISO format (YYYY-MM-DD) */
  date: string;
  /** Running balance at this date */
  balance: number;
}

/**
 * Risk score result with metadata
 */
export interface RiskScoreResult {
  /** Risk score from 0-100 (higher = more risk) */
  score: number;
  /** Risk category: low (0-39), medium (40-69), high (70-100) */
  category: 'low' | 'medium' | 'high';
}

/**
 * Runway calculation result
 */
export interface RunwayMetrics {
  /** Estimated months of runway based on current burn rate */
  months: number;
  /** Monthly burn rate */
  burnRate: number;
  /** Current available cash */
  availableCash: number;
}

/**
 * Cash flow data aggregated by period (week or month)
 */
export interface CashFlowPeriod {
  /** Period label (e.g., "Week 1", "Jan 2024") */
  period: string;
  /** Total cash in for this period */
  cashIn: number;
  /** Total cash out for this period (positive number) */
  cashOut: number;
  /** Net cash flow (cashIn - cashOut) */
  net: number;
}
