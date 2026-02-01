import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from './index';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { useSettings, useBaselineMutation, useFixedCostMutation } from '../../hooks/useSettings';
import * as settingsService from '../../services/settingsService';

// Mock the hooks
vi.mock('../../hooks/useCategories', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(),
  useUpdateCategory: vi.fn(),
  useDeleteCategory: vi.fn(),
}));

vi.mock('../../hooks/useSettings', () => ({
  useSettings: vi.fn(),
  useBaselineMutation: vi.fn(),
  useFixedCostMutation: vi.fn(),
}));

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock useSettings
    (useSettings as Mock).mockReturnValue({
      settings: { baseline_amount: 5000, fixed_cost: 0 },
      isLoading: false,
    });

    // Mock useFixedCostMutation
    (useFixedCostMutation as Mock).mockReturnValue({
      updateFixedCost: vi.fn((value: number) => {
        settingsService.saveSettings({ fixed_cost: value });
        return Promise.resolve();
      }),
      isPending: false,
      error: null,
    });

    // Mock useBaselineMutation
    (useBaselineMutation as Mock).mockReturnValue({
      updateBaseline: vi.fn((value: number) => {
        settingsService.saveSettings({ baseline_amount: value });
        return Promise.resolve();
      }),
      isPending: false,
      error: null,
    });

    (useCategories as Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    // Mock mutations to invoke onSuccess callback so modals close
    (useCreateCategory as Mock).mockReturnValue({
      mutate: vi.fn((data, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    (useUpdateCategory as Mock).mockReturnValue({
      mutate: vi.fn((data, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    (useDeleteCategory as Mock).mockReturnValue({
      mutate: vi.fn((id, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders settings page with title', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Configure application settings and master data')).toBeInTheDocument();
  });

  it('renders general tab by default', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    expect(screen.getByRole('button', { name: /general/i })).toBeInTheDocument();
    expect(screen.getByText('Dashboard Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText('Baseline Value')).toBeInTheDocument();
  });

  it('initializes baseline value from settings', () => {
    settingsService.saveSettings({ baseline_amount: 5000 });

    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    expect(screen.getByLabelText('Baseline Value')).toHaveValue(5000);
  });

  it('initializes baseline value to default when settings are empty', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    expect(screen.getByLabelText('Baseline Value')).toHaveValue(5000);
  });

  it('updates baseline value when entering input', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const input = screen.getByLabelText('Baseline Value');
    fireEvent.change(input, { target: { value: '10000' } });

    expect(input).toHaveValue(10000);
  });

  it('persists baseline value after saving', async () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const input = screen.getByLabelText('Baseline Value');
    fireEvent.change(input, { target: { value: '10000' } });

    // Get the first Save Settings button (for baseline form)
    const saveButtons = screen.getAllByRole('button', { name: /save settings/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      const settings = settingsService.getSettings();
      expect(settings.baseline_amount).toBe(10000);
    });
  });

  it('shows validation error for negative numbers', async () => {
    // Mock useBaselineMutation to throw error for negative values
    (useBaselineMutation as Mock).mockReturnValue({
      updateBaseline: vi.fn((value: number) => {
        if (value < 0) {
          return Promise.reject(new Error('Baseline cannot be negative'));
        }
        settingsService.saveSettings({ baseline_amount: value });
        return Promise.resolve();
      }),
      isPending: false,
      error: null,
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const input = screen.getByLabelText('Baseline Value');
    fireEvent.change(input, { target: { value: '-100' } });

    // Get the first Save Settings button (for baseline form)
    const saveButtons = screen.getAllByRole('button', { name: /save settings/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Baseline cannot be negative');
    });

    alertMock.mockRestore();
  });

  it('shows validation error for non-numeric values', async () => {
    // Mock useBaselineMutation to throw error for NaN values
    (useBaselineMutation as Mock).mockReturnValue({
      updateBaseline: vi.fn((value: number) => {
        if (isNaN(value)) {
          return Promise.reject(new Error('Please enter a valid number'));
        }
        settingsService.saveSettings({ baseline_amount: value });
        return Promise.resolve();
      }),
      isPending: false,
      error: null,
    });

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const input = screen.getByLabelText('Baseline Value');
    fireEvent.change(input, { target: { value: 'abc' } });

    // Get the first Save Settings button (for baseline form)
    const saveButtons = screen.getAllByRole('button', { name: /save settings/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Please enter a valid number');
    });

    alertMock.mockRestore();
  });

  it('switches to categories tab when clicked', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByText('Transaction Categories')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Configuration')).not.toBeInTheDocument();
  });

  it('switches back to general tab when clicked', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    // First switch to categories
    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    // Then switch back to general
    const generalTab = screen.getByRole('button', { name: /general/i });
    fireEvent.click(generalTab);

    expect(screen.getByText('Dashboard Configuration')).toBeInTheDocument();
    expect(screen.queryByText('Transaction Categories')).not.toBeInTheDocument();
  });

  it('renders CategoriesManager when categories tab is active', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByText('Transaction Categories')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add category/i })).toBeInTheDocument();
  });

  it('displays categories in the categories tab', () => {
    const mockCategories = [
      { id: '1', name: 'Sales', type: 'in' as const },
      { id: '2', name: 'Rent', type: 'out' as const },
    ];

    (useCategories as Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });

    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('shows loading state for categories', () => {
    (useCategories as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('opens add category modal when clicking Add Category', () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    const addButton = screen.getByRole('button', { name: /add category/i });
    fireEvent.click(addButton);

    expect(screen.getByRole('heading', { name: 'Add Category' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('closes add category modal after submitting form', async () => {
    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    expect(screen.getByRole('heading', { name: 'Add Category' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Category' } });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add Category' })).not.toBeInTheDocument();
    });
  });

  it('opens edit modal when clicking edit button', () => {
    const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

    (useCategories as Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });

    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    const editButton = screen.getByRole('button', { name: /edit category/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('heading', { name: 'Edit Category' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Sales')).toBeInTheDocument();
  });

  it('closes delete modal when confirming delete', async () => {
    const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

    (useCategories as Mock).mockReturnValue({
      data: mockCategories,
      isLoading: false,
    });

    const wrapper = createWrapper();
    render(<SettingsPage />, { wrapper });

    const categoriesTab = screen.getByRole('button', { name: /categories/i });
    fireEvent.click(categoriesTab);

    fireEvent.click(screen.getByRole('button', { name: /delete category/i }));
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });
});
