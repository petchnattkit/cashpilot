import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Sku = Database['public']['Tables']['skus']['Row'];
export type SkuInsert = Database['public']['Tables']['skus']['Insert'];
export type SkuUpdate = Database['public']['Tables']['skus']['Update'];

export const skuService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('skus')
            .select('*')
            .order('code', { ascending: true });

        if (error) throw error;
        return data;
    },

    getById: async (id: string) => {
        const { data, error } = await supabase.from('skus').select('*').eq('id', id).single();

        if (error) throw error;
        return data;
    },

    create: async (sku: SkuInsert) => {
        const { data, error } = await supabase
            .from('skus')
            .insert(sku)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (id: string, sku: SkuUpdate) => {
        const { data, error } = await supabase
            .from('skus')
            .update(sku)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (id: string) => {
        const { error } = await supabase.from('skus').delete().eq('id', id);

        if (error) throw error;
    },
};
