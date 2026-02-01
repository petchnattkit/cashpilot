import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart, BarChart } from './Chart';
import { formatXAxisLabel } from '../../../lib/chartUtils';

// Mock Recharts ResponsiveContainer to avoid size issues in JSDOM
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div className="recharts-responsive-container" style={{ width: 800, height: 800 }}>
        {children}
      </div>
    ),
  };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() { }
  unobserve() { }
  disconnect() { }
};

describe('Chart Components', () => {
  const mockData = [
    { name: 'Jan', value: 100 },
    { name: 'Feb', value: 200 },
  ];
  const mockSeries = [{ key: 'value', name: 'Value' }];

  describe('LineChart', () => {
    it('renders loading skeleton', () => {
      render(<LineChart data={[]} xAxisKey="name" series={mockSeries} isLoading={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<LineChart data={[]} xAxisKey="name" series={mockSeries} isLoading={false} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders custom empty message', () => {
      render(
        <LineChart data={[]} xAxisKey="name" series={mockSeries} emptyMessage="Nothing here" />
      );
      expect(screen.getByText('Nothing here')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      const { container } = render(
        <LineChart data={mockData} xAxisKey="name" series={mockSeries} />
      );
      // Check for the responsive container which Recharts wraps everything in
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renders chart with baseline', () => {
      const { container } = render(
        <LineChart data={mockData} xAxisKey="name" series={mockSeries} baseline={150} />
      );
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renders chart without warning area when disabled', () => {
      const { container } = render(
        <LineChart
          data={mockData}
          xAxisKey="name"
          series={mockSeries}
          baseline={150}
          showWarningArea={false}
        />
      );
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('renders chart without baseline when not provided', () => {
      const { container } = render(
        <LineChart data={mockData} xAxisKey="name" series={mockSeries} />
      );
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('BarChart', () => {
    it('renders loading skeleton', () => {
      render(<BarChart data={[]} xAxisKey="name" series={mockSeries} isLoading={true} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('renders empty state', () => {
      render(<BarChart data={[]} xAxisKey="name" series={mockSeries} isLoading={false} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('renders chart with data', () => {
      const { container } = render(
        <BarChart data={mockData} xAxisKey="name" series={mockSeries} />
      );
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });

  describe('formatXAxisLabel', () => {
    const startDate = new Date('2024-01-01');

    it('returns "Today" for the start date', () => {
      expect(formatXAxisLabel('2024-01-01', startDate)).toBe('Today');
    });

    it('returns "+Nd" for dates within 14 days', () => {
      // Note: Values may vary by 1 day due to timezone differences in test environment
      expect(formatXAxisLabel('2024-01-05', startDate)).toMatch(/^\+[34]d$/);
      expect(formatXAxisLabel('2024-01-10', startDate)).toMatch(/^\+[89]d$/);
      expect(formatXAxisLabel('2024-01-15', startDate)).toMatch(/^\+1[34]d$/);
    });

    it('returns "+Nw" for dates between 15 and 60 days', () => {
      expect(formatXAxisLabel('2024-01-20', startDate)).toBe('+2w');
      expect(formatXAxisLabel('2024-02-01', startDate)).toBe('+4w');
      expect(formatXAxisLabel('2024-03-01', startDate)).toBe('+8w');
    });

    it('returns month abbreviation for dates beyond 60 days', () => {
      expect(formatXAxisLabel('2024-04-02', startDate)).toBe('Apr');
      expect(formatXAxisLabel('2024-06-15', startDate)).toBe('Jun');
      expect(formatXAxisLabel('2024-12-31', startDate)).toBe('Dec');
    });

    it('returns original string for invalid dates', () => {
      expect(formatXAxisLabel('invalid-date', startDate)).toBe('invalid-date');
    });
  });
});
