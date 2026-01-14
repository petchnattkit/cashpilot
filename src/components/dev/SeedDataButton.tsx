import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Database, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { supplierService } from '../../services/supplierService';
import { customerService } from '../../services/customerService';
import { transactionService } from '../../services/transactionService';
import type { TransactionStatus } from '../../types/database';

export const SeedDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSeed = async () => {
    if (!confirm('This will create sample data. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Suppliers
      const suppliers = [
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

      const createdSuppliers = await Promise.all(suppliers.map((s) => supplierService.create(s)));

      // 2. Create Customers
      const customers = [
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

      const createdCustomers = await Promise.all(customers.map((c) => customerService.create(c)));

      // 3. Create Transactions
      const statuses: TransactionStatus[] = ['completed', 'pending', 'pending']; // bias towards pending
      const categories = ['Inventory', 'Services', 'Logistics', 'Rent', 'Utilities'];
      const labels = [
        'Monthly Order',
        'Urgent Restock',
        'Quarterly Service',
        'Consulting Fee',
        'Shipping Charge',
      ];

      const transactions = [];
      const today = new Date();

      // Helper to generate random date within last 3 months or next 1 month
      const getRandomDate = (offsetDays: number) => {
        const date = new Date(today);
        date.setDate(today.getDate() + offsetDays);
        return date.toISOString().split('T')[0];
      };

      for (let i = 0; i < 20; i++) {
        const isCashIn = Math.random() > 0.5;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(Math.random() * 10000) + 500;

        // Random date between -90 and +30 days
        const dateOffset = Math.floor(Math.random() * 120) - 90;
        const date = getRandomDate(dateOffset);

        if (isCashIn) {
          const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
          transactions.push({
            label: `Sales - ${customer.name}`,
            customer_id: customer.id,
            cash_in: amount,
            cash_out: null,
            date_in: date,
            date_out: null,
            status,
            category: 'Sales',
            sku: `SKU-${Math.floor(Math.random() * 1000)}`,
            supplier_id: null,
          });
        } else {
          const supplier = createdSuppliers[Math.floor(Math.random() * createdSuppliers.length)];
          transactions.push({
            label: `${labels[Math.floor(Math.random() * labels.length)]}`,
            supplier_id: supplier.id,
            cash_out: amount,
            cash_in: null,
            date_out: date,
            date_in: null,
            status,
            category: categories[Math.floor(Math.random() * categories.length)],
            sku: null,
            customer_id: null,
          });
        }
      }

      await Promise.all(transactions.map((t) => transactionService.create(t)));

      // Invalidate all queries
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });

      alert('Seed data created successfully!');
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
