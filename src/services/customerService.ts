import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { calculateCustomerRiskScore } from './scoringService';

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

/**
 * @deprecated Use calculateCustomerScore from scoringService instead
 * Kept for backward compatibility with existing tests
 */
export const calculateRiskScore = calculateCustomerRiskScore;

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
    const risk_score = calculateCustomerRiskScore(dso);

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
      updates.risk_score = calculateCustomerRiskScore(updates.dso);
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
