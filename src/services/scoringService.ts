/**
 * Scoring Service - Centralized scoring and prediction logic
 *
 * EDGE FUNCTION COMPATIBLE
 * ========================
 * This module is designed to be easily migrated to Supabase Edge Functions.
 * All functions are:
 * - Pure functions (no side effects)
 * - No React or browser dependencies
 * - No Node.js specific APIs
 * - Uses only standard TypeScript/JavaScript
 *
 * To migrate to Edge Functions:
 * 1. Copy this file to: supabase/functions/_shared/scoringService.ts
 * 2. Copy types/metrics.ts to: supabase/functions/_shared/types/metrics.ts
 * 3. Update imports to use Deno-style imports
 *
 * Example Edge Function usage:
 * ```typescript
 * // supabase/functions/calculate-score/index.ts
 * import { calculateSupplierScore } from '../_shared/scoringService.ts';
 *
 * Deno.serve(async (req) => {
 *   const { dpo } = await req.json();
 *   const result = calculateSupplierScore(dpo);
 *   return new Response(JSON.stringify(result), {
 *     headers: { 'Content-Type': 'application/json' },
 *   });
 * });
 * ```
 */

import type {
  CashflowMetrics,
  ChartDataPoint,
  RiskScoreResult,
  RunwayMetrics,
} from '../types/metrics';

// Re-export types for convenience
export type { CashflowMetrics, ChartDataPoint, RiskScoreResult, RunwayMetrics };

/**
 * Transaction shape for scoring calculations
 * This is a minimal interface to avoid coupling with database types
 */
export interface TransactionForScoring {
  cash_in?: number | null;
  cash_out?: number | null;
  date_in?: string | null;
  date_out?: string | null;
}

/**
 * Determine risk category from score
 */
const getRiskCategory = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 40) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};

/**
 * Calculate supplier risk score based on DPO (Days Payable Outstanding)
 *
 * Business Logic:
 * - Lower DPO = stricter payment terms = higher operational risk
 * - DPO < 15: High risk (70-100) - Very strict terms, cash flow pressure
 * - DPO 15-30: Medium risk (40-69) - Standard terms
 * - DPO > 30: Low risk (0-39) - Generous terms, good cash position
 *
 * @param dpo - Days Payable Outstanding (0+)
 * @returns RiskScoreResult with score (0-100) and category
 */
export const calculateSupplierScore = (dpo: number): RiskScoreResult => {
  let score: number;

  if (dpo < 15) {
    // High Risk: 70-100
    // dpo=0 -> 100, dpo=14 -> 72
    score = Math.max(70, 100 - dpo * 2);
  } else if (dpo <= 30) {
    // Medium Risk: 40-69
    // Linear interpolation: dpo=15 -> 69, dpo=30 -> 40
    score = Math.round(69 + (dpo - 15) * (-29 / 15));
  } else {
    // Low Risk: 0-39
    // dpo=31 -> 38, dpo=50+ -> 0
    score = Math.max(0, 100 - dpo * 2);
  }

  return {
    score,
    category: getRiskCategory(score),
  };
};

/**
 * Calculate customer risk score based on DSO (Days Sales Outstanding)
 *
 * Business Logic:
 * - Higher DSO = slower payer = higher default risk
 * - DSO < 30: Low risk (0-39) - Fast payer, reliable
 * - DSO 30-50: Medium risk (40-69) - Standard payment behavior
 * - DSO > 50: High risk (70-100) - Slow payer, potential default
 *
 * @param dso - Days Sales Outstanding (0+)
 * @returns RiskScoreResult with score (0-100) and category
 */
export const calculateCustomerScore = (dso: number): RiskScoreResult => {
  let score: number;

  if (dso < 30) {
    // Low Risk: 0-39
    // dso=0 -> 0, dso=29 -> ~38
    score = Math.max(0, Math.round(dso * 1.3));
  } else if (dso <= 50) {
    // Medium Risk: 40-69
    // Linear interpolation: dso=30 -> 40, dso=50 -> 69
    score = Math.round(40 + (dso - 30) * 1.45);
  } else {
    // High Risk: 70-100
    // dso=51 -> 70, dso=100+ -> 100
    score = Math.min(100, Math.round(70 + (dso - 50) * 0.6));
  }

  return {
    score,
    category: getRiskCategory(score),
  };
};

/**
 * Calculate basic cashflow metrics from transactions
 *
 * @param transactions - Array of transactions with cash_in/cash_out
 * @param initialBalance - Starting balance (default: 0)
 * @returns CashflowMetrics with totals and current balance
 */
export const calculateCashflowMetrics = (
  transactions: TransactionForScoring[],
  initialBalance: number = 0
): CashflowMetrics => {
  const totalCashIn = transactions.reduce((sum, t) => sum + (t.cash_in || 0), 0);
  const totalCashOut = transactions.reduce((sum, t) => sum + (t.cash_out || 0), 0);
  const netCashFlow = totalCashIn - totalCashOut;
  const currentBalance = initialBalance + netCashFlow;

  return {
    totalCashIn,
    totalCashOut,
    netCashFlow,
    currentBalance,
  };
};

/**
 * Generate chart data points from transactions for cashflow visualization
 *
 * Creates a time-series of running balance based on transaction dates.
 * Handles both cash_in (positive) and cash_out (negative) transactions.
 *
 * @param transactions - Array of transactions with dates and amounts
 * @returns Sorted array of ChartDataPoint with running balance
 */
export const generateCashflowChartData = (
  transactions: TransactionForScoring[]
): ChartDataPoint[] => {
  const events: { date: string; amount: number }[] = [];

  transactions.forEach((t) => {
    if (t.date_in && t.cash_in) {
      events.push({ date: t.date_in, amount: t.cash_in });
    }
    if (t.date_out && t.cash_out) {
      events.push({ date: t.date_out, amount: -t.cash_out });
    }
  });

  // Aggregate amounts by date
  const dailyChanges = new Map<string, number>();
  events.forEach((e) => {
    const current = dailyChanges.get(e.date) || 0;
    dailyChanges.set(e.date, current + e.amount);
  });

  // Sort dates chronologically
  const sortedDates = Array.from(dailyChanges.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Calculate running balance
  let runningBalance = 0;
  return sortedDates.map((date) => {
    runningBalance += dailyChanges.get(date) || 0;
    return { date, balance: runningBalance };
  });
};

/**
 * Calculate runway metrics based on current balance and burn rate
 *
 * @param currentBalance - Available cash
 * @param monthlyBurnRate - Average monthly expenses (must be > 0)
 * @returns RunwayMetrics with months of runway
 */
export const calculateRunway = (currentBalance: number, monthlyBurnRate: number): RunwayMetrics => {
  const months = monthlyBurnRate > 0 ? currentBalance / monthlyBurnRate : 0;

  return {
    months: Math.max(0, months),
    burnRate: monthlyBurnRate,
    availableCash: currentBalance,
  };
};

/**
 * Legacy compatibility functions
 * These match the existing function signatures in supplierService and customerService
 */

/**
 * @deprecated Use calculateSupplierScore() instead - returns full RiskScoreResult
 */
export const calculateSupplierRiskScore = (dpo: number): number => {
  return calculateSupplierScore(dpo).score;
};

/**
 * @deprecated Use calculateCustomerScore() instead - returns full RiskScoreResult
 */
export const calculateCustomerRiskScore = (dso: number): number => {
  return calculateCustomerScore(dso).score;
};
