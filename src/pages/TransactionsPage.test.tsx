/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionsPage } from './TransactionsPage';
import * as transactionHooks from '../hooks/useTransactions';
import * as supplierHooks from '../hooks/useSuppliers';
import * as customerHooks from '../hooks/useCustomers';
import { Transaction } from '../types/database';

// Mock the hooks
vi.mock('../hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
  useCreateTransaction: vi.fn(),
  useUpdateTransaction: vi.fn(),
  useDeleteTransaction: vi.fn(),
}));

vi.mock('../hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
}));

vi.mock('../hooks/useCustomers', () => ({
  useCustomers: vi.fn(),
}));

const mockTransactions: Transaction[] = [
  {
    id: '1',
    sku: 'SKU-001',
    label: 'Test Transaction 1',
    category: 'Sales',
    date_in: null,
    cash_out: null,
    date_out: '2023-01-01',
    cash_in: 100.0,
    supplier_id: null,
    customer_id: 'cust-1',
    status: 'completed',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    sku: 'SKU-002',
    label: 'Test Transaction 2',
    category: 'Expense',
    date_in: '2023-01-02',
    cash_out: 50.0,
    date_out: null,
    cash_in: null,
    supplier_id: 'supp-1',
    customer_id: null,
    status: 'pending',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
  },
];

describe('TransactionsPage', () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
    } as any);

    vi.mocked(transactionHooks.useCreateTransaction).mockReturnValue({
      mutate: mockCreate,
      isPending: false,
    } as any);

    vi.mocked(transactionHooks.useUpdateTransaction).mockReturnValue({
      mutate: mockUpdate,
      isPending: false,
    } as any);

    vi.mocked(transactionHooks.useDeleteTransaction).mockReturnValue({
      mutate: mockDelete,
      isPending: false,
    } as any);

    vi.mocked(supplierHooks.useSuppliers).mockReturnValue({
      data: [{ id: 'supp-1', name: 'Supplier A' }],
    } as any);

    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: [{ id: 'cust-1', name: 'Customer A' }],
    } as any);
  });

  it('renders the transactions page', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Manage your business transactions')).toBeInTheDocument();
  });

  it('renders the transaction list', () => {
    render(<TransactionsPage />);
    expect(screen.getByText('Test Transaction 1')).toBeInTheDocument();
    expect(screen.getByText('Test Transaction 2')).toBeInTheDocument();
    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('opens add transaction modal', () => {
    render(<TransactionsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Add Transaction' })).toBeInTheDocument();
  });

  it('creates a new transaction', async () => {
    render(<TransactionsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'New Deal' } });
    fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'SKU-NEW' } });
    fireEvent.change(screen.getByLabelText(/Cash In/i), { target: { value: '200' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'New Deal',
          sku: 'SKU-NEW',
          cash_in: 200,
        }),
        expect.any(Object)
      );
    });
  });

  it('opens edit modal with pre-filled data', () => {
    render(<TransactionsPage />);
    // Find edit button for first row
    const editButtons = screen.getAllByLabelText('Edit transaction');
    fireEvent.click(editButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Transaction')).toBeInTheDocument();
    expect(screen.getByLabelText(/Label/i)).toHaveValue('Test Transaction 1');
    expect(screen.getByLabelText(/SKU/i)).toHaveValue('SKU-001');
  });

  it('updates an existing transaction', async () => {
    render(<TransactionsPage />);
    const editButtons = screen.getAllByLabelText('Edit transaction');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Updated Deal' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        {
          id: '1',
          updates: expect.objectContaining({
            label: 'Updated Deal',
          }),
        },
        expect.any(Object)
      );
    });
  });

  it('opens delete confirmation', () => {
    render(<TransactionsPage />);
    const deleteButtons = screen.getAllByLabelText('Delete transaction');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Transaction')).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete "Test Transaction 1"\?/)
    ).toBeInTheDocument();
  });

  it('deletes a transaction', async () => {
    render(<TransactionsPage />);
    const deleteButtons = screen.getAllByLabelText('Delete transaction');
    fireEvent.click(deleteButtons[0]);

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('1', expect.any(Object));
    });
  });
});
