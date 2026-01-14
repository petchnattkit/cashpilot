import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];
export type SupplierUpdate = Database['public']['Tables']['suppliers']['Update'];

export const calculateRiskScore = (dpo: number): number => {
  if (dpo < 15) {
    // High Risk: 70-100
    // dpo=0 -> 100, dpo=14 -> 72
    return Math.max(70, 100 - dpo * 2);
  } else if (dpo <= 30) {
    // Medium Risk: 40-69
    // dpo=15 -> 69, dpo=30 -> 40
    // Linear interpolation: y = 69 + (x - 15) * ((40 - 69) / (30 - 15))
    // y = 69 + (x - 15) * (-29 / 15)
    return Math.round(69 + (dpo - 15) * (-29 / 15));
  } else {
    // Low Risk: 0-39
    // dpo=31 -> 38, dpo=50 -> 0
    // Continue with 100 - 2*dpo logic as it fits well for >30
    return Math.max(0, 100 - dpo * 2);
  }
};

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
    const risk_score = calculateRiskScore(dpo);

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
      updates.risk_score = calculateRiskScore(updates.dpo);
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
