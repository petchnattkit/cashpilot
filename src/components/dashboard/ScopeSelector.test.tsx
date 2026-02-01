import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScopeSelector } from './ScopeSelector';

describe('ScopeSelector', () => {
  it('renders all 4 options', () => {
    render(<ScopeSelector value="month" onChange={() => {}} />);

    expect(screen.getByText('Week')).toBeInTheDocument();
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const handleChange = vi.fn();
    render(<ScopeSelector value="month" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Week'));
    expect(handleChange).toHaveBeenCalledWith('week');

    fireEvent.click(screen.getByText('Year'));
    expect(handleChange).toHaveBeenCalledWith('year');

    fireEvent.click(screen.getByText('Custom'));
    expect(handleChange).toHaveBeenCalledWith('custom');
  });

  it('shows correct active state for week', () => {
    render(<ScopeSelector value="week" onChange={() => {}} />);

    const weekButton = screen.getByLabelText('Select Week view');
    const monthButton = screen.getByLabelText('Select Month view');

    expect(weekButton).toHaveAttribute('aria-pressed', 'true');
    expect(monthButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows correct active state for month', () => {
    render(<ScopeSelector value="month" onChange={() => {}} />);

    const monthButton = screen.getByLabelText('Select Month view');
    const yearButton = screen.getByLabelText('Select Year view');

    expect(monthButton).toHaveAttribute('aria-pressed', 'true');
    expect(yearButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows correct active state for year', () => {
    render(<ScopeSelector value="year" onChange={() => {}} />);

    const yearButton = screen.getByLabelText('Select Year view');
    const customButton = screen.getByLabelText('Select Custom view');

    expect(yearButton).toHaveAttribute('aria-pressed', 'true');
    expect(customButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows correct active state for custom', () => {
    render(<ScopeSelector value="custom" onChange={() => {}} />);

    const customButton = screen.getByLabelText('Select Custom view');
    const weekButton = screen.getByLabelText('Select Week view');

    expect(customButton).toHaveAttribute('aria-pressed', 'true');
    expect(weekButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports keyboard navigation with ArrowRight', () => {
    const handleChange = vi.fn();
    render(<ScopeSelector value="week" onChange={handleChange} />);

    const weekButton = screen.getByLabelText('Select Week view');
    fireEvent.keyDown(weekButton, { key: 'ArrowRight' });

    expect(handleChange).toHaveBeenCalledWith('month');
  });

  it('supports keyboard navigation with ArrowLeft', () => {
    const handleChange = vi.fn();
    render(<ScopeSelector value="month" onChange={handleChange} />);

    const monthButton = screen.getByLabelText('Select Month view');
    fireEvent.keyDown(monthButton, { key: 'ArrowLeft' });

    expect(handleChange).toHaveBeenCalledWith('week');
  });

  it('supports keyboard navigation with Home key', () => {
    const handleChange = vi.fn();
    render(<ScopeSelector value="year" onChange={handleChange} />);

    const yearButton = screen.getByLabelText('Select Year view');
    fireEvent.keyDown(yearButton, { key: 'Home' });

    expect(handleChange).toHaveBeenCalledWith('week');
  });

  it('supports keyboard navigation with End key', () => {
    const handleChange = vi.fn();
    render(<ScopeSelector value="week" onChange={handleChange} />);

    const weekButton = screen.getByLabelText('Select Week view');
    fireEvent.keyDown(weekButton, { key: 'End' });

    expect(handleChange).toHaveBeenCalledWith('custom');
  });

  it('has correct ARIA attributes', () => {
    render(<ScopeSelector value="month" onChange={() => {}} />);

    const group = screen.getByRole('group', { name: 'Time scope selector' });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });
});
