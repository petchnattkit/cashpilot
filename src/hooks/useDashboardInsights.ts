import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useSuppliers } from './useSuppliers';
import { useCustomers } from './useCustomers';
import { useSkus } from './useSkus';

export function useDashboardInsights() {
    const { data: transactions = [] } = useTransactions();
    const { data: suppliers = [] } = useSuppliers();
    const { data: customers = [] } = useCustomers();
    const { data: skus = [] } = useSkus();

    return useMemo(() => {
        if (!transactions.length) return {
            topSuppliersByValue: [],
            topSuppliersByFreq: [],
            riskSuppliers: [],
            topCustomersByValue: [],
            topCustomersByFreq: [],
            riskCustomers: [],
            topSkusByValue: [],
            topSkusByFreq: []
        };

        // Helper to get name
        const getSupplierName = (id: string | null) => suppliers.find(s => s.id === id)?.name || 'Unknown';
        const getCustomerName = (id: string | null) => customers.find(c => c.id === id)?.name || 'Unknown';
        const getSkuName = (id: string | null) => skus.find(s => s.id === id)?.name || skus.find(s => s.id === id)?.code || 'Unknown';

        // Aggregation Maps
        const supplierStats = new Map<string, { id: string; name: string; value: number; count: number; pendingValue: number }>();
        const customerStats = new Map<string, { id: string; name: string; value: number; count: number; pendingValue: number }>();
        const skuStats = new Map<string, { id: string; name: string; value: number; count: number }>();

        transactions.forEach(t => {
            // Supplier Stats (Cash Out)
            if (t.supplier_id && t.cash_out) {
                const current = supplierStats.get(t.supplier_id) || { id: t.supplier_id, name: getSupplierName(t.supplier_id), value: 0, count: 0, pendingValue: 0 };
                current.value += Number(t.cash_out);
                current.count += 1;
                if (t.status === 'pending') current.pendingValue += Number(t.cash_out);
                supplierStats.set(t.supplier_id, current);
            }

            // Customer Stats (Cash In)
            if (t.customer_id && t.cash_in) {
                const current = customerStats.get(t.customer_id) || { id: t.customer_id, name: getCustomerName(t.customer_id), value: 0, count: 0, pendingValue: 0 };
                current.value += Number(t.cash_in);
                current.count += 1;
                if (t.status === 'pending') current.pendingValue += Number(t.cash_in);
                customerStats.set(t.customer_id, current);
            }

            // SKU Stats (Total Value = In + Out involved)
            if (t.sku_id) {
                const current = skuStats.get(t.sku_id) || { id: t.sku_id, name: getSkuName(t.sku_id), value: 0, count: 0 };
                current.value += (Number(t.cash_in || 0) + Number(t.cash_out || 0));
                current.count += 1;
                skuStats.set(t.sku_id, current);
            }
        });

        // Convert to Arrays and Sort
        const sortedSuppliers = Array.from(supplierStats.values());
        const sortedCustomers = Array.from(customerStats.values());
        const sortedSkus = Array.from(skuStats.values());

        return {
            topSuppliersByValue: [...sortedSuppliers].sort((a, b) => b.value - a.value).slice(0, 5),
            topSuppliersByFreq: [...sortedSuppliers].sort((a, b) => b.count - a.count).slice(0, 5),
            riskSuppliers: [...sortedSuppliers].filter(s => s.pendingValue > 0).sort((a, b) => b.pendingValue - a.pendingValue).slice(0, 5),

            topCustomersByValue: [...sortedCustomers].sort((a, b) => b.value - a.value).slice(0, 5),
            topCustomersByFreq: [...sortedCustomers].sort((a, b) => b.count - a.count).slice(0, 5),
            riskCustomers: [...sortedCustomers].filter(c => c.pendingValue > 0).sort((a, b) => b.pendingValue - a.pendingValue).slice(0, 5),

            topSkusByValue: [...sortedSkus].sort((a, b) => b.value - a.value).slice(0, 5),
            topSkusByFreq: [...sortedSkus].sort((a, b) => b.count - a.count).slice(0, 5),
        };
    }, [transactions, suppliers, customers, skus]);
}
