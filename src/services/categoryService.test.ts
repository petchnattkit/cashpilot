import { describe, it, expect, vi, beforeEach } from 'vitest';
import { categoryService } from './categoryService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(),
    },
}));

describe('categoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all categories', async () => {
        const mockData = [{ id: '1', name: 'Cat1' }];
        const mockChain = {
            select: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        };
        // @ts-expect-error Mocking Supabase chain
        supabase.from.mockReturnValue(mockChain);

        const result = await categoryService.getAll();
        expect(result).toEqual(mockData);
        expect(supabase.from).toHaveBeenCalledWith('categories');
    });

    it('should fetch categories by type', async () => {
        const mockData = [{ id: '1', name: 'Cat1', type: 'in' }];
        const mockChain = {
            select: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({ data: mockData, error: null })
        };
        // @ts-expect-error Mocking Supabase chain
        supabase.from.mockReturnValue(mockChain);

        const result = await categoryService.getAllByType('in');
        expect(result).toEqual(mockData);
        expect(mockChain.or).toHaveBeenCalledWith('type.eq.in,type.eq.both');
    });
});
