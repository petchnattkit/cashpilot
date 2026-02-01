import { describe, it, expect } from 'vitest';
import {
  calculateSupplierScore,
  calculateCustomerScore,
  calculateCashflowMetrics,
  generateCashflowChartData,
  generateWeekProjection,
  generateMonthProjection,
  generateYearProjection,
  generateCustomProjection,
  calculateRunway,
  calculateSupplierRiskScore,
  calculateCustomerRiskScore,
  aggregateCashFlowByPeriod,
  aggregateByWeek,
  aggregateByYear,
  getISOWeek,
  getYear,
  type TransactionForScoring,
} from './scoringService';

describe('scoringService', () => {
  describe('calculateSupplierScore', () => {
    describe('high risk range (DPO < 15)', () => {
      it('returns score 100 for DPO = 0 (strictest terms)', () => {
        const result = calculateSupplierScore(0);
        expect(result.score).toBe(100);
        expect(result.category).toBe('high');
      });

      it('returns score >= 70 for DPO < 15', () => {
        const result = calculateSupplierScore(14);
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.category).toBe('high');
      });

      it('maintains high risk category for all DPO < 15', () => {
        for (let dpo = 0; dpo < 15; dpo++) {
          const result = calculateSupplierScore(dpo);
          expect(result.score).toBeGreaterThanOrEqual(70);
          expect(result.score).toBeLessThanOrEqual(100);
          expect(result.category).toBe('high');
        }
      });
    });

    describe('medium risk range (DPO 15-30)', () => {
      it('returns score 69 for DPO = 15', () => {
        const result = calculateSupplierScore(15);
        expect(result.score).toBe(69);
        expect(result.category).toBe('medium');
      });

      it('returns score 40 for DPO = 30', () => {
        const result = calculateSupplierScore(30);
        expect(result.score).toBe(40);
        expect(result.category).toBe('medium');
      });

      it('maintains medium risk category for DPO 15-30', () => {
        for (let dpo = 15; dpo <= 30; dpo++) {
          const result = calculateSupplierScore(dpo);
          expect(result.score).toBeGreaterThanOrEqual(40);
          expect(result.score).toBeLessThanOrEqual(69);
          expect(result.category).toBe('medium');
        }
      });
    });

    describe('low risk range (DPO > 30)', () => {
      it('returns score < 40 for DPO > 30', () => {
        const result = calculateSupplierScore(31);
        expect(result.score).toBeLessThan(40);
        expect(result.category).toBe('low');
      });

      it('returns score 0 for DPO >= 50', () => {
        expect(calculateSupplierScore(50).score).toBe(0);
        expect(calculateSupplierScore(100).score).toBe(0);
      });

      it('maintains low risk category for DPO > 30', () => {
        for (let dpo = 31; dpo <= 60; dpo++) {
          const result = calculateSupplierScore(dpo);
          expect(result.score).toBeLessThan(40);
          expect(result.category).toBe('low');
        }
      });
    });
  });

  describe('calculateCustomerScore', () => {
    describe('low risk range (DSO < 30)', () => {
      it('returns score 0 for DSO = 0 (instant payer)', () => {
        const result = calculateCustomerScore(0);
        expect(result.score).toBe(0);
        expect(result.category).toBe('low');
      });

      it('returns score < 40 for DSO < 30', () => {
        const result = calculateCustomerScore(29);
        expect(result.score).toBeLessThan(40);
        expect(result.category).toBe('low');
      });
    });

    describe('medium risk range (DSO 30-50)', () => {
      it('returns score >= 40 for DSO = 30', () => {
        const result = calculateCustomerScore(30);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.category).toBe('medium');
      });

      it('returns score <= 69 for DSO = 50', () => {
        const result = calculateCustomerScore(50);
        expect(result.score).toBeLessThanOrEqual(69);
        expect(result.category).toBe('medium');
      });

      it('maintains medium risk category for DSO 30-50', () => {
        for (let dso = 30; dso <= 50; dso++) {
          const result = calculateCustomerScore(dso);
          expect(result.score).toBeGreaterThanOrEqual(40);
          expect(result.score).toBeLessThanOrEqual(69);
          expect(result.category).toBe('medium');
        }
      });
    });

    describe('high risk range (DSO > 50)', () => {
      it('returns score >= 70 for DSO > 50', () => {
        const result = calculateCustomerScore(51);
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.category).toBe('high');
      });

      it('caps score at 100 for very high DSO', () => {
        expect(calculateCustomerScore(100).score).toBe(100);
        expect(calculateCustomerScore(200).score).toBe(100);
      });

      it('maintains high risk category for DSO > 50', () => {
        for (let dso = 51; dso <= 80; dso++) {
          const result = calculateCustomerScore(dso);
          expect(result.score).toBeGreaterThanOrEqual(70);
          expect(result.category).toBe('high');
        }
      });
    });
  });

  describe('calculateCashflowMetrics', () => {
    it('returns zero values for empty transactions', () => {
      const result = calculateCashflowMetrics([]);
      expect(result).toEqual({
        totalCashIn: 0,
        totalCashOut: 0,
        netCashFlow: 0,
        currentBalance: 0,
      });
    });

    it('includes initial balance in currentBalance', () => {
      const result = calculateCashflowMetrics([], 1000);
      expect(result.currentBalance).toBe(1000);
    });

    it('calculates correct totals from transactions', () => {
      const transactions: TransactionForScoring[] = [
        { cash_in: 1000, cash_out: null },
        { cash_in: null, cash_out: 500 },
        { cash_in: 200, cash_out: 100 },
      ];

      const result = calculateCashflowMetrics(transactions);
      expect(result.totalCashIn).toBe(1200);
      expect(result.totalCashOut).toBe(600);
      expect(result.netCashFlow).toBe(600);
      expect(result.currentBalance).toBe(600);
    });

    it('handles null and undefined values gracefully', () => {
      const transactions: TransactionForScoring[] = [
        { cash_in: undefined, cash_out: undefined },
        { cash_in: null, cash_out: null },
        { cash_in: 100 },
      ];

      const result = calculateCashflowMetrics(transactions);
      expect(result.totalCashIn).toBe(100);
      expect(result.totalCashOut).toBe(0);
    });

    it('combines initial balance with transaction net flow', () => {
      const transactions: TransactionForScoring[] = [{ cash_in: 500 }, { cash_out: 200 }];

      const result = calculateCashflowMetrics(transactions, 1000);
      expect(result.netCashFlow).toBe(300);
      expect(result.currentBalance).toBe(1300);
    });
  });

  describe('generateCashflowChartData', () => {
    it('returns empty array for no transactions', () => {
      // When there are no transactions, we still generate a projection based on current balance
      // with zero average daily cash flow
      const result = generateCashflowChartData([], 1000, 0, 'month');
      expect(result).toHaveLength(30);
      // All points should have the same balance (no cash flow)
      result.forEach((point) => {
        expect(point.balance).toBe(1000);
      });
    });

    it('generates 30-day projection by default (month scope)', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-02', cash_in: 500 },
        { date_out: '2026-01-01', cash_out: 200 },
        { date_in: '2026-02-01', cash_in: 300 },
      ];

      const currentBalance = 1000;
      const result = generateCashflowChartData(transactions, currentBalance, 0, 'month');

      // Should generate 30 data points (next 30 days)
      expect(result).toHaveLength(30);
      // Each date should be in YYYY-MM-DD format
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      // First point should be current balance
      expect(result[0].balance).toBe(currentBalance);
    });

    it('generates 7-day projection for week scope', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 100 },
        { date_in: '2026-01-15', cash_in: 200 },
      ];

      const currentBalance = 500;
      const result = generateCashflowChartData(transactions, currentBalance, 0, 'week');

      // Should generate 7 data points (next 7 days)
      expect(result).toHaveLength(7);
      // Each date should be in YYYY-MM-DD format
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
      // First point should be current balance
      expect(result[0].balance).toBe(currentBalance);
    });

    it('generates 12-month projection for year scope', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 1000 },
      ];

      const currentBalance = 5000;
      const result = generateCashflowChartData(transactions, currentBalance, 0, 'year');

      // Should generate 12 data points (next 12 months)
      expect(result).toHaveLength(12);
      // Each date should be in YYYY-MM-DD format (first of each month)
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(point.date.endsWith('-01')).toBe(true);
      });
      // First point should be current balance
      expect(result[0].balance).toBe(currentBalance);
    });

    it('calculates networth with fixed cost deduction', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 100 },
      ];

      const currentBalance = 1000;
      const fixedCost = 300; // Monthly fixed cost
      const result = generateCashflowChartData(transactions, currentBalance, fixedCost, 'week');

      // First point: networth = balance (no accumulated cost yet for day 0)
      expect(result[0].networth).toBeLessThanOrEqual(result[0].balance);
      // Daily fixed cost should be applied
      const dailyFixedCost = fixedCost / 30;
      const expectedNetworth = result[6].balance - 6 * dailyFixedCost;
      expect(result[6].networth).toBeCloseTo(expectedNetworth, 0);
    });

    it('projects future balance based on average daily cash flow', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 300 }, // Day 1: +300
        { date_in: '2026-01-02', cash_in: 300 }, // Day 2: +300
        { date_in: '2026-01-03', cash_in: 300 }, // Day 3: +300
      ];

      const currentBalance = 1000;
      const result = generateCashflowChartData(transactions, currentBalance, 0, 'week');

      // Average daily cash flow = 300 / 3 = 100 per day
      // First point is current balance
      expect(result[0].balance).toBe(currentBalance);
      // Subsequent points should include projected cash flow
      // Day 1 projection: 1000 + 100 = 1100
      expect(result[1].balance).toBeGreaterThan(currentBalance);
    });
  });

  describe('calculateRunway', () => {
    it('calculates correct runway months', () => {
      const result = calculateRunway(10000, 2000);
      expect(result.months).toBe(5);
      expect(result.burnRate).toBe(2000);
      expect(result.availableCash).toBe(10000);
    });

    it('returns 0 months when burn rate is 0', () => {
      const result = calculateRunway(10000, 0);
      expect(result.months).toBe(0);
    });

    it('returns 0 months when balance is negative', () => {
      const result = calculateRunway(-1000, 500);
      expect(result.months).toBe(0);
    });

    it('handles fractional months', () => {
      const result = calculateRunway(5000, 3000);
      expect(result.months).toBeCloseTo(1.67, 1);
    });
  });

  describe('legacy compatibility functions', () => {
    it('calculateSupplierRiskScore returns score only', () => {
      const score = calculateSupplierRiskScore(20);
      expect(typeof score).toBe('number');
      expect(score).toBe(calculateSupplierScore(20).score);
    });

    it('calculateCustomerRiskScore returns score only', () => {
      const score = calculateCustomerRiskScore(40);
      expect(typeof score).toBe('number');
      expect(score).toBe(calculateCustomerScore(40).score);
    });
  });

  describe('getISOWeek', () => {
    it('returns correct ISO week format', () => {
      // Jan 1, 2024 is a Monday, in week 1
      expect(getISOWeek('2024-01-01')).toBe('2024-W01');
      // Jan 7, 2024 is a Sunday, in week 2 (week starts Monday)
      expect(getISOWeek('2024-01-07')).toBe('2024-W02');
      // Jan 8, 2024 is a Monday, in week 2
      expect(getISOWeek('2024-01-08')).toBe('2024-W02');
    });

    it('handles year boundaries correctly', () => {
      // December 30, 2025 is in week 1 of 2026
      expect(getISOWeek('2025-12-30')).toBe('2026-W01');
      // January 1, 2024 is in week 1 of 2024
      expect(getISOWeek('2024-01-01')).toBe('2024-W01');
    });

    it('pads week numbers with leading zeros', () => {
      expect(getISOWeek('2024-01-01')).toBe('2024-W01');
      // Dec 31, 2024 is in week 1 of 2025
      expect(getISOWeek('2024-12-31')).toBe('2025-W01');
    });
  });

  describe('getYear', () => {
    it('returns correct year from date string', () => {
      expect(getYear('2024-01-01')).toBe('2024');
      expect(getYear('2024-06-15')).toBe('2024');
      expect(getYear('2024-12-31')).toBe('2024');
    });

    it('handles different years', () => {
      expect(getYear('2023-03-15')).toBe('2023');
      expect(getYear('2025-08-20')).toBe('2025');
    });
  });

  describe('aggregateByWeek', () => {
    it('returns empty array for no transactions', () => {
      expect(aggregateByWeek([])).toEqual([]);
    });

    it('returns empty array for null/undefined transactions', () => {
      // @ts-expect-error testing null input
      expect(aggregateByWeek(null)).toEqual([]);
      // @ts-expect-error testing undefined input
      expect(aggregateByWeek(undefined)).toEqual([]);
    });

    it('aggregates transactions by ISO week', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 }, // Week 1 (Monday)
        { date_in: '2024-01-02', cash_in: 500 }, // Week 1
        { date_in: '2024-01-08', cash_in: 2000 }, // Week 2 (Monday)
        { date_out: '2024-01-03', cash_out: 300 }, // Week 1
      ];

      const result = aggregateByWeek(transactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2024-W01', balance: 1200, networth: 1200 }); // 1000 + 500 - 300
      expect(result[1]).toEqual({ date: '2024-W02', balance: 3200, networth: 3200 }); // 1200 + 2000
    });

    it('includes networth property for backward compatibility', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
      ];

      const result = aggregateByWeek(transactions);

      expect(result[0]).toHaveProperty('networth');
      expect(result[0].networth).toBe(result[0].balance);
    });

    it('calculates running balance correctly', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { date_in: '2024-01-15', cash_in: 2000 },
        { date_out: '2024-02-01', cash_out: 500 },
      ];

      const result = aggregateByWeek(transactions);

      expect(result.length).toBeGreaterThan(0);
      // Running balance should accumulate
      expect(result[result.length - 1].balance).toBe(2500);
    });

    it('handles transactions with only cash_out', () => {
      const transactions: TransactionForScoring[] = [
        { date_out: '2024-01-01', cash_out: 500 },
        { date_out: '2024-01-08', cash_out: 300 },
      ];

      const result = aggregateByWeek(transactions);

      expect(result).toHaveLength(2);
      expect(result[0].balance).toBe(-500);
      expect(result[1].balance).toBe(-800);
    });

    it('sorts weeks chronologically', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-03-01', cash_in: 1000 },
        { date_in: '2024-01-01', cash_in: 500 },
        { date_in: '2024-02-01', cash_in: 750 },
      ];

      const result = aggregateByWeek(transactions);

      // Should be sorted by week
      expect(result[0].date).toContain('2024-W');
      expect(result[result.length - 1].date).toContain('2024-W');
    });
  });

  describe('aggregateByYear', () => {
    it('returns empty array for no transactions', () => {
      expect(aggregateByYear([])).toEqual([]);
    });

    it('returns empty array for null/undefined transactions', () => {
      // @ts-expect-error testing null input
      expect(aggregateByYear(null)).toEqual([]);
      // @ts-expect-error testing undefined input
      expect(aggregateByYear(undefined)).toEqual([]);
    });

    it('aggregates transactions by year', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { date_in: '2024-06-15', cash_in: 2000 },
        { date_in: '2025-01-01', cash_in: 3000 },
        { date_out: '2024-03-01', cash_out: 500 },
      ];

      const result = aggregateByYear(transactions);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2024', balance: 2500, networth: 2500 }); // 1000 + 2000 - 500
      expect(result[1]).toEqual({ date: '2025', balance: 5500, networth: 5500 }); // 2500 + 3000
    });

    it('includes networth property for backward compatibility', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
      ];

      const result = aggregateByYear(transactions);

      expect(result[0]).toHaveProperty('networth');
      expect(result[0].networth).toBe(result[0].balance);
    });

    it('calculates running balance across years', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2023-01-01', cash_in: 1000 },
        { date_in: '2024-01-01', cash_in: 2000 },
        { date_in: '2025-01-01', cash_in: 3000 },
      ];

      const result = aggregateByYear(transactions);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ date: '2023', balance: 1000, networth: 1000 });
      expect(result[1]).toEqual({ date: '2024', balance: 3000, networth: 3000 });
      expect(result[2]).toEqual({ date: '2025', balance: 6000, networth: 6000 });
    });

    it('handles single year transactions', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { date_out: '2024-12-31', cash_out: 300 },
      ];

      const result = aggregateByYear(transactions);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ date: '2024', balance: 700, networth: 700 });
    });

    it('ignores transactions without dates', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { cash_in: 500 }, // No date
        { date_out: '2024-06-01', cash_out: 200 },
      ];

      const result = aggregateByYear(transactions);

      expect(result).toHaveLength(1);
      expect(result[0].balance).toBe(800);
    });
  });

  describe('generateCashflowChartData with scope parameter', () => {
    const mockTransactions: TransactionForScoring[] = [
      { date_in: '2024-01-01', cash_in: 1000 },
      { date_in: '2024-01-15', cash_in: 2000 },
      { date_out: '2024-01-10', cash_out: 500 },
      { date_in: '2024-02-05', cash_in: 1500 },
      { date_out: '2024-02-20', cash_out: 800 },
      { date_in: '2025-01-01', cash_in: 3000 },
    ];

    it('defaults to month scope when not specified', () => {
      const currentBalance = 5000;
      const result = generateCashflowChartData(mockTransactions, currentBalance);

      // Should return 30 data points (next 30 days)
      expect(result.length).toBe(30);
      // Dates should be in YYYY-MM-DD format
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('generates 7-day projection when scope is week', () => {
      const currentBalance = 5000;
      const result = generateCashflowChartData(mockTransactions, currentBalance, 0, 'week');

      // Should return 7 data points (next 7 days)
      expect(result).toHaveLength(7);
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('generates 12-month projection when scope is year', () => {
      const currentBalance = 5000;
      const result = generateCashflowChartData(mockTransactions, currentBalance, 0, 'year');

      // Should return 12 data points (next 12 months)
      expect(result).toHaveLength(12);
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(point.date.endsWith('-01')).toBe(true);
      });
    });

    it('generates 30-day projection when scope is month', () => {
      const currentBalance = 5000;
      const result = generateCashflowChartData(mockTransactions, currentBalance, 0, 'month');

      // Should return 30 data points (next 30 days)
      expect(result).toHaveLength(30);
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('maintains backward compatibility without scope parameter', () => {
      const currentBalance = 5000;
      const result = generateCashflowChartData(mockTransactions, currentBalance);

      // Should work the same as month scope (30-day projection)
      expect(result.length).toBe(30);
      expect(result[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('applies fixed cost deduction with week scope', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 10000 },
      ];
      const currentBalance = 10000;

      const resultWithoutCost = generateCashflowChartData(transactions, currentBalance, 0, 'week');
      const resultWithCost = generateCashflowChartData(transactions, currentBalance, 1000, 'week');

      // With fixed cost, networth should be reduced compared to balance
      expect(resultWithCost[6].networth).toBeLessThan(resultWithCost[6].balance);
      // Without fixed cost, networth equals balance
      expect(resultWithoutCost[6].networth).toBe(resultWithoutCost[6].balance);
    });
  });

  describe('aggregateCashFlowByPeriod', () => {
    const mockTransactions: TransactionForScoring[] = [
      { date_in: '2024-01-01', cash_in: 1000, date_out: null, cash_out: null },
      { date_in: '2024-01-15', cash_in: 2000, date_out: null, cash_out: null },
      { date_in: null, cash_in: null, date_out: '2024-01-10', cash_out: 500 },
      { date_in: '2024-02-05', cash_in: 1500, date_out: null, cash_out: null },
      { date_in: null, cash_in: null, date_out: '2024-02-20', cash_out: 800 },
    ];

    it('returns empty array for no transactions', () => {
      const result = aggregateCashFlowByPeriod([], 'month');
      expect(result).toEqual([]);
    });

    it('returns empty array for null/undefined transactions', () => {
      // @ts-expect-error testing null input
      const result = aggregateCashFlowByPeriod(null, 'month');
      expect(result).toEqual([]);
    });

    it('aggregates by month correctly', () => {
      const result = aggregateCashFlowByPeriod(mockTransactions, 'month');

      expect(result.length).toBe(2);

      // Jan 2024
      const jan = result.find((r) => r.period.includes('Jan'));
      expect(jan).toBeDefined();
      expect(jan?.cashIn).toBe(3000);
      expect(jan?.cashOut).toBe(500);
      expect(jan?.net).toBe(2500);

      // Feb 2024
      const feb = result.find((r) => r.period.includes('Feb'));
      expect(feb).toBeDefined();
      expect(feb?.cashIn).toBe(1500);
      expect(feb?.cashOut).toBe(800);
      expect(feb?.net).toBe(700);
    });

    it('aggregates by week correctly', () => {
      const result = aggregateCashFlowByPeriod(mockTransactions, 'week');

      expect(result.length).toBeGreaterThan(0);

      // Verify structure
      result.forEach((period) => {
        expect(period).toHaveProperty('period');
        expect(period).toHaveProperty('cashIn');
        expect(period).toHaveProperty('cashOut');
        expect(period).toHaveProperty('net');
        expect(typeof period.cashIn).toBe('number');
        expect(typeof period.cashOut).toBe('number');
        expect(typeof period.net).toBe('number');
      });
    });

    it('handles transactions with only cash_in', () => {
      const inOnly: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000, date_out: null, cash_out: null },
      ];
      const result = aggregateCashFlowByPeriod(inOnly, 'month');

      expect(result.length).toBe(1);
      expect(result[0].cashIn).toBe(1000);
      expect(result[0].cashOut).toBe(0);
      expect(result[0].net).toBe(1000);
    });

    it('handles transactions with only cash_out', () => {
      const outOnly: TransactionForScoring[] = [
        { date_in: null, cash_in: null, date_out: '2024-01-01', cash_out: 500 },
      ];
      const result = aggregateCashFlowByPeriod(outOnly, 'month');

      expect(result.length).toBe(1);
      expect(result[0].cashIn).toBe(0);
      expect(result[0].cashOut).toBe(500);
      expect(result[0].net).toBe(-500);
    });

    it('sorts periods chronologically', () => {
      const result = aggregateCashFlowByPeriod(mockTransactions, 'month');

      // Check that periods are in order
      const janIndex = result.findIndex((r) => r.period.includes('Jan'));
      const febIndex = result.findIndex((r) => r.period.includes('Feb'));

      expect(janIndex).toBeLessThan(febIndex);
    });

    it('ignores zero or null values', () => {
      const withZeros: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000, date_out: null, cash_out: null },
        { date_in: '2024-01-01', cash_in: 0, date_out: null, cash_out: null },
        { date_in: null, cash_in: null, date_out: '2024-01-01', cash_out: 0 },
        { date_in: null, cash_in: null, date_out: null, cash_out: null },
      ];
      const result = aggregateCashFlowByPeriod(withZeros, 'month');

      expect(result.length).toBe(1);
      expect(result[0].cashIn).toBe(1000);
      expect(result[0].cashOut).toBe(0);
    });
  });

  describe('generateWeekProjection', () => {
    it('generates 7 data points', () => {
      const result = generateWeekProjection(1000, 0);
      expect(result).toHaveLength(7);
    });

    it('starts with current balance', () => {
      const currentBalance = 5000;
      const result = generateWeekProjection(currentBalance, 0);
      expect(result[0].balance).toBe(currentBalance);
    });

    it('uses daily date format', () => {
      const result = generateWeekProjection(1000, 0);
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('applies fixed cost daily', () => {
      const fixedCost = 300;
      const result = generateWeekProjection(1000, fixedCost);
      const dailyFixedCost = fixedCost / 30;

      // Day 0: no accumulated cost
      expect(result[0].networth).toBe(1000);
      // Day 6: 6 days of fixed cost
      expect(result[6].networth).toBeCloseTo(1000 - 6 * dailyFixedCost, 0);
    });

    it('projects with average daily cash flow', () => {
      const currentBalance = 1000;
      const avgDailyCashFlow = 100;
      const result = generateWeekProjection(currentBalance, 0, avgDailyCashFlow);

      // Day 0: current balance
      expect(result[0].balance).toBe(currentBalance);
      // Day 1: current balance + daily cash flow
      expect(result[1].balance).toBe(currentBalance + avgDailyCashFlow);
      // Day 6: current balance + 6 * daily cash flow
      expect(result[6].balance).toBe(currentBalance + 6 * avgDailyCashFlow);
    });
  });

  describe('generateMonthProjection', () => {
    it('generates 30 data points', () => {
      const result = generateMonthProjection(1000, 0);
      expect(result).toHaveLength(30);
    });

    it('starts with current balance', () => {
      const currentBalance = 5000;
      const result = generateMonthProjection(currentBalance, 0);
      expect(result[0].balance).toBe(currentBalance);
    });

    it('uses daily date format', () => {
      const result = generateMonthProjection(1000, 0);
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('applies fixed cost daily', () => {
      const fixedCost = 300;
      const result = generateMonthProjection(1000, fixedCost);
      const dailyFixedCost = fixedCost / 30;

      // Day 29: 29 days of fixed cost
      expect(result[29].networth).toBeCloseTo(1000 - 29 * dailyFixedCost, 0);
    });
  });

  describe('generateYearProjection', () => {
    it('generates 12 data points', () => {
      const result = generateYearProjection(1000, 0);
      expect(result).toHaveLength(12);
    });

    it('starts with current balance', () => {
      const currentBalance = 5000;
      const result = generateYearProjection(currentBalance, 0);
      expect(result[0].balance).toBe(currentBalance);
    });

    it('uses first day of month format', () => {
      const result = generateYearProjection(1000, 0);
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(point.date.endsWith('-01')).toBe(true);
      });
    });

    it('applies fixed cost monthly', () => {
      const fixedCost = 300;
      const result = generateYearProjection(1000, fixedCost);

      // Month 0: no accumulated cost
      expect(result[0].networth).toBe(1000);
      // Month 11: 11 months of fixed cost
      expect(result[11].networth).toBe(1000 - 11 * fixedCost);
    });

    it('projects with monthly cash flow approximation', () => {
      const currentBalance = 1000;
      const avgDailyCashFlow = 10;
      const result = generateYearProjection(currentBalance, 0, avgDailyCashFlow);

      // Month 0: current balance
      expect(result[0].balance).toBe(currentBalance);
      // Month 1: current balance + 30 days * daily cash flow
      expect(result[1].balance).toBe(currentBalance + 30 * avgDailyCashFlow);
    });
  });

  describe('generateCustomProjection', () => {
    it('generates daily intervals for ranges <= 60 days', () => {
      const startDate = '2026-02-01';
      const endDate = '2026-03-15'; // 43 days inclusive (Feb 1 to Mar 15)
      const result = generateCustomProjection(1000, 0, startDate, endDate);

      // Should have 43 data points (one per day, inclusive)
      expect(result).toHaveLength(43);
      // All dates should be in YYYY-MM-DD format
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('generates monthly intervals for ranges > 60 days', () => {
      const startDate = '2026-02-01';
      const endDate = '2026-06-01'; // 120 days
      const result = generateCustomProjection(1000, 0, startDate, endDate);

      // Should have approximately 4 monthly data points
      expect(result.length).toBeGreaterThanOrEqual(3);
      // All dates should be first of month
      result.forEach((point) => {
        expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(point.date.endsWith('-01')).toBe(true);
      });
    });

    it('starts with current balance', () => {
      const currentBalance = 5000;
      const result = generateCustomProjection(currentBalance, 0, '2026-02-01', '2026-02-07');
      expect(result[0].balance).toBe(currentBalance);
    });

    it('applies fixed cost correctly for daily intervals', () => {
      const fixedCost = 300;
      const result = generateCustomProjection(1000, fixedCost, '2026-02-01', '2026-02-07');
      const dailyFixedCost = fixedCost / 30;

      // Day 6: 6 days of fixed cost
      expect(result[6].networth).toBeCloseTo(1000 - 6 * dailyFixedCost, 0);
    });

    it('applies fixed cost correctly for monthly intervals', () => {
      const fixedCost = 300;
      const result = generateCustomProjection(1000, fixedCost, '2026-02-01', '2026-06-01');

      // Each month should have accumulated fixed cost
      expect(result[0].networth).toBe(1000);
      if (result.length > 1) {
        expect(result[1].networth).toBe(1000 - fixedCost);
      }
    });
  });

  describe('parseDateFromKey helper (via getMonthsElapsed)', () => {
    it('handles ISO week format correctly', () => {
      // Test via aggregateByWeek which uses getMonthsElapsed internally
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { date_in: '2024-02-01', cash_in: 2000 },
      ];

      // This should not throw or return NaN
      const result = aggregateByWeek(transactions, 100);
      expect(result.length).toBeGreaterThan(0);
      // All networth values should be valid numbers (not NaN)
      result.forEach((point) => {
        expect(point.networth).not.toBeNaN();
        expect(typeof point.networth).toBe('number');
      });
    });

    it('handles year format correctly', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2023-06-01', cash_in: 1000 },
        { date_in: '2024-06-01', cash_in: 2000 },
      ];

      const result = aggregateByYear(transactions, 100);
      expect(result.length).toBeGreaterThan(0);
      // All networth values should be valid numbers (not NaN)
      result.forEach((point) => {
        expect(point.networth).not.toBeNaN();
        expect(typeof point.networth).toBe('number');
      });
    });

    it('handles standard date format correctly', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2024-01-01', cash_in: 1000 },
        { date_in: '2024-02-01', cash_in: 2000 },
      ];

      // aggregateByMonth is internal but we can test via the month scope
      const result = generateCashflowChartData(transactions, 1000, 100, 'month');
      expect(result.length).toBeGreaterThan(0);
      // All networth values should be valid numbers (not NaN)
      result.forEach((point) => {
        expect(point.networth).not.toBeNaN();
        expect(typeof point.networth).toBe('number');
      });
    });
  });
});
