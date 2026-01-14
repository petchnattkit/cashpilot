import { describe, it, expect } from 'vitest';
import {
  calculateSupplierScore,
  calculateCustomerScore,
  calculateCashflowMetrics,
  generateCashflowChartData,
  calculateRunway,
  calculateSupplierRiskScore,
  calculateCustomerRiskScore,
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
      expect(generateCashflowChartData([])).toEqual([]);
    });

    it('generates sorted chart data with running balance', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-02', cash_in: 500 },
        { date_out: '2026-01-01', cash_out: 200 },
      ];

      const result = generateCashflowChartData(transactions);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ date: '2026-01-01', balance: -200 });
      expect(result[1]).toEqual({ date: '2026-01-02', balance: 300 });
    });

    it('aggregates multiple transactions on the same date', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 100 },
        { date_in: '2026-01-01', cash_in: 200 },
        { date_out: '2026-01-01', cash_out: 50 },
      ];

      const result = generateCashflowChartData(transactions);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ date: '2026-01-01', balance: 250 });
    });

    it('handles transactions with missing dates', () => {
      const transactions: TransactionForScoring[] = [
        { cash_in: 100 }, // No date
        { date_in: '2026-01-01', cash_in: 200 },
      ];

      const result = generateCashflowChartData(transactions);
      expect(result).toHaveLength(1);
      expect(result[0].balance).toBe(200);
    });

    it('calculates running balance across multiple dates', () => {
      const transactions: TransactionForScoring[] = [
        { date_in: '2026-01-01', cash_in: 1000 },
        { date_out: '2026-01-02', cash_out: 300 },
        { date_in: '2026-01-03', cash_in: 500 },
      ];

      const result = generateCashflowChartData(transactions);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ date: '2026-01-01', balance: 1000 });
      expect(result[1]).toEqual({ date: '2026-01-02', balance: 700 });
      expect(result[2]).toEqual({ date: '2026-01-03', balance: 1200 });
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
});
