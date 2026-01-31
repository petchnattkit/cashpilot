import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export const categoryService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    getAllByType: async (type: 'in' | 'out' | 'both') => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .or(`type.eq.${type},type.eq.both`)
            .order('name', { ascending: true });

        if (error) throw error;
        return data;
    },

    create: async (category: CategoryInsert) => {
        const { data, error } = await supabase
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    update: async (id: string, category: CategoryUpdate) => {
        const { data, error } = await supabase
            .from('categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);

        if (error) throw error;
    },
};
