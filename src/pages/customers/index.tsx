import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '../../hooks/useCustomers';
import type { Customer } from '../../types/database';
import type { CustomerInsert } from '../../services/customerService';
import { DataTable, type Column } from '../../components/ui/data-table/DataTable';
import { Button } from '../../components/ui/button/Button';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/dialog/ConfirmDialog';
import { Input } from '../../components/ui/Input/Input';
import { Label } from '../../components/ui/typography/Label';

const emptyForm: CustomerInsert = {
  name: '',
  phone: '',
  address: '',
  payment_terms: 0,
  dso: 0,
  risk_score: 0,
};

function CustomersPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerInsert>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormData(emptyForm);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      payment_terms: customer.payment_terms || 0,
      dso: customer.dso || 0,
      risk_score: customer.risk_score || 0,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (selectedCustomer) {
        await updateCustomer.mutateAsync({
          id: selectedCustomer.id,
          updates: formData,
        });
      } else {
        await createCustomer.mutateAsync(formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteCustomer.mutateAsync(selectedCustomer.id);
      setIsDeleteOpen(false);
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const getRiskBadgeColor = (score: number) => {
    if (score < 40) return 'bg-success/10 text-success border-success/20';
    if (score < 70) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-error/10 text-error border-error/20';
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value) => value || '-',
    },
    {
      key: 'payment_terms',
      header: 'Terms (Days)',
      sortable: true,
      align: 'center',
      render: (value) => value || '-',
    },
    {
      key: 'dso',
      header: 'DSO',
      sortable: true,
      align: 'center',
      render: (value) => value || '-',
    },
    {
      key: 'risk_score',
      header: 'Risk Score',
      sortable: true,
      align: 'center',
      render: (value) => {
        const score = Number(value) || 0;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(score)}`}
          >
            {score}
          </span>
        );
      },
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            aria-label="Edit customer"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-error hover:text-error hover:bg-error/10"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDelete(row);
            }}
            aria-label="Delete customer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="text-neutral-500 mt-1">
            Manage your customer relationships and credit risk.
          </p>
        </div>
        <Button onClick={handleOpenAdd} leftIcon={<Plus className="w-4 h-4" />}>
          Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['name', 'phone']}
        searchPlaceholder="Search customers..."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg">
        <ModalHeader>
          <ModalTitle>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" required>
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer Company Name"
                error={errors.name}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label htmlFor="payment_terms">Payment Terms (Days)</Label>
                <Input
                  id="payment_terms"
                  type="number"
                  value={formData.payment_terms || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 0 })
                  }
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Business Rd, City, State"
              />
            </div>

            <div>
              <Label htmlFor="dso">DSO (Days Sales Outstanding)</Label>
              <Input
                id="dso"
                type="number"
                value={formData.dso || ''}
                onChange={(e) => setFormData({ ...formData, dso: parseInt(e.target.value) || 0 })}
                placeholder="45"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Used to calculate Risk Score automatically.
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={createCustomer.isPending || updateCustomer.isPending}
          >
            {selectedCustomer ? 'Save Changes' : 'Create Customer'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}

export { CustomersPage };
