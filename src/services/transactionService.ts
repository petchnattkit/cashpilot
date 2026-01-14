import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export const transactionService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date_in', { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  create: async (transaction: TransactionInsert) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, transaction: TransactionUpdate) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);

    if (error) throw error;
  },
};
