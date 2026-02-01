import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skuService } from '../services/skuService';
import type { SkuInsert, SkuUpdate } from '../services/skuService';

export const useSkus = () => {
    return useQuery({
        queryKey: ['skus'],
        queryFn: skuService.getAll,
    });
};

export const useSku = (id: string) => {
    return useQuery({
        queryKey: ['skus', id],
        queryFn: () => skuService.getById(id),
        enabled: !!id,
    });
};

export const useCreateSku = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newSku: SkuInsert) => skuService.create(newSku),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skus'] });
        },
    });
};

export const useUpdateSku = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: SkuUpdate }) =>
            skuService.update(id, updates),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['skus'] });
            queryClient.invalidateQueries({ queryKey: ['skus', data.id] });
        },
    });
};

export const useDeleteSku = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => skuService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['skus'] });
        },
    });
};
