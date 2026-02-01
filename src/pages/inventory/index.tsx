import { useState, useMemo, useCallback } from 'react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useSkus, useCreateSku, useUpdateSku, useDeleteSku } from '../../hooks/useSkus';
import { DataTable, type Column } from '../../components/ui/data-table/DataTable';
import { Button } from '../../components/ui/button/Button';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../../components/ui/modal';
import { ConfirmDialog } from '../../components/ui/dialog/ConfirmDialog';
import { Input } from '../../components/ui/Input/Input';
import { Label } from '../../components/ui/typography/Label';
import type { Sku } from '../../services/skuService';

type SkuFormData = {
  code: string;
  name: string;
  description: string;
  image_url: string;
};

const INITIAL_FORM_DATA: SkuFormData = {
  code: '',
  name: '',
  description: '',
  image_url: '',
};

function InventoryPage() {
  const { data: skus = [], isLoading, error } = useSkus();
  const { mutate: createSku, isPending: isCreating } = useCreateSku();
  const { mutate: updateSku, isPending: isUpdating } = useUpdateSku();
  const { mutate: deleteSku, isPending: isDeleting } = useDeleteSku();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SkuFormData>(INITIAL_FORM_DATA);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleEdit = useCallback((sku: Sku) => {
    setEditingId(sku.id);
    setFormData({
      code: sku.code || '',
      name: sku.name || '',
      description: sku.description || '',
      image_url: sku.image_url || '',
    });
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((sku: Sku) => {
    setItemToDelete({
      id: sku.id,
      name: sku.name || sku.code || 'Unknown SKU',
    });
    setIsDeleteOpen(true);
  }, []);

  const columns = useMemo<Column<Sku>[]>(
    () => [
      { key: 'code', header: 'Code', sortable: true },
      { key: 'name', header: 'Name', sortable: true },
      { key: 'description', header: 'Description', sortable: true },
      {
        key: 'image_url',
        header: 'Image',
        render: (value) =>
          value ? (
            <img
              src={String(value)}
              alt="Product"
              className="w-10 h-10 object-cover rounded-md border border-neutral-200"
            />
          ) : (
            <div className="w-10 h-10 bg-neutral-100 rounded-md flex items-center justify-center text-neutral-400">
              <Package size={20} />
            </div>
          ),
      },
      {
        key: 'id',
        header: 'Actions',
        align: 'right',
        render: (_, row: Sku) => (
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} aria-label="Edit SKU">
              <Pencil size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(row)}
              className="text-error hover:text-error hover:bg-error/10"
              aria-label="Delete SKU"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [handleEdit, handleDeleteClick]
  );

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
    };

    if (editingId) {
      updateSku({ id: editingId, updates: payload }, { onSuccess: handleCloseModal });
    } else {
      createSku(payload, { onSuccess: handleCloseModal });
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteSku(itemToDelete.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setItemToDelete(null);
        },
      });
    }
  };

  const handleChange = (field: keyof SkuFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>
            <p className="text-neutral-500 mt-1">Manage product SKUs</p>
          </div>
        </div>
        <div className="bg-error/10 text-error p-4 rounded-lg">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>
          <p className="text-neutral-500 mt-1">Manage product SKUs</p>
        </div>
        <Button onClick={handleAdd} leftIcon={<Plus size={20} />}>
          Add SKU
        </Button>
      </div>

      <DataTable
        data={skus}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['code', 'name', 'description']}
        searchPlaceholder="Search inventory..."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalHeader>
          <ModalTitle>{editingId ? 'Edit SKU' : 'Add SKU'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" required>
                Code
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g. SKU-123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Product Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Product Description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
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
            disabled={!formData.code || !formData.name}
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
        title="Delete SKU"
        description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export { InventoryPage };
