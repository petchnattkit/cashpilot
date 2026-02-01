/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SuppliersPage } from './index';
import * as hooks from '../../hooks/useSuppliers';
import { Supplier } from '../../types/database';

// Mock the hooks
vi.mock('../../hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
  useCreateSupplier: vi.fn(),
  useUpdateSupplier: vi.fn(),
  useDeleteSupplier: vi.fn(),
}));

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Acme Supply',
    phone: '123-456-7890',
    address: '123 Supply St',
    payment_terms: 30,
    dpo: 45,
    risk_score: 58,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Global Parts',
    phone: '987-654-3210',
    address: '456 Factory Rd',
    payment_terms: 60,
    dpo: 25,
    risk_score: 33,
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
];

describe('SuppliersPage', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useSuppliers).mockReturnValue({
      data: mockSuppliers,
      isLoading: false,
    } as any);

    vi.mocked(hooks.useCreateSupplier).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    } as any);

    vi.mocked(hooks.useUpdateSupplier).mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    } as any);

    vi.mocked(hooks.useDeleteSupplier).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it('renders the suppliers page', () => {
    render(<SuppliersPage />);
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(screen.getByText('Manage your suppliers and track payment terms.')).toBeInTheDocument();
  });

  it('renders the supplier list', () => {
    render(<SuppliersPage />);
    expect(screen.getByText('Acme Supply')).toBeInTheDocument();
    expect(screen.getByText('Global Parts')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    // Check for risk score badges
    expect(screen.getByText('58')).toBeInTheDocument();
    expect(screen.getByText('33')).toBeInTheDocument();
  });

  it('opens add supplier modal', () => {
    render(<SuppliersPage />);
    fireEvent.click(screen.getByText('Add Supplier'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Supplier')).toBeInTheDocument();
  });

  it('creates a new supplier', async () => {
    render(<SuppliersPage />);
    fireEvent.click(screen.getByText('Add Supplier'));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Supply Co' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-5555' } });
    fireEvent.change(screen.getByLabelText(/Payment Terms/i), { target: { value: '45' } });

    fireEvent.click(screen.getByText('Create Supplier'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Supply Co',
          phone: '555-5555',
          payment_terms: 45,
        })
      );
    });
  });

  it('opens edit modal with pre-filled data', () => {
    render(<SuppliersPage />);
    // Find edit button for first row (Acme Supply)
    const editButtons = screen.getAllByLabelText('Edit supplier');
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Supplier')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Acme Supply');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('123-456-7890');
  });

  it('updates an existing supplier', async () => {
    render(<SuppliersPage />);
    const editButtons = screen.getAllByLabelText('Edit supplier');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Acme Supply Updated' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: '1',
        updates: expect.objectContaining({
          name: 'Acme Supply Updated',
        }),
      });
    });
  });

  it('opens delete confirmation', () => {
    render(<SuppliersPage />);
    const deleteButtons = screen.getAllByLabelText('Delete supplier');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Supplier')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Acme Supply\?/)).toBeInTheDocument();
  });

  it('deletes a supplier', async () => {
    render(<SuppliersPage />);
    const deleteButtons = screen.getAllByLabelText('Delete supplier');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1');
    });
  });
});
