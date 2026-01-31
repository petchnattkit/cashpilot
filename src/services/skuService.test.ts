import { describe, it, expect, vi, beforeEach } from 'vitest';
import { skuService } from './skuService';
import { supabase } from '../lib/supabase';

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
        })),
    },
}));

describe('skuService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all skus', async () => {
        const mockData = [{ id: '1', code: 'SKU1' }];
        const selectMock = vi.fn().mockReturnThis();
        const orderMock = vi.fn().mockResolvedValue({ data: mockData, error: null });

        // @ts-expect-error Mocking Supabase chain
        supabase.from.mockReturnValue({
            select: selectMock,
            order: orderMock
        });

        const result = await skuService.getAll();
        expect(result).toEqual(mockData);
        expect(supabase.from).toHaveBeenCalledWith('skus');
        expect(orderMock).toHaveBeenCalledWith('code', { ascending: true });
    });

    it('should create a sku', async () => {
        const newSku = { code: 'SKU2', name: 'Product', description: 'Test', image_url: '' };
        const mockData = { id: '2', ...newSku };

        // @ts-expect-error Mocking Supabase chain
        supabase.from.mockReturnValue({
            insert: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockData, error: null })
        });

        const result = await skuService.create(newSku);
        expect(result).toEqual(mockData);
    });
});
