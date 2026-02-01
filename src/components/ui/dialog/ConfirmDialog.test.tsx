import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
    description: 'Are you sure?',
  };

  it('renders with correct title and description', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('displays loading state on confirm button', () => {
    render(<ConfirmDialog {...defaultProps} isLoading={true} />);
    const confirmBtn = screen.getByRole('button', { name: /confirm/i }); // might be "Loading..." or contain spinner
    // Since button implementation shows spinner and children? Or just spinner?
    // Let's check Button implementation again.
    // {isLoading ? <Spinner .../> : leftIcon ...} {children}
    // So it shows spinner AND children if children is passed.

    expect(confirmBtn).toBeDisabled();
    expect(confirmBtn).toHaveAttribute('aria-busy', 'true');
  });

  it('renders custom button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Yes, Delete" cancelText="No, Keep" />);
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('No, Keep')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    const { rerender } = render(<ConfirmDialog {...defaultProps} variant="danger" />);
    // Check for danger icon/style if possible, or just ensure it renders without crashing
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="info" />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} variant="warning" />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });
});
