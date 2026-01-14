import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SupabaseProvider, useSupabase } from './SupabaseContext';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

describe('SupabaseContext', () => {
  it('provides supabase client', () => {
    const TestComponent = () => {
      const { supabase } = useSupabase();
      return <div>{!!supabase ? 'Has Client' : 'No Client'}</div>;
    };

    render(
      <SupabaseProvider>
        <TestComponent />
      </SupabaseProvider>
    );

    expect(screen.getByText('Has Client')).toBeInTheDocument();
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test as React logs the error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSupabase());
    }).toThrow('useSupabase must be used within a SupabaseProvider');

    consoleSpy.mockRestore();
  });
});
