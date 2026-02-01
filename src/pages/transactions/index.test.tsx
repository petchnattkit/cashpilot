import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TransactionsPage } from './index';
import * as transactionHooks from '../../hooks/useTransactions';
import * as supplierHooks from '../../hooks/useSuppliers';
import * as customerHooks from '../../hooks/useCustomers';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { Transaction } from '../../types/database';

// Mock the hooks
vi.mock('../../hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
  useCreateTransaction: vi.fn(),
  useUpdateTransaction: vi.fn(),
  useDeleteTransaction: vi.fn(),
}));

vi.mock('../../hooks/useSuppliers', () => ({
  useSuppliers: vi.fn(),
}));

vi.mock('../../hooks/useCustomers', () => ({
  useCustomers: vi.fn(),
}));

vi.mock('../../hooks/useSkus', () => ({
  useSkus: vi.fn(),
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: vi.fn(),
}));

const mockTransactions: Transaction[] = [
  {
    id: '1',
    sku_id: null,
    category_id: null,
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
    sku_id: null,
    category_id: null,
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

  beforeEach(async () => {
    vi.clearAllMocks();

    // Helper to create a mock mutation that triggers onSuccess
    const createMockMutation = (
      mockFn: typeof mockCreate
    ): UseMutationResult<unknown, Error, unknown, unknown> => {
      return {
        mutate: (variables: unknown, options?: { onSuccess?: () => void }) => {
          mockFn(variables, options);
          // Trigger onSuccess callback to simulate successful mutation
          if (options?.onSuccess) {
            options.onSuccess();
          }
        },
        mutateAsync: vi.fn(),
        isPending: false,
        isError: false,
        isIdle: true,
        isSuccess: false,
        error: null,
        data: undefined,
        failureCount: 0,
        failureReason: null,
        isPaused: false,
        status: 'idle',
        variables: undefined,
        reset: vi.fn(),
        context: undefined,
      } as UseMutationResult<unknown, Error, unknown, unknown>;
    };

    vi.mocked(transactionHooks.useTransactions).mockReturnValue({
      data: mockTransactions,
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve(mockTransactions),
    } as UseQueryResult<Transaction[]>);

    vi.mocked(transactionHooks.useCreateTransaction).mockReturnValue(
      createMockMutation(mockCreate) as UseMutationResult<unknown, Error, unknown, unknown>
    );

    vi.mocked(transactionHooks.useUpdateTransaction).mockReturnValue(
      createMockMutation(mockUpdate) as UseMutationResult<unknown, Error, unknown, unknown>
    );

    vi.mocked(transactionHooks.useDeleteTransaction).mockReturnValue(
      createMockMutation(mockDelete) as UseMutationResult<unknown, Error, unknown, unknown>
    );

    vi.mocked(supplierHooks.useSuppliers).mockReturnValue({
      data: [{ id: 'supp-1', name: 'Supplier A' }],
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([{ id: 'supp-1', name: 'Supplier A' }]),
    } as UseQueryResult<Array<{ id: string; name: string }>>);

    vi.mocked(customerHooks.useCustomers).mockReturnValue({
      data: [{ id: 'cust-1', name: 'Customer A' }],
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([{ id: 'cust-1', name: 'Customer A' }]),
    } as UseQueryResult<Array<{ id: string; name: string }>>);

    const { useSkus } = await import('../../hooks/useSkus');
    vi.mocked(useSkus).mockReturnValue({
      data: [{ id: 'sku-1', code: 'SKU-001', name: 'Test SKU' }],
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([{ id: 'sku-1', code: 'SKU-001', name: 'Test SKU' }]),
    } as UseQueryResult<Array<{ id: string; code: string; name: string }>>);

    const { useCategories } = await import('../../hooks/useCategories');
    vi.mocked(useCategories).mockReturnValue({
      data: [{ id: 'cat-1', name: 'Sales', type: 'in' }],
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: true,
      isLoadingError: false,
      isRefetchError: false,
      dataUpdatedAt: Date.now(),
      error: null,
      errorUpdatedAt: 0,
      failureCount: 0,
      failureReason: null,
      errorUpdateCount: 0,
      isFetched: true,
      isFetchedAfterMount: true,
      isFetching: false,
      isPlaceholderData: false,
      isRefetching: false,
      isStale: false,
      refetch: vi.fn(),
      fetchStatus: 'idle',
      promise: Promise.resolve([{ id: 'cat-1', name: 'Sales', type: 'in' }]),
    } as UseQueryResult<Array<{ id: string; name: string; type: string }>>);
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
    fireEvent.change(screen.getByLabelText(/SKU/i), { target: { value: 'sku-1' } });
    fireEvent.change(screen.getByLabelText(/Cash In Amount/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Customer/i), { target: { value: 'cust-1' } });

    fireEvent.click(screen.getByText('Save'));

    // Verify modal closes on success
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Add Transaction' })).not.toBeInTheDocument();
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
  });

  it('updates an existing transaction', async () => {
    render(<TransactionsPage />);
    const editButtons = screen.getAllByLabelText('Edit transaction');
    fireEvent.click(editButtons[0]);

    fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Updated Deal' } });
    fireEvent.click(screen.getByText('Save'));

    // Verify modal closes on success
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Edit Transaction' })).not.toBeInTheDocument();
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

    // Verify delete dialog closes on success
    await waitFor(() => {
      expect(screen.queryByText('Delete Transaction')).not.toBeInTheDocument();
    });
  });

  describe('Segment Control (Tabs)', () => {
    it('shows Cash In tab by default', () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Cash In tab should be active (green styling)
      expect(screen.getByRole('tab', { name: /Cash In/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByRole('tab', { name: /Cash Out/i })).toHaveAttribute(
        'aria-selected',
        'false'
      );
    });

    it('switches between Cash In and Cash Out tabs', () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Click Cash Out tab
      fireEvent.click(screen.getByRole('tab', { name: /Cash Out/i }));

      // Cash Out tab should now be active
      expect(screen.getByRole('tab', { name: /Cash In/i })).toHaveAttribute(
        'aria-selected',
        'false'
      );
      expect(screen.getByRole('tab', { name: /Cash Out/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
    });

    it('shows Cash In input and Customer dropdown on Cash In tab', () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Cash In tab content should be visible
      expect(screen.getByLabelText(/Cash In Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Customer/i)).toBeInTheDocument();

      // Cash Out content should not be visible
      expect(screen.queryByLabelText(/Cash Out Amount/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Supplier/i)).not.toBeInTheDocument();
    });

    it('shows Cash Out input and Supplier dropdown on Cash Out tab', () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Switch to Cash Out tab
      fireEvent.click(screen.getByRole('tab', { name: /Cash Out/i }));

      // Cash Out tab content should be visible
      expect(screen.getByLabelText(/Cash Out Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Supplier/i)).toBeInTheDocument();

      // Cash In content should not be visible
      expect(screen.queryByLabelText(/Cash In Amount/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Customer/i)).not.toBeInTheDocument();
    });

    it('validates Cash In tab requires amount and customer', async () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Try to save without filling in required fields
      fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Test' } });
      fireEvent.click(screen.getByText('Save'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Cash In amount must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('validates Cash Out tab requires amount and supplier', async () => {
      render(<TransactionsPage />);
      fireEvent.click(screen.getByRole('button', { name: 'Add Transaction' }));

      // Switch to Cash Out tab
      fireEvent.click(screen.getByRole('tab', { name: /Cash Out/i }));

      // Try to save without filling in required fields
      fireEvent.change(screen.getByLabelText(/Label/i), { target: { value: 'Test' } });
      fireEvent.click(screen.getByText('Save'));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Cash Out amount must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('edit mode shows Cash In tab for cash_in transactions', () => {
      render(<TransactionsPage />);
      const editButtons = screen.getAllByLabelText('Edit transaction');
      // First transaction has cash_in > 0
      fireEvent.click(editButtons[0]);

      // Should show Cash In tab as active
      expect(screen.getByRole('tab', { name: /Cash In/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByLabelText(/Cash In Amount/i)).toHaveValue(100);
    });

    it('edit mode shows Cash Out tab for cash_out transactions', () => {
      render(<TransactionsPage />);
      const editButtons = screen.getAllByLabelText('Edit transaction');
      // Second transaction has cash_out > 0
      fireEvent.click(editButtons[1]);

      // Should show Cash Out tab as active
      expect(screen.getByRole('tab', { name: /Cash Out/i })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(screen.getByLabelText(/Cash Out Amount/i)).toHaveValue(50);
    });
  });
});
