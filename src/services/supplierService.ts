import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { calculateSupplierRiskScore } from './scoringService';

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

/**
 * @deprecated Use calculateSupplierScore from scoringService instead
 * Kept for backward compatibility with existing tests
 */
export const calculateRiskScore = calculateSupplierRiskScore;

export const supplierService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  create: async (supplier: SupplierInsert) => {
    const dpo = supplier.dpo ?? 0;
    const risk_score = calculateSupplierRiskScore(dpo);

    const { data, error } = await supabase
      .from('suppliers')
      .insert({ ...supplier, risk_score })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, supplier: SupplierUpdate) => {
    const updates = { ...supplier };

    if (updates.dpo !== undefined && updates.dpo !== null) {
      updates.risk_score = calculateSupplierRiskScore(updates.dpo);
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);

    if (error) throw error;
  },
};
