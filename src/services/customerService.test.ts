import { describe, it, expect, vi } from 'vitest';
import { calculateRiskScore } from './customerService';

// Mocking supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('calculateRiskScore', () => {
  describe('Low Risk (DSO < 30)', () => {
    it('returns proper score for DSO 0', () => {
      expect(calculateRiskScore(0)).toBe(0);
    });

    it('returns score < 40 for DSO 29', () => {
      const score = calculateRiskScore(29);
      expect(score).toBeLessThan(40);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('returns score range 0-39 for DSO 0-29', () => {
      for (let dso = 0; dso < 30; dso++) {
        const score = calculateRiskScore(dso);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThan(40);
      }
    });
  });

  describe('Medium Risk (DSO 30-50)', () => {
    it('returns 40 for DSO 30', () => {
      expect(calculateRiskScore(30)).toBe(40);
    });

    it('returns 69 for DSO 50', () => {
      expect(calculateRiskScore(50)).toBe(69);
    });

    it('returns score range 40-69 for DSO 30-50', () => {
      for (let dso = 30; dso <= 50; dso++) {
        const score = calculateRiskScore(dso);
        expect(score).toBeGreaterThanOrEqual(40);
        expect(score).toBeLessThanOrEqual(69);
      }
    });
  });

  describe('High Risk (DSO > 50)', () => {
    it('returns score >= 70 for DSO 51', () => {
      const score = calculateRiskScore(51);
      expect(score).toBeGreaterThanOrEqual(70);
    });

    it('caps score at 100', () => {
      expect(calculateRiskScore(100)).toBe(100);
      expect(calculateRiskScore(200)).toBe(100);
    });

    it('returns score range 70-100 for DSO > 50', () => {
      for (let dso = 51; dso <= 100; dso++) {
        const score = calculateRiskScore(dso);
        expect(score).toBeGreaterThanOrEqual(70);
        expect(score).toBeLessThanOrEqual(100);
      }
    });
  });
});
