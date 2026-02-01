import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSettings,
  saveSettings,
  getBaselineAmount,
  validateBaselineAmount,
  DEFAULT_SETTINGS,
} from './settingsService';

describe('settingsService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('returns default settings when localStorage is empty', () => {
      const settings = getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('returns saved settings from localStorage', () => {
      const savedSettings = { baseline_amount: 10000 };
      localStorage.setItem('cashpilot_settings', JSON.stringify(savedSettings));

      const settings = getSettings();
      expect(settings.baseline_amount).toBe(10000);
    });

    it('merges saved settings with defaults', () => {
      const savedSettings = { baseline_amount: 8000 };
      localStorage.setItem('cashpilot_settings', JSON.stringify(savedSettings));

      const settings = getSettings();
      expect(settings.baseline_amount).toBe(8000);
    });

    it('returns defaults when localStorage has invalid JSON', () => {
      localStorage.setItem('cashpilot_settings', 'invalid json');

      const settings = getSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('saveSettings', () => {
    it('saves settings to localStorage', () => {
      saveSettings({ baseline_amount: 7500 });

      const saved = JSON.parse(localStorage.getItem('cashpilot_settings') || '{}');
      expect(saved.baseline_amount).toBe(7500);
    });

    it('merges with existing settings', () => {
      saveSettings({ baseline_amount: 5000 });
      saveSettings({ baseline_amount: 10000 });

      const settings = getSettings();
      expect(settings.baseline_amount).toBe(10000);
    });

    it('returns updated settings', () => {
      const result = saveSettings({ baseline_amount: 6000 });

      expect(result.baseline_amount).toBe(6000);
    });
  });

  describe('getBaselineAmount', () => {
    it('returns default baseline when not set', () => {
      const baseline = getBaselineAmount();
      expect(baseline).toBe(DEFAULT_SETTINGS.baseline_amount);
    });

    it('returns saved baseline amount', () => {
      localStorage.setItem(
        'cashpilot_settings',
        JSON.stringify({ baseline_amount: 12000 })
      );

      const baseline = getBaselineAmount();
      expect(baseline).toBe(12000);
    });
  });

  describe('validateBaselineAmount', () => {
    it('returns valid for positive numbers', () => {
      const result = validateBaselineAmount(5000);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid for zero', () => {
      const result = validateBaselineAmount(0);
      expect(result.valid).toBe(true);
    });

    it('returns invalid for negative numbers', () => {
      const result = validateBaselineAmount(-100);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Baseline cannot be negative');
    });

    it('returns invalid for NaN', () => {
      const result = validateBaselineAmount(NaN);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Please enter a valid number');
    });
  });
});
