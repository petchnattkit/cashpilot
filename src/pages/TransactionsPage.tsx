import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from '../hooks/useTransactions';
import { useSuppliers } from '../hooks/useSuppliers';
import { useCustomers } from '../hooks/useCustomers';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Label } from '../components/ui/Label';
import type { Transaction, TransactionStatus } from '../types/database';

type TransactionFormData = {
  date_in: string;
  date_out: string;
  sku: string;
  label: string;
  category: string;
  cash_out: string; // Using string for input handling
  cash_in: string; // Using string for input handling
  supplier_id: string;
  customer_id: string;
  status: TransactionStatus;
};

const INITIAL_FORM_DATA: TransactionFormData = {
  date_in: '',
  date_out: '',
  sku: '',
  label: '',
  category: '',
  cash_out: '',
  cash_in: '',
  supplier_id: '',
  customer_id: '',
  status: 'pending',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  const { data: suppliers = [] } = useSuppliers();
  const { data: customers = [] } = useCustomers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(INITIAL_FORM_DATA);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; label: string } | null>(null);

  const supplierOptions = suppliers.map((s) => ({ value: s.id, label: s.name }));
  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));

  const columns: Column<Transaction>[] = [
    {
      key: 'date_in',
      header: 'Date',
      sortable: true,
      render: (_, row) => {
        // Display the most relevant date (In or Out)
        return row.date_in || row.date_out || '-';
      },
    },
    { key: 'label', header: 'Label', sortable: true },
    { key: 'sku', header: 'SKU', sortable: true },
    { key: 'category', header: 'Category', sortable: true },
    {
      key: 'cash_out',
      header: 'Cash Out',
      sortable: true,
      align: 'right',
      render: (value) => (value ? `$${Number(value).toFixed(2)}` : '-'),
    },
    {
      key: 'cash_in',
      header: 'Cash In',
      sortable: true,
      align: 'right',
      render: (value) => (value ? `$${Number(value).toFixed(2)}` : '-'),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'completed'
              ? 'bg-green-100 text-green-800'
              : value === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            aria-label="Edit transaction"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            className="text-error hover:text-error hover:bg-error/10"
            aria-label="Delete transaction"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setFormData({
      date_in: transaction.date_in || '',
      date_out: transaction.date_out || '',
      sku: transaction.sku || '',
      label: transaction.label,
      category: transaction.category || '',
      cash_out: transaction.cash_out?.toString() || '',
      cash_in: transaction.cash_in?.toString() || '',
      supplier_id: transaction.supplier_id || '',
      customer_id: transaction.customer_id || '',
      status: transaction.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setItemToDelete({
      id: transaction.id,
      label: transaction.label || transaction.sku || 'Unknown Transaction',
    });
    setIsDeleteOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      cash_out: formData.cash_out ? parseFloat(formData.cash_out) : null,
      cash_in: formData.cash_in ? parseFloat(formData.cash_in) : null,
      supplier_id: formData.supplier_id || null,
      customer_id: formData.customer_id || null,
      date_in: formData.date_in || null,
      date_out: formData.date_out || null,
      sku: formData.sku || null,
      category: formData.category || null,
    };

    if (editingId) {
      updateTransaction({ id: editingId, updates: payload }, { onSuccess: handleCloseModal });
    } else {
      createTransaction(payload, { onSuccess: handleCloseModal });
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteTransaction(itemToDelete.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setItemToDelete(null);
        },
      });
    }
  };

  const handleChange = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Transactions</h1>
          <p className="text-neutral-500 mt-1">Manage your business transactions</p>
        </div>
        <Button onClick={handleAdd} leftIcon={<Plus size={20} />}>
          Add Transaction
        </Button>
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['sku', 'category', 'label']}
        searchPlaceholder="Search transactions..."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="lg">
        <ModalHeader>
          <ModalTitle>{editingId ? 'Edit Transaction' : 'Add Transaction'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_in">Date In</Label>
              <Input
                id="date_in"
                type="date"
                value={formData.date_in}
                onChange={(e) => handleChange('date_in', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_out">Date Out</Label>
              <Input
                id="date_out"
                type="date"
                value={formData.date_out}
                onChange={(e) => handleChange('date_out', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="e.g. PROD-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label" required>
                Label
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                placeholder="Description or label"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g. Electronics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                options={STATUS_OPTIONS}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as TransactionStatus)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash_out">Cash Out</Label>
              <Input
                id="cash_out"
                type="number"
                step="0.01"
                value={formData.cash_out}
                onChange={(e) => handleChange('cash_out', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash_in">Cash In</Label>
              <Input
                id="cash_in"
                type="number"
                step="0.01"
                value={formData.cash_in}
                onChange={(e) => handleChange('cash_in', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select
                id="supplier"
                options={supplierOptions}
                value={formData.supplier_id}
                onChange={(e) => handleChange('supplier_id', e.target.value)}
                placeholder="Select Supplier"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select
                id="customer"
                options={customerOptions}
                value={formData.customer_id}
                onChange={(e) => handleChange('customer_id', e.target.value)}
                placeholder="Select Customer"
              />
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isCreating || isUpdating}
            disabled={!formData.label} // Basic validation
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${itemToDelete?.label}"? This action cannot be undone.`}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export { TransactionsPage };
