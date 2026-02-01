import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transactionService } from './transactionService';
import { supabase } from '../lib/supabase';

// Mock supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockOrder = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  },
}));

describe('transactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock chains
    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
    });

    mockOrder.mockResolvedValue({ data: [], error: null });

    mockEq.mockReturnValue({
      single: mockSingle,
    });

    mockSingle.mockResolvedValue({ data: {}, error: null });

    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: mockSingle,
      }),
    });

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  it('getAll queries transactions table', async () => {
    await transactionService.getAll();
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockOrder).toHaveBeenCalledWith('date_in', { ascending: false });
  });

  it('getById queries specific transaction', async () => {
    await transactionService.getById('123');
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });

  it('create inserts new transaction', async () => {
    const newTransaction = {
      label: 'Test Transaction',
      status: 'pending' as const,
      sku: null,
      category: null,
      date_in: null,
      cash_out: null,
      date_out: null,
      cash_in: null,
      supplier_id: null,
      customer_id: null,
      sku_id: null,
      category_id: null,
    };

    await transactionService.create(newTransaction);
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockInsert).toHaveBeenCalledWith(newTransaction);
  });

  it('create inserts transaction with linked sku and category', async () => {
    const newTransaction = {
      label: 'Linked Transaction',
      status: 'pending' as const,
      sku_id: 'sku-uuid',
      category_id: 'cat-uuid',
      date_in: '2023-01-01',
      cash_in: 100,
      customer_id: 'cust-uuid',
      sku: null,
      category: null,
      cash_out: null,
      date_out: null,
      supplier_id: null,
    };

    await transactionService.create(newTransaction);
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockInsert).toHaveBeenCalledWith(newTransaction);
  });

  it('update modifies existing transaction', async () => {
    const updates = {
      label: 'Updated Transaction',
    };

    await transactionService.update('123', updates);
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockUpdate).toHaveBeenCalledWith(updates);
  });

  it('delete removes transaction', async () => {
    await transactionService.delete('123');
    expect(supabase.from).toHaveBeenCalledWith('transactions');
    expect(mockDelete).toHaveBeenCalled();
  });
});
