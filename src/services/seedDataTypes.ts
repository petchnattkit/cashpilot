import type { Database } from '../types/database';

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type SupplierInsert = Database['public']['Tables']['suppliers']['Insert'];

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

export type Sku = Database['public']['Tables']['skus']['Row'];
export type SkuInsert = Database['public']['Tables']['skus']['Insert'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionStatus = Database['public']['Tables']['transactions']['Row']['status'];
