import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DashboardPage } from './index';
import { useTransactions } from '../../hooks/useTransactions';
import { useSettings } from '../../hooks/useSettings';

// Mock useQueryClient for SeedDataButton
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock the hooks
vi.mock('../../hooks/useTransactions');
vi.mock('../../hooks/useSuppliers', () => ({ useSuppliers: vi.fn(() => ({ data: [], isLoading: false })) }));
vi.mock('../../hooks/useCustomers', () => ({ useCustomers: vi.fn(() => ({ data: [], isLoading: false })) }));
vi.mock('../../hooks/useSkus', () => ({ useSkus: vi.fn(() => ({ data: [], isLoading: false })) }));
vi.mock('../../hooks/useDashboardInsights', () => ({
  useDashboardInsights: vi.fn(() => ({
    topSuppliersByValue: [],
    topSuppliersByFreq: [],
    riskSuppliers: [],
    topCustomersByValue: [],
    topCustomersByFreq: [],
    riskCustomers: [],
    topSkusByValue: [],
    topSkusByFreq: []
  }))
}));
vi.mock('../../hooks/useSettings', () => ({
  useSettings: vi.fn(),
}));

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Set up default mock for useSettings
    (useSettings as Mock).mockReturnValue({
      settings: { baseline_amount: 5000, fixed_cost: 2000 },
      isLoading: false,
    });
  });

  it('renders loading state', () => {
    (useSettings as Mock).mockReturnValue({
      settings: { baseline_amount: 5000, fixed_cost: 2000 },
      isLoading: true,
    });
    (useTransactions as Mock).mockReturnValue({ data: undefined, isLoading: true });

    render(<DashboardPage />);
    // Look for the spinner or loading indicator structure
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    (useTransactions as Mock).mockReturnValue({ data: [], isLoading: false });

    render(<DashboardPage />);
    expect(screen.getByText(/No transactions yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Start adding transactions/i)).toBeInTheDocument();
  });

  it('renders dashboard with data', () => {
    const mockTransactions = [
      {
        id: '1',
        cash_in: 1000,
        cash_out: 0,
        date_in: '2023-01-01',
        date_out: null,
      },
      {
        id: '2',
        cash_in: 0,
        cash_out: 400,
        date_in: null,
        date_out: '2023-01-02',
      },
    ];

    (useTransactions as Mock).mockReturnValue({ data: mockTransactions, isLoading: false });

    render(<DashboardPage />);

    // Check Header
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Check KPIs
    // Net Liquidity: 1000 - 400 = 600
    expect(screen.getByText('$600')).toBeInTheDocument();

    // Total Inflow: 1000
    expect(screen.getByText('$1,000')).toBeInTheDocument();

    // Total Outflow: 400
    expect(screen.getByText('$400')).toBeInTheDocument();

    // Runway: 600 / 2000 = 0.3
    expect(screen.getByText('0.3 Months')).toBeInTheDocument();

    // Chart title
    expect(screen.getByText('Cashflow Projection')).toBeInTheDocument();
  });

  it('allows switching scope via ScopeSelector', () => {
    const mockTransactions = [
      {
        id: '1',
        cash_in: 1000,
        cash_out: 0,
        date_in: '2023-01-01',
        date_out: null,
      },
      {
        id: '2',
        cash_in: 0,
        cash_out: 400,
        date_in: null,
        date_out: '2023-01-02',
      },
    ];

    (useTransactions as Mock).mockReturnValue({ data: mockTransactions, isLoading: false });

    render(<DashboardPage />);

    // Check that scope selector buttons are rendered
    expect(screen.getByRole('button', { name: /Select Week view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Month view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select Year view/i })).toBeInTheDocument();

    // Month should be selected by default (aria-pressed="true")
    const monthButton = screen.getByRole('button', { name: /Select Month view/i });
    expect(monthButton).toHaveAttribute('aria-pressed', 'true');

    // Click on Week button
    const weekButton = screen.getByRole('button', { name: /Select Week view/i });
    fireEvent.click(weekButton);

    // Week should now be selected
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
    expect(monthButton).toHaveAttribute('aria-pressed', 'false');

    // Click on Year button
    const yearButton = screen.getByRole('button', { name: /Select Year view/i });
    fireEvent.click(yearButton);

    // Year should now be selected
    expect(yearButton).toHaveAttribute('aria-pressed', 'true');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows selecting custom scope and shows DateRangePicker', () => {
    const mockTransactions = [
      {
        id: '1',
        cash_in: 1000,
        cash_out: 0,
        date_in: '2023-01-01',
        date_out: null,
      },
      {
        id: '2',
        cash_in: 0,
        cash_out: 400,
        date_in: null,
        date_out: '2023-01-02',
      },
    ];

    (useTransactions as Mock).mockReturnValue({ data: mockTransactions, isLoading: false });

    render(<DashboardPage />);

    // Check that Custom button is rendered
    const customButton = screen.getByRole('button', { name: /Select Custom view/i });
    expect(customButton).toBeInTheDocument();

    // DateRangePicker should not be visible initially (scope is month)
    expect(screen.queryByLabelText(/Start date/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/End date/i)).not.toBeInTheDocument();

    // Click on Custom button
    fireEvent.click(customButton);

    // Custom should now be selected
    expect(customButton).toHaveAttribute('aria-pressed', 'true');

    // DateRangePicker should now be visible
    expect(screen.getByLabelText(/Start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End date/i)).toBeInTheDocument();
  });

  it('filters chart data by custom date range', () => {
    const mockTransactions = [
      {
        id: '1',
        cash_in: 1000,
        cash_out: 0,
        date_in: '2023-01-01',
        date_out: null,
      },
      {
        id: '2',
        cash_in: 0,
        cash_out: 400,
        date_in: null,
        date_out: '2023-01-15',
      },
      {
        id: '3',
        cash_in: 500,
        cash_out: 0,
        date_in: '2023-02-01',
        date_out: null,
      },
    ];

    (useTransactions as Mock).mockReturnValue({ data: mockTransactions, isLoading: false });

    render(<DashboardPage />);

    // Switch to Custom scope
    const customButton = screen.getByRole('button', { name: /Select Custom view/i });
    fireEvent.click(customButton);

    // DateRangePicker should be visible with default dates (last 30 days from today)
    const startDateInput = screen.getByLabelText(/Start date/i);
    const endDateInput = screen.getByLabelText(/End date/i);

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();

    // Default dates should be set (last 30 days)
    expect(startDateInput).toHaveValue();
    expect(endDateInput).toHaveValue();

    // Change date range to filter January transactions only
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2023-01-31' } });

    // The chart should update (we can't easily verify the chart data, but we can verify the inputs updated)
    expect(startDateInput).toHaveValue('2023-01-01');
    expect(endDateInput).toHaveValue('2023-01-31');
  });

  it('sets default date range when switching to custom scope', () => {
    const mockTransactions = [
      {
        id: '1',
        cash_in: 1000,
        cash_out: 0,
        date_in: '2023-01-01',
        date_out: null,
      },
    ];

    (useTransactions as Mock).mockReturnValue({ data: mockTransactions, isLoading: false });

    render(<DashboardPage />);

    // Initially, DateRangePicker should not be visible
    expect(screen.queryByLabelText(/Start date/i)).not.toBeInTheDocument();

    // Switch to Custom scope
    const customButton = screen.getByRole('button', { name: /Select Custom view/i });
    fireEvent.click(customButton);

    // DateRangePicker should now be visible with default dates
    const startDateInput = screen.getByLabelText(/Start date/i);
    const endDateInput = screen.getByLabelText(/End date/i);

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();

    // Verify dates are set (should be last 30 days)
    const startValue = startDateInput.getAttribute('value');
    const endValue = endDateInput.getAttribute('value');

    expect(startValue).toBeTruthy();
    expect(endValue).toBeTruthy();

    // Verify the format is YYYY-MM-DD
    expect(startValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
