import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LineChart, BarChart } from './Chart';

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
  observe() {}
  unobserve() {}
  disconnect() {}
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
});
