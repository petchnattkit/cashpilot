/**
 * Settings Service - Business logic for application settings
 *
 * EDGE FUNCTION COMPATIBLE
 * ========================
 * This module is designed to be easily migrated to Supabase Edge Functions.
 * All functions are pure with no React or browser dependencies.
 */

export interface Settings {
  baseline_amount: number;
  fixed_cost: number;
}

const STORAGE_KEY = 'cashpilot_settings';

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: Settings = {
  baseline_amount: 5000,
  fixed_cost: 0,
};

/**
 * Get settings from localStorage
 * @returns Settings object with defaults applied
 */
export const getSettings = (): Settings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    }
  } catch {
    // Fallback to defaults if parsing fails
  }
  return { ...DEFAULT_SETTINGS };
};

/**
 * Save settings to localStorage
 * @param settings - Partial settings to save
 * @returns Full settings object after merge
 */
export const saveSettings = (settings: Partial<Settings>): Settings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Get baseline amount from settings
 * @returns Baseline amount (defaults to 5000)
 */
export const getBaselineAmount = (): number => {
  const settings = getSettings();
  return settings.baseline_amount ?? DEFAULT_SETTINGS.baseline_amount;
};

/**
 * Validate baseline amount
 * @param value - Value to validate
 * @returns Validation result
 */
export const validateBaselineAmount = (value: number): { valid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  if (value < 0) {
    return { valid: false, error: 'Baseline cannot be negative' };
  }
  return { valid: true };
};

/**
 * Validate fixed cost
 * @param value - Value to validate
 * @returns Validation result
 */
export const validateFixedCost = (value: number): { valid: boolean; error?: string } => {
  if (isNaN(value)) {
    return { valid: false, error: 'Please enter a valid number' };
  }
  if (value < 0) {
    return { valid: false, error: 'Fixed cost cannot be negative' };
  }
  return { valid: true };
};
