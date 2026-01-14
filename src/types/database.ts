export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  payment_terms: number | null;
  dpo: number | null;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  payment_terms: number | null;
  dso: number | null;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
}

export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
  id: string;
  sku: string | null;
  label: string;
  category: string | null;
  date_in: string | null;
  cash_out: number | null;
  date_out: string | null;
  cash_in: number | null;
  supplier_id: string | null;
  customer_id: string | null;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: Supplier;
        Insert: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
