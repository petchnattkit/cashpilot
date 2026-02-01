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
  CashFlowPeriod,
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
 * Get ISO week string from date (YYYY-WXX format)
 * Week 1 is the week with the first Thursday of the year
 */
export const getISOWeek = (dateStr: string): string => {
  const date = new Date(dateStr);

  // Create a copy to avoid mutating the original date
  const target = new Date(date.getTime());

  // Adjust to Thursday of the current week (ISO weeks start on Monday)
  // Day of week: 0=Sun, 1=Mon, ..., 6=Sat
  // We want Thursday which is day 4
  const dayOfWeek = date.getDay();
  const daysToThursday = 4 - dayOfWeek;
  target.setDate(date.getDate() + daysToThursday);

  // Get the year for the week (might be different from date's year at year boundaries)
  const weekYear = target.getFullYear();

  // Get first day of the week year
  const firstDayOfYear = new Date(weekYear, 0, 1);

  // Calculate the week number
  // Week 1 contains the first Thursday of the year
  const pastDays = (target.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const weekNr = Math.floor(pastDays / 7) + 1;

  return `${weekYear}-W${weekNr.toString().padStart(2, '0')}`;
};

/**
 * Get year string from date (YYYY format)
 */
export const getYear = (dateStr: string): string => {
  return new Date(dateStr).getFullYear().toString();
};

/**
 * Chart data point with networth for backward compatibility
 */
interface ChartDataPointWithNetworth extends ChartDataPoint {
  networth: number;
}

/**
 * Parse date from various key formats (ISO week, year, or date string)
 */
const parseDateFromKey = (key: string): Date => {
  if (key.includes('-W')) {
    // ISO week format: 2025-W01
    const [yearStr, weekStr] = key.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    // Calculate the date of the first day of the week (Monday)
    // Week 1 is the week with the first Thursday of the year
    const jan4 = new Date(year, 0, 4);
    const jan4Day = jan4.getDay() || 7; // 1=Mon, 7=Sun
    const week1Monday = new Date(year, 0, 4 - jan4Day + 1);
    const daysToAdd = (week - 1) * 7;
    return new Date(week1Monday.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }
  if (key.length === 4 && /^\d{4}$/.test(key)) {
    // Year format: 2025
    return new Date(parseInt(key, 10), 0, 1);
  }
  // Date format: 2025-01-01 or other standard formats
  return new Date(key);
};

/**
 * Helper function to calculate months elapsed between two dates
 * Handles ISO week format (e.g., "2025-W01"), year format (e.g., "2025"), and date format (e.g., "2025-01-01")
 */
const getMonthsElapsed = (startDate: string, currentDate: string): number => {
  const start = parseDateFromKey(startDate);
  const current = parseDateFromKey(currentDate);
  return (current.getFullYear() - start.getFullYear()) * 12 +
    (current.getMonth() - start.getMonth());
};

/**
 * Aggregate transactions by week for chart data
 * Groups transactions by ISO week and calculates running balance per week
 *
 * @param transactions - Array of transactions with dates and amounts
 * @param fixedCost - Optional fixed cost per month to deduct from networth
 * @returns Array of ChartDataPoint with week labels and running balance
 */
export const aggregateByWeek = (
  transactions: TransactionForScoring[],
  fixedCost?: number
): ChartDataPointWithNetworth[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const events: { date: string; amount: number }[] = [];

  transactions.forEach((t) => {
    if (t.date_in && t.cash_in) {
      events.push({ date: t.date_in, amount: t.cash_in });
    }
    if (t.date_out && t.cash_out) {
      events.push({ date: t.date_out, amount: -t.cash_out });
    }
  });

  // Aggregate amounts by week
  const weeklyChanges = new Map<string, number>();
  events.forEach((e) => {
    const weekKey = getISOWeek(e.date);
    const current = weeklyChanges.get(weekKey) || 0;
    weeklyChanges.set(weekKey, current + e.amount);
  });

  // Sort weeks chronologically
  const sortedWeeks = Array.from(weeklyChanges.keys()).sort();

  // Find the first transaction date to calculate elapsed time
  const firstDate = events.length > 0
    ? events.map(e => e.date).sort()[0]
    : sortedWeeks[0];

  // Calculate running balance and networth based on actual time elapsed
  let runningBalance = 0;

  return sortedWeeks.map((date) => {
    runningBalance += weeklyChanges.get(date) || 0;
    // Calculate months elapsed from first date for consistent networth across views
    const monthsElapsed = fixedCost ? getMonthsElapsed(firstDate, date) : 0;
    const accumulatedFixedCost = monthsElapsed * (fixedCost || 0);
    const networth = runningBalance - accumulatedFixedCost;
    return { date, balance: runningBalance, networth };
  });
};

/**
 * Aggregate transactions by year for chart data
 * Groups transactions by year and calculates running balance per year
 *
 * @param transactions - Array of transactions with dates and amounts
 * @param fixedCost - Optional fixed cost per month to deduct from networth
 * @returns Array of ChartDataPoint with year labels and running balance
 */
export const aggregateByYear = (
  transactions: TransactionForScoring[],
  fixedCost?: number
): ChartDataPointWithNetworth[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const events: { date: string; amount: number }[] = [];

  transactions.forEach((t) => {
    if (t.date_in && t.cash_in) {
      events.push({ date: t.date_in, amount: t.cash_in });
    }
    if (t.date_out && t.cash_out) {
      events.push({ date: t.date_out, amount: -t.cash_out });
    }
  });

  // Aggregate amounts by year
  const yearlyChanges = new Map<string, number>();
  events.forEach((e) => {
    const yearKey = getYear(e.date);
    const current = yearlyChanges.get(yearKey) || 0;
    yearlyChanges.set(yearKey, current + e.amount);
  });

  // Sort years chronologically
  const sortedYears = Array.from(yearlyChanges.keys()).sort();

  // Find the first transaction date to calculate elapsed time
  const firstDate = events.length > 0
    ? events.map(e => e.date).sort()[0]
    : sortedYears[0] + '-01-01'; // Use Jan 1st of first year as fallback

  // Calculate running balance and networth based on actual time elapsed
  let runningBalance = 0;

  return sortedYears.map((date) => {
    runningBalance += yearlyChanges.get(date) || 0;
    // Calculate months elapsed from first date for consistent networth across views
    const monthsElapsed = fixedCost ? getMonthsElapsed(firstDate, date + '-01-01') : 0;
    const accumulatedFixedCost = monthsElapsed * (fixedCost || 0);
    const networth = runningBalance - accumulatedFixedCost;
    return { date, balance: runningBalance, networth };
  });
};

/**
 * Calculate average daily cash flow from historical transactions
 * Used for projecting future balances
 */
const calculateAverageDailyCashFlow = (transactions: TransactionForScoring[]): number => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  const events: { date: string; amount: number }[] = [];

  transactions.forEach((t) => {
    if (t.date_in && t.cash_in) {
      events.push({ date: t.date_in, amount: t.cash_in });
    }
    if (t.date_out && t.cash_out) {
      events.push({ date: t.date_out, amount: -t.cash_out });
    }
  });

  if (events.length === 0) {
    return 0;
  }

  // Sort events by date
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const firstDate = new Date(events[0].date);
  const lastDate = new Date(events[events.length - 1].date);
  const daysDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));

  const totalCashFlow = events.reduce((sum, e) => sum + e.amount, 0);
  return totalCashFlow / daysDiff;
};

/**
 * Generate 7-day projection from today
 * Shows next 7 days with 1-day intervals
 *
 * @param currentBalance - Starting balance for projection
 * @param fixedCost - Monthly fixed cost
 * @param avgDailyCashFlow - Average daily cash flow (optional, defaults to 0)
 * @returns Array of ChartDataPoint with projected balances
 */
export const generateWeekProjection = (
  currentBalance: number,
  fixedCost: number = 0,
  avgDailyCashFlow?: number
): ChartDataPointWithNetworth[] => {
  const dataPoints: ChartDataPointWithNetworth[] = [];
  const today = new Date();
  const dailyFixedCost = fixedCost / 30;
  const dailyCashFlow = avgDailyCashFlow ?? 0;

  let runningBalance = currentBalance;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDateKey(date);

    // Add daily cash flow to balance (skip first day as it's "today")
    if (i > 0) {
      runningBalance += dailyCashFlow;
    }

    const accumulatedFixedCost = 1 * dailyFixedCost;
    const networth = runningBalance - accumulatedFixedCost;

    dataPoints.push({
      date: dateStr,
      balance: runningBalance,
      networth
    });
  }

  return dataPoints;
};

/**
 * Generate 30-day projection from today
 * Shows next 30 days with 1-day intervals
 *
 * @param currentBalance - Starting balance for projection
 * @param fixedCost - Monthly fixed cost
 * @param avgDailyCashFlow - Average daily cash flow (optional, defaults to 0)
 * @returns Array of ChartDataPoint with projected balances
 */
export const generateMonthProjection = (
  currentBalance: number,
  fixedCost: number = 0,
  avgDailyCashFlow?: number
): ChartDataPointWithNetworth[] => {
  const dataPoints: ChartDataPointWithNetworth[] = [];
  const today = new Date();
  const dailyFixedCost = fixedCost / 30;
  const dailyCashFlow = avgDailyCashFlow ?? 0;

  let runningBalance = currentBalance;

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = formatDateKey(date);

    // Add daily cash flow to balance (skip first day as it's "today")
    if (i > 0) {
      runningBalance += dailyCashFlow;
    }

    const accumulatedFixedCost = 30 * dailyFixedCost;
    const networth = runningBalance - accumulatedFixedCost;

    dataPoints.push({
      date: dateStr,
      balance: runningBalance,
      networth
    });
  }

  return dataPoints;
};

/**
 * Generate 365-day projection from today
 * Shows next 12 months with 1-month intervals
 *
 * @param currentBalance - Starting balance for projection
 * @param fixedCost - Monthly fixed cost
 * @param avgDailyCashFlow - Average daily cash flow (optional, defaults to 0)
 * @returns Array of ChartDataPoint with projected balances
 */
/**
 * Format a date as YYYY-MM-DD in local timezone
 */
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const generateYearProjection = (
  currentBalance: number,
  fixedCost: number = 0,
  avgDailyCashFlow?: number
): ChartDataPointWithNetworth[] => {
  const dataPoints: ChartDataPointWithNetworth[] = [];
  const today = new Date();
  const dailyCashFlow = avgDailyCashFlow ?? 0;

  let runningBalance = currentBalance;

  for (let i = 0; i < 12; i++) {
    // Create date for the first day of the target month
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const dateStr = formatDateKey(date);

    // Add monthly cash flow to balance (skip first month as it's "this month")
    if (i > 0) {
      runningBalance += dailyCashFlow * 30; // Approximate monthly cash flow
    }

    const accumulatedFixedCost = 30 * fixedCost;
    const networth = runningBalance - accumulatedFixedCost;

    dataPoints.push({
      date: dateStr,
      balance: runningBalance,
      networth
    });
  }

  return dataPoints;
};

/**
 * Generate custom date range projection
 * If range <= 60 days: 1-day intervals
 * If range > 60 days: 1-month intervals
 *
 * @param currentBalance - Starting balance for projection
 * @param fixedCost - Monthly fixed cost
 * @param startDate - Start date for projection (YYYY-MM-DD)
 * @param endDate - End date for projection (YYYY-MM-DD)
 * @param avgDailyCashFlow - Average daily cash flow (optional, defaults to 0)
 * @returns Array of ChartDataPoint with projected balances
 */
export const generateCustomProjection = (
  currentBalance: number,
  fixedCost: number = 0,
  startDate: string,
  endDate: string,
  avgDailyCashFlow?: number
): ChartDataPointWithNetworth[] => {
  const dataPoints: ChartDataPointWithNetworth[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dailyFixedCost = fixedCost / 30;
  const dailyCashFlow = avgDailyCashFlow ?? 0;

  let runningBalance = currentBalance;

  if (daysDiff <= 60) {
    // Use 1-day intervals
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const dateStr = formatDateKey(date);

      // Add daily cash flow (skip first day)
      if (i > 0) {
        runningBalance += dailyCashFlow;
      }

      const accumulatedFixedCost = 1 * dailyFixedCost;
      const networth = runningBalance - accumulatedFixedCost;

      dataPoints.push({
        date: dateStr,
        balance: runningBalance,
        networth
      });
    }
  } else {
    // Use 1-month intervals
    const monthsDiff = Math.ceil(daysDiff / 30);
    for (let i = 0; i < monthsDiff; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const dateStr = formatDateKey(date);

      // Add monthly cash flow (skip first month)
      if (i > 0) {
        runningBalance += dailyCashFlow * 30;
      }

      const accumulatedFixedCost = 30 * fixedCost;
      const networth = runningBalance - accumulatedFixedCost;

      dataPoints.push({
        date: dateStr,
        balance: runningBalance,
        networth
      });
    }
  }

  return dataPoints;
};

/**
 * Generate chart data points from transactions for cashflow visualization
 *
 * Creates a time-series of running balance based on transaction dates.
 * Handles both cash_in (positive) and cash_out (negative) transactions.
 * Optionally deducts fixed costs from the balance over time.
 *
 * NOTE: This now generates FUTURE projections instead of historical aggregations.
 * - Week view: Next 7 days with 1-day intervals
 * - Month view: Next 30 days with 1-day intervals
 * - Year view: Next 12 months with 1-month intervals
 *
 * @param transactions - Array of transactions with dates and amounts (used to calculate average cash flow)
 * @param currentBalance - Starting balance for projection
 * @param fixedCost - Monthly fixed cost to deduct from networth
 * @param scope - Projection scope: 'week', 'month', or 'year' (default: 'month')
 * @returns Sorted array of ChartDataPoint with projected balances
 */
export const generateCashflowChartData = (
  transactions: TransactionForScoring[],
  currentBalance: number,
  fixedCost: number = 0,
  scope: 'week' | 'month' | 'year' = 'month'
): ChartDataPointWithNetworth[] => {
  // Calculate average daily cash flow from historical data for projections
  const avgDailyCashFlow = calculateAverageDailyCashFlow(transactions);

  switch (scope) {
    case 'week':
      return generateWeekProjection(currentBalance, fixedCost, avgDailyCashFlow);
    case 'year':
      return generateYearProjection(currentBalance, fixedCost, avgDailyCashFlow);
    case 'month':
    default:
      return generateMonthProjection(currentBalance, fixedCost, avgDailyCashFlow);
  }
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
 * Aggregate transactions by period (week or month) for cash flow bar chart
 *
 * @param transactions - Array of transactions with cash_in, cash_out, date_in, date_out
 * @param periodType - 'week' or 'month' aggregation
 * @returns Array of CashFlowPeriod with aggregated data
 */
export const aggregateCashFlowByPeriod = (
  transactions: TransactionForScoring[],
  periodType: 'week' | 'month'
): CashFlowPeriod[] => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Collect all cash flow events with their dates
  const events: { date: Date; cashIn: number; cashOut: number }[] = [];

  transactions.forEach((t) => {
    if (t.date_in && t.cash_in && t.cash_in > 0) {
      events.push({
        date: new Date(t.date_in),
        cashIn: t.cash_in,
        cashOut: 0,
      });
    }
    if (t.date_out && t.cash_out && t.cash_out > 0) {
      events.push({
        date: new Date(t.date_out),
        cashIn: 0,
        cashOut: t.cash_out,
      });
    }
  });

  if (events.length === 0) {
    return [];
  }

  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by period
  const periodMap = new Map<string, { cashIn: number; cashOut: number }>();

  events.forEach((event) => {
    const periodKey = getPeriodKey(event.date, periodType);
    const existing = periodMap.get(periodKey) || { cashIn: 0, cashOut: 0 };
    periodMap.set(periodKey, {
      cashIn: existing.cashIn + event.cashIn,
      cashOut: existing.cashOut + event.cashOut,
    });
  });

  // Convert to array and calculate net
  const periods: CashFlowPeriod[] = Array.from(periodMap.entries()).map(
    ([period, values]) => ({
      period,
      cashIn: values.cashIn,
      cashOut: values.cashOut,
      net: values.cashIn - values.cashOut,
    })
  );

  return periods;
};

/**
 * Get period key for grouping transactions
 */
const getPeriodKey = (date: Date, periodType: 'week' | 'month'): string => {
  if (periodType === 'month') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // For weeks, calculate week number within the year
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDays = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
  const weekNumber = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
  return `Week ${weekNumber}`;
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
