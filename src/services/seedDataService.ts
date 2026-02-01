import type { Database } from '../types/database';
import type { SupplierInsert, CustomerInsert, SkuInsert } from './seedDataTypes';

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionStatus = Database['public']['Tables']['transactions']['Row']['status'];

// Default date range: Jan 1, 2025 to Jan 1, 2027
const DEFAULT_START_DATE = new Date('2025-01-01');
const DEFAULT_END_DATE = new Date('2027-01-01');

// Recurring expense definitions
interface RecurringExpense {
  label: string;
  amount: number;
  dayOfMonth: number;
  category: string;
}

const RECURRING_EXPENSES: RecurringExpense[] = [
  { label: 'Office Rent', amount: 5000, dayOfMonth: 1, category: 'Rent' },
  { label: 'Staff Salaries', amount: 15000, dayOfMonth: 15, category: 'Salaries' },
  { label: 'Utilities', amount: 500, dayOfMonth: 20, category: 'Utilities' },
];

// Seasonal multipliers for income (by month, 0-11)
const SEASONAL_MULTIPLIERS: number[] = [
  0.7,  // January - low
  0.75, // February - low
  0.85, // March
  0.9,  // April
  0.95, // May
  1.0,  // June
  1.0,  // July
  0.95, // August
  1.05, // September
  1.1,  // October
  1.4,  // November - high (holiday)
  1.5,  // December - high (holiday)
];

// Business expense categories and labels
const BUSINESS_CATEGORIES = ['Inventory', 'Services', 'Logistics', 'Marketing', 'Equipment'];
const BUSINESS_LABELS = [
  'Monthly Order',
  'Urgent Restock',
  'Quarterly Service',
  'Consulting Fee',
  'Shipping Charge',
  'Marketing Campaign',
  'Equipment Purchase',
  'Software License',
  'Maintenance',
  'Office Supplies',
];

// Customer sales labels
const SALES_LABELS = [
  'Product Sales',
  'Service Revenue',
  'Consulting Project',
  'Subscription Payment',
  'Licensing Fee',
  'Bulk Order',
  'Retail Sales',
  'Wholesale Order',
];

// SKU codes for realistic SKU references
const SKU_CODES = [
  'LAPTOP-001', 'PHONE-002', 'TABLET-003', 'DESKTOP-004', 'MONITOR-005',
  'KEYBOARD-006', 'MOUSE-007', 'HEADSET-008', 'WEBCAM-009', 'DOCK-010',
  'CABLE-011', 'ADAPTER-012', 'BATTERY-013', 'CHARGER-014', 'CASE-015',
  'SCREEN-016', 'MEMORY-017', 'STORAGE-018', 'CPU-019', 'GPU-020',
];

/**
 * Helper function to format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Helper function to get random integer in range (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Helper function to get random item from array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Helper function to determine transaction status (70% completed, 30% pending)
 */
function getRandomStatus(): TransactionStatus {
  return Math.random() < 0.7 ? 'completed' : 'pending';
}

/**
 * Helper function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Generate default suppliers
 */
export function generateDefaultSuppliers(): SupplierInsert[] {
  return [
    {
      name: 'TechParts Inc',
      payment_terms: 30,
      dpo: 10,
      phone: '555-0101',
      address: '123 Tech Blvd, Silicon Valley, CA',
      risk_score: null,
    },
    {
      name: 'Global Logistics',
      payment_terms: 45,
      dpo: 40,
      phone: '555-0102',
      address: '456 Shipping Lane, Miami, FL',
      risk_score: null,
    },
    {
      name: 'Office Supplies Co',
      payment_terms: 15,
      dpo: 12,
      phone: '555-0103',
      address: '789 Paper St, Scranton, PA',
      risk_score: null,
    },
    {
      name: 'Raw Materials Ltd',
      payment_terms: 60,
      dpo: 55,
      phone: '555-0104',
      address: '321 Mining Rd, Denver, CO',
      risk_score: null,
    },
    {
      name: 'Service Corp',
      payment_terms: 30,
      dpo: 25,
      phone: '555-0105',
      address: '654 Service Way, Austin, TX',
      risk_score: null,
    },
  ];
}

/**
 * Generate default customers
 */
export function generateDefaultCustomers(): CustomerInsert[] {
  return [
    {
      name: 'Retail Giant',
      payment_terms: 60,
      dso: 55,
      phone: '555-0201',
      address: '100 Mall Drive, New York, NY',
      risk_score: null,
    },
    {
      name: 'Small Shop',
      payment_terms: 15,
      dso: 10,
      phone: '555-0202',
      address: '200 Main St, Smallville, KS',
      risk_score: null,
    },
    {
      name: 'Online Store',
      payment_terms: 30,
      dso: 25,
      phone: '555-0203',
      address: '300 Web Way, Seattle, WA',
      risk_score: null,
    },
    {
      name: 'Distributor A',
      payment_terms: 45,
      dso: 40,
      phone: '555-0204',
      address: '400 Warehouse Blvd, Chicago, IL',
      risk_score: null,
    },
    {
      name: 'Local Market',
      payment_terms: 7,
      dso: 5,
      phone: '555-0205',
      address: '500 Fresh Lane, Portland, OR',
      risk_score: null,
    },
  ];
}

/**
 * Generate default SKUs
 */
export function generateDefaultSkus(): SkuInsert[] {
  return SKU_CODES.map((code) => ({
    code,
    name: `Product ${code.split('-')[0]}`,
    description: `High-quality ${code.split('-')[0].toLowerCase()} for business use`,
    image_url: null,
  }));
}

/**
 * Create recurring monthly transactions (rent, salaries, utilities)
 */
export function createRecurringTransactions(
  startDate: Date,
  endDate: Date,
  supplierIds: string[]
): TransactionInsert[] {
  const transactions: TransactionInsert[] = [];
  const currentDate = new Date(startDate);

  // Loop through each month in the date range
  while (currentDate < endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    for (const expense of RECURRING_EXPENSES) {
      // Create date for this expense in the current month
      const transactionDate = new Date(year, month, expense.dayOfMonth);

      // Skip if outside the date range
      if (transactionDate < startDate || transactionDate >= endDate) {
        continue;
      }

      const status = getRandomStatus();
      const supplierId = getRandomItem(supplierIds);

      // For pending transactions, set a future due date
      let dateOut = formatDate(transactionDate);
      if (status === 'pending') {
        const dueDate = addDays(transactionDate, getRandomInt(7, 30));
        dateOut = formatDate(dueDate);
      }

      transactions.push({
        label: expense.label,
        supplier_id: supplierId,
        cash_out: expense.amount,
        cash_in: null,
        date_out: dateOut,
        date_in: null,
        status,
        category: expense.category,
        category_id: null,
        sku: null,
        sku_id: null,
        customer_id: null,
      });
    }

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return transactions;
}

/**
 * Create seasonal income transactions
 */
export function createSeasonalIncome(
  startDate: Date,
  endDate: Date,
  customerIds: string[],
  skuIds: string[]
): TransactionInsert[] {
  const transactions: TransactionInsert[] = [];
  const currentDate = new Date(startDate);

  // Base daily sales amount
  const baseDailySales = 2000;

  // Loop through each day in the date range
  while (currentDate < endDate) {
    const month = currentDate.getMonth();

    // Apply seasonal multiplier
    const seasonalMultiplier = SEASONAL_MULTIPLIERS[month];

    // Weekend factor (lower sales on weekends)
    const dayOfWeek = currentDate.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;

    // Calculate number of transactions for this day (1-4)
    const numTransactions = getRandomInt(1, 4);

    for (let i = 0; i < numTransactions; i++) {
      // Random variation in amount
      const amountVariation = 0.5 + Math.random(); // 0.5x to 1.5x
      const amount = Math.round(baseDailySales * seasonalMultiplier * weekendMultiplier * amountVariation);

      // Skip very small amounts
      if (amount < 500) continue;

      const status = getRandomStatus();
      const customerId = getRandomItem(customerIds);
      const skuId = Math.random() < 0.7 ? getRandomItem(skuIds) : null; // 70% have SKU

      // For pending transactions, set a future due date
      let dateIn = formatDate(currentDate);
      if (status === 'pending') {
        const dueDate = addDays(currentDate, getRandomInt(7, 45));
        dateIn = formatDate(dueDate);
      }

      transactions.push({
        label: getRandomItem(SALES_LABELS),
        customer_id: customerId,
        cash_in: amount,
        cash_out: null,
        date_in: dateIn,
        date_out: null,
        status,
        category: 'Sales',
        category_id: null,
        sku: skuId ? `SKU-${getRandomInt(100, 999)}` : null,
        sku_id: skuId,
        supplier_id: null,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return transactions;
}

/**
 * Create random business expenses (cash_out transactions)
 */
export function createRandomTransactions(
  startDate: Date,
  endDate: Date,
  supplierIds: string[],
  count: number
): TransactionInsert[] {
  const transactions: TransactionInsert[] = [];
  const dateRangeMs = endDate.getTime() - startDate.getTime();

  for (let i = 0; i < count; i++) {
    // Random date within range
    const randomOffset = Math.random() * dateRangeMs;
    const transactionDate = new Date(startDate.getTime() + randomOffset);

    const status = getRandomStatus();
    const supplierId = getRandomItem(supplierIds);
    const amount = getRandomInt(100, 10000);

    // For pending transactions, set a future due date
    let dateOut = formatDate(transactionDate);
    if (status === 'pending') {
      const dueDate = addDays(transactionDate, getRandomInt(7, 60));
      dateOut = formatDate(dueDate);
    }

    transactions.push({
      label: getRandomItem(BUSINESS_LABELS),
      supplier_id: supplierId,
      cash_out: amount,
      cash_in: null,
      date_out: dateOut,
      date_in: null,
      status,
      category: getRandomItem(BUSINESS_CATEGORIES),
      category_id: null,
      sku: null,
      sku_id: null,
      customer_id: null,
    });
  }

  return transactions;
}

/**
 * Generate extended seed data with configurable date range
 */
export interface GeneratedSeedData {
  suppliers: SupplierInsert[];
  customers: CustomerInsert[];
  skus: SkuInsert[];
  transactions: TransactionInsert[];
}

export function generateExtendedSeedData(
  startDate: Date = DEFAULT_START_DATE,
  endDate: Date = DEFAULT_END_DATE
): GeneratedSeedData {
  const suppliers = generateDefaultSuppliers();
  const customers = generateDefaultCustomers();
  const skus = generateDefaultSkus();

  // Placeholder IDs - these will be replaced with actual IDs after entities are created
  const placeholderSupplierIds = suppliers.map((_, i) => `supplier-${i}`);
  const placeholderCustomerIds = customers.map((_, i) => `customer-${i}`);
  const placeholderSkuIds = skus.map((_, i) => `sku-${i}`);

  // Create recurring transactions (rent, salaries, utilities)
  const recurringTransactions = createRecurringTransactions(
    startDate,
    endDate,
    placeholderSupplierIds
  );

  // Create seasonal income transactions
  const seasonalIncome = createSeasonalIncome(
    startDate,
    endDate,
    placeholderCustomerIds,
    placeholderSkuIds
  );

  // Calculate random business expenses count to reach at least 500 total
  const targetTransactionCount = 500;
  const currentCount = recurringTransactions.length + seasonalIncome.length;
  const randomExpenseCount = Math.max(100, targetTransactionCount - currentCount);

  // Create random business expenses
  const randomExpenses = createRandomTransactions(
    startDate,
    endDate,
    placeholderSupplierIds,
    randomExpenseCount
  );

  // Combine all transactions
  const transactions = [
    ...recurringTransactions,
    ...seasonalIncome,
    ...randomExpenses,
  ];

  return {
    suppliers,
    customers,
    skus,
    transactions,
  };
}

/**
 * Get transaction statistics for verification
 */
export function getSeedDataStats(data: GeneratedSeedData): {
  totalTransactions: number;
  cashInCount: number;
  cashOutCount: number;
  completedCount: number;
  pendingCount: number;
  dateRange: { start: string; end: string };
} {
  const transactions = data.transactions;

  const cashInCount = transactions.filter((t) => t.cash_in !== null).length;
  const cashOutCount = transactions.filter((t) => t.cash_out !== null).length;
  const completedCount = transactions.filter((t) => t.status === 'completed').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  // Find date range
  const allDates = transactions
    .flatMap((t) => [t.date_in, t.date_out])
    .filter((d): d is string => d !== null);

  const sortedDates = allDates.sort();
  const dateRange = {
    start: sortedDates[0] || '',
    end: sortedDates[sortedDates.length - 1] || '',
  };

  return {
    totalTransactions: transactions.length,
    cashInCount,
    cashOutCount,
    completedCount,
    pendingCount,
    dateRange,
  };
}
