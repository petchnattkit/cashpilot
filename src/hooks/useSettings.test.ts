import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettings, useBaseline, useBaselineMutation } from './useSettings';
import * as settingsService from '../services/settingsService';

// Wrapper component for providing QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
}

describe('useSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('useSettings', () => {
    it('returns default settings initially', async () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSettings(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.settings.baseline_amount).toBe(5000);
      });
    });

    it('returns loading state initially', () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSettings(), { wrapper: Wrapper });

      // Initially isLoading should be true
      expect(result.current.isLoading).toBe(true);
    });

    it('can update settings', async () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useSettings(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      result.current.updateSettings.mutate({ baseline_amount: 10000 });

      await waitFor(() => {
        expect(result.current.settings.baseline_amount).toBe(10000);
      });
    });
  });

  describe('useBaseline', () => {
    it('returns baseline amount from settings', async () => {
      localStorage.setItem(
        'cashpilot_settings',
        JSON.stringify({ baseline_amount: 7500 })
      );

      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBaseline(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.baselineAmount).toBe(7500);
      });
    });
  });

  describe('useBaselineMutation', () => {
    it('updates baseline with valid value', async () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBaselineMutation(), { wrapper: Wrapper });

      await result.current.updateBaseline(8000);

      const settings = settingsService.getSettings();
      expect(settings.baseline_amount).toBe(8000);
    });

    it('throws error for invalid baseline', async () => {
      const Wrapper = createWrapper();
      const { result } = renderHook(() => useBaselineMutation(), { wrapper: Wrapper });

      try {
        await result.current.updateBaseline(-100);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Baseline cannot be negative');
      }
    });
  });
});
