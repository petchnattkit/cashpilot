import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Database, Loader2 } from 'lucide-react';
import { Button } from '../ui/button/Button';
import { supplierService } from '../../services/supplierService';
import { customerService } from '../../services/customerService';
import { transactionService } from '../../services/transactionService';
import { skuService } from '../../services/skuService';
import {
  generateExtendedSeedData,
  generateDefaultSuppliers,
  generateDefaultCustomers,
  generateDefaultSkus,
} from '../../services/seedDataService';
import type { Supplier, Customer, Sku } from '../../types/database';

export const SeedDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    if (!confirm('This will create 2 years of sample data (2025-2027). Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Suppliers
      const supplierDefinitions = generateDefaultSuppliers();
      const createdSuppliers: Supplier[] = [];
      for (const supplier of supplierDefinitions) {
        const created = await supplierService.create(supplier);
        createdSuppliers.push(created);
      }

      // 2. Create Customers
      const customerDefinitions = generateDefaultCustomers();
      const createdCustomers: Customer[] = [];
      for (const customer of customerDefinitions) {
        const created = await customerService.create(customer);
        createdCustomers.push(created);
      }

      // 3. Create SKUs
      const skuDefinitions = generateDefaultSkus();
      const createdSkus: Sku[] = [];
      for (const sku of skuDefinitions) {
        const created = await skuService.create(sku);
        createdSkus.push(created);
      }

      // 4. Create Transactions with proper entity references
      const supplierIds = createdSuppliers.map((s) => s.id);
      const customerIds = createdCustomers.map((c) => c.id);
      const skuIds = createdSkus.map((s) => s.id);

      // Regenerate transactions with actual IDs
      const transactionsWithIds = generateExtendedSeedData().transactions.map((transaction) => {
        const updatedTransaction = { ...transaction };

        // Replace placeholder supplier IDs with actual ones
        if (updatedTransaction.supplier_id) {
          const supplierIndex = parseInt(updatedTransaction.supplier_id.replace('supplier-', ''));
          updatedTransaction.supplier_id = supplierIds[supplierIndex] || supplierIds[0];
        }

        // Replace placeholder customer IDs with actual ones
        if (updatedTransaction.customer_id) {
          const customerIndex = parseInt(updatedTransaction.customer_id.replace('customer-', ''));
          updatedTransaction.customer_id = customerIds[customerIndex] || customerIds[0];
        }

        // Replace placeholder SKU IDs with actual ones
        if (updatedTransaction.sku_id) {
          const skuIndex = parseInt(updatedTransaction.sku_id.replace('sku-', ''));
          updatedTransaction.sku_id = skuIds[skuIndex] || null;
        }

        return updatedTransaction;
      });

      // Create transactions in batches to avoid overwhelming the database
      const BATCH_SIZE = 50;
      for (let i = 0; i < transactionsWithIds.length; i += BATCH_SIZE) {
        const batch = transactionsWithIds.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((t) => transactionService.create(t)));
      }

      // Invalidate all queries
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['skus'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });

      alert(`Seed data created successfully!\nCreated ${createdSuppliers.length} suppliers, ${createdCustomers.length} customers, ${createdSkus.length} SKUs, and ${transactionsWithIds.length} transactions.`);
    } catch (error) {
      console.error('Failed to seed data:', error);
      alert('Failed to seed data. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSeed}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
      Seed Data
    </Button>
  );
};
