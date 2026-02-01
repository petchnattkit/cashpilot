import { describe, it, expect, vi } from 'vitest';
import { calculateRiskScore } from './supplierService';

// Mocking supabase to prevent actual network calls during service import if any side effects exist
// (Though supplierService just exports functions, it imports supabase instance)
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('calculateRiskScore', () => {
  describe('High Risk (DPO < 15)', () => {
    it('returns 100 for DPO 0', () => {
      expect(calculateRiskScore(0)).toBe(100);
    });

    it('returns 72 for DPO 14', () => {
      expect(calculateRiskScore(14)).toBe(72);
    });

    it('returns score >= 70 for DPO < 15', () => {
      for (let dpo = 0; dpo < 15; dpo++) {
        expect(calculateRiskScore(dpo)).toBeGreaterThanOrEqual(70);
        expect(calculateRiskScore(dpo)).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Medium Risk (DPO 15-30)', () => {
    it('returns 69 for DPO 15', () => {
      expect(calculateRiskScore(15)).toBe(69);
    });

    it('returns 40 for DPO 30', () => {
      expect(calculateRiskScore(30)).toBe(40);
    });

    it('returns score between 40 and 69 for DPO 15-30', () => {
      for (let dpo = 15; dpo <= 30; dpo++) {
        expect(calculateRiskScore(dpo)).toBeGreaterThanOrEqual(40);
        expect(calculateRiskScore(dpo)).toBeLessThanOrEqual(69);
      }
    });

    it('scales linearly roughly', () => {
      // Check a mid value
      // DPO 22.5 -> approx halfway between 15 and 30
      // Score should be approx halfway between 69 and 40 -> 54.5
      expect(calculateRiskScore(22)).toBeCloseTo(55, -1); // tolerance of 10
      expect(calculateRiskScore(23)).toBeCloseTo(54, -1);
    });
  });

  describe('Low Risk (DPO > 30)', () => {
    it('returns 38 for DPO 31', () => {
      expect(calculateRiskScore(31)).toBe(38);
    });

    it('returns 0 for DPO 50', () => {
      expect(calculateRiskScore(50)).toBe(0);
    });

    it('returns 0 for DPO > 50', () => {
      expect(calculateRiskScore(51)).toBe(0);
      expect(calculateRiskScore(100)).toBe(0);
    });

    it('returns score < 40 for DPO > 30', () => {
      for (let dpo = 31; dpo <= 55; dpo++) {
        expect(calculateRiskScore(dpo)).toBeLessThan(40);
        expect(calculateRiskScore(dpo)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
