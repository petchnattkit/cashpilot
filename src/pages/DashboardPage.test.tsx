import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { useTransactions } from '../hooks/useTransactions';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCustomers } from '../hooks/useCustomers';

// Mock the hooks
vi.mock('../hooks/useTransactions');
vi.mock('../hooks/useSuppliers');
vi.mock('../hooks/useCustomers');

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Default mocks
    (useSuppliers as Mock).mockReturnValue({ isLoading: false });
    (useCustomers as Mock).mockReturnValue({ isLoading: false });
  });

  it('renders loading state', () => {
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

    // Runway: 600 / 5000 = 0.12
    expect(screen.getByText('0.1 Months')).toBeInTheDocument();

    // Chart title
    expect(screen.getByText('Cashflow Projection')).toBeInTheDocument();
  });
});
