import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  saveSettings,
  validateBaselineAmount,
  validateFixedCost,
  type Settings,
} from '../services/settingsService';

const SETTINGS_QUERY_KEY = ['settings'];

/**
 * Hook to fetch and manage application settings
 * Uses TanStack Query for caching and synchronization
 */
export function useSettings() {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateSettings = useMutation({
    mutationFn: (newSettings: Partial<Settings>) => {
      return Promise.resolve(saveSettings(newSettings));
    },
    onSuccess: () => {
      // Invalidate and refetch settings
      queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
    },
  });

  return {
    settings: settings ?? getSettings(),
    isLoading,
    error,
    updateSettings,
  };
}

/**
 * Hook to get just the baseline amount
 * Convenience hook for components that only need the baseline
 */
export function useBaseline() {
  const { settings } = useSettings();
  return {
    baselineAmount: settings.baseline_amount,
  };
}

/**
 * Hook to update baseline amount with validation
 */
export function useBaselineMutation() {
  const { updateSettings } = useSettings();

  const updateBaseline = (value: number) => {
    const validation = validateBaselineAmount(value);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return updateSettings.mutateAsync({ baseline_amount: value });
  };

  return {
    updateBaseline,
    isPending: updateSettings.isPending,
    error: updateSettings.error,
  };
}

/**
 * Hook to update fixed cost with validation
 */
export function useFixedCostMutation() {
  const { updateSettings } = useSettings();

  const updateFixedCost = (value: number) => {
    const validation = validateFixedCost(value);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    return updateSettings.mutateAsync({ fixed_cost: value });
  };

  return {
    updateFixedCost,
    isPending: updateSettings.isPending,
    error: updateSettings.error,
  };
}

export { validateBaselineAmount, validateFixedCost };
