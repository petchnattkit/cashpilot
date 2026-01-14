import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export const calculateRiskScore = (dso: number): number => {
  if (dso < 30) {
    // Low Risk: 0-39
    // Map 0-29 to 0-39
    return Math.round(dso * 1.3);
  } else if (dso <= 50) {
    // Medium Risk: 40-69
    // Map 30-50 to 40-69
    // Range is 20 dso units -> 29 score units. Factor 1.45
    return Math.round(40 + (dso - 30) * 1.45);
  } else {
    // High Risk: 70-100
    // Formula: dso * 1.5, capped at 100
    return Math.min(100, Math.round(dso * 1.5));
  }
};

export const customerService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  create: async (customer: CustomerInsert) => {
    const dso = customer.dso ?? 0;
    const risk_score = calculateRiskScore(dso);

    const { data, error } = await supabase
      .from('customers')
      .insert({ ...customer, risk_score })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, customer: CustomerUpdate) => {
    const updates = { ...customer };

    if (updates.dso !== undefined && updates.dso !== null) {
      updates.risk_score = calculateRiskScore(updates.dso);
    }

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('customers').delete().eq('id', id);

    if (error) throw error;
  },
};
