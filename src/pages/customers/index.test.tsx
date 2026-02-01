/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CustomersPage } from './index';
import * as hooks from '../../hooks/useCustomers';
import { Customer } from '../../types/database';

// Mock the hooks
vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: vi.fn(),
  useCreateCustomer: vi.fn(),
  useUpdateCustomer: vi.fn(),
  useDeleteCustomer: vi.fn(),
}));

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Acme Corp',
    phone: '123-456-7890',
    address: '123 Main St',
    payment_terms: 30,
    dso: 45,
    risk_score: 58, // Medium risk
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Globex',
    phone: '987-654-3210',
    address: '456 Elm St',
    payment_terms: 60,
    dso: 25,
    risk_score: 33, // Low risk
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
];

describe('CustomersPage', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(hooks.useCustomers).mockReturnValue({
      data: mockCustomers,
      isLoading: false,
    } as any);

    vi.mocked(hooks.useCreateCustomer).mockReturnValue({
      mutateAsync: mockCreate,
      isPending: false,
    } as any);

    vi.mocked(hooks.useUpdateCustomer).mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    } as any);

    vi.mocked(hooks.useDeleteCustomer).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it('renders the customers page', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your customer relationships and credit risk.')
    ).toBeInTheDocument();
  });

  it('renders the customer list', () => {
    render(<CustomersPage />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
    // Check for risk score badges
    expect(screen.getByText('58')).toBeInTheDocument();
    expect(screen.getByText('33')).toBeInTheDocument();
  });

  it('opens add customer modal', () => {
    render(<CustomersPage />);
    fireEvent.click(screen.getByText('Add Customer'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Customer')).toBeInTheDocument();
  });

  it('creates a new customer', async () => {
    render(<CustomersPage />);
    fireEvent.click(screen.getByText('Add Customer'));

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Corp' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '555-5555' } });
    fireEvent.change(screen.getByLabelText(/Payment Terms/i), { target: { value: '45' } });

    fireEvent.click(screen.getByText('Create Customer'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Corp',
          phone: '555-5555',
          payment_terms: 45,
        })
      );
    });
  });

  it('opens edit modal with pre-filled data', () => {
    render(<CustomersPage />);
    // Find edit button for first row (Acme Corp)
    const editButtons = screen.getAllByLabelText('Edit customer');
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Customer')).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Acme Corp');
    expect(screen.getByLabelText(/Phone/i)).toHaveValue('123-456-7890');
  });

  it('updates an existing customer', async () => {
    render(<CustomersPage />);
    const editButtons = screen.getAllByLabelText('Edit customer');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Acme Corp Updated' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        id: '1',
        updates: expect.objectContaining({
          name: 'Acme Corp Updated',
        }),
      });
    });
  });

  it('opens delete confirmation', () => {
    render(<CustomersPage />);
    const deleteButtons = screen.getAllByLabelText('Delete customer');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Customer')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Acme Corp\?/)).toBeInTheDocument();
  });

  it('deletes a customer', async () => {
    render(<CustomersPage />);
    const deleteButtons = screen.getAllByLabelText('Delete customer');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1');
    });
  });
});
