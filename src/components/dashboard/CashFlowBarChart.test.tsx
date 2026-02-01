import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CashFlowBarChart } from './CashFlowBarChart';

// Mock Recharts ResponsiveContainer
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container" style={{ width: 800, height: 300 }}>{children}</div>
    ),
  };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CashFlowBarChart', () => {
  const mockTransactions = [
    { date_in: '2024-01-01', cash_in: 1000, date_out: null, cash_out: null },
    { date_in: '2024-01-15', cash_in: 2000, date_out: null, cash_out: null },
    { date_in: null, cash_in: null, date_out: '2024-01-10', cash_out: 500 },
    { date_in: null, cash_in: null, date_out: '2024-02-05', cash_out: 800 },
  ];

  it('renders empty state when no transactions', () => {
    render(<CashFlowBarChart transactions={[]} />);
    expect(screen.getByText('No cash flow data available')).toBeInTheDocument();
  });

  it('renders chart with data', () => {
    const { container } = render(<CashFlowBarChart transactions={mockTransactions} />);
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
  });

  it('displays chart title', () => {
    render(<CashFlowBarChart transactions={mockTransactions} />);
    expect(screen.getByText('Cash Flow Analysis')).toBeInTheDocument();
  });

  it('has period toggle buttons', () => {
    render(<CashFlowBarChart transactions={mockTransactions} />);
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument();
  });

  it('toggles between week and month views', () => {
    render(<CashFlowBarChart transactions={mockTransactions} />);

    const weekButton = screen.getByRole('button', { name: /week/i });
    const monthButton = screen.getByRole('button', { name: /month/i });

    // Default is month
    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');

    // Click week
    fireEvent.click(weekButton);
    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
    expect(monthButton).toHaveAttribute('aria-pressed', 'false');

    // Click month
    fireEvent.click(monthButton);
    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders with custom height', () => {
    const { container } = render(<CashFlowBarChart transactions={mockTransactions} height={400} />);
    const wrapper = container.querySelector('[style*="height"]');
    expect(wrapper).toBeInTheDocument();
  });
});
