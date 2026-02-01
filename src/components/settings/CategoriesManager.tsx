import { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';
import { DataTable, type Column } from '../ui/data-table/DataTable';
import { Button } from '../ui/button/Button';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from '../../components/ui/modal';
import { ConfirmDialog } from '../ui/dialog/ConfirmDialog';
import { Input } from '../ui/Input/Input';
import { Label } from '../ui/typography/Label';
import { Select } from '../ui/select/Select';
import type { Category, CategoryInsert } from '../../services/categoryService';

export function CategoriesManager() {
  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryInsert>({ name: '', type: 'both' });
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Name', sortable: true },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'in'
            ? 'bg-green-100 text-green-800'
            : value === 'out'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
            }`}
        >
          {String(value).toUpperCase()}
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
            aria-label="Edit Category"
          >
            <Pencil size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            className="text-error hover:text-error hover:bg-error/10"
            aria-label="Delete Category"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type as 'in' | 'out' | 'both',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setItemToDelete({ id: category.id, name: category.name });
    setIsDeleteOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'both' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', type: 'both' });
  };

  const handleSave = () => {
    if (editingId) {
      updateCategory({ id: editingId, updates: formData }, { onSuccess: handleCloseModal });
    } else {
      createCategory(formData, { onSuccess: handleCloseModal });
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteCategory(itemToDelete.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setItemToDelete(null);
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-neutral-900">Transaction Categories</h2>
        <Button onClick={handleAdd} size="sm" leftIcon={<Plus size={16} />}>
          Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        isLoading={isLoading}
        searchKeys={['name']}
        searchPlaceholder="Search categories..."
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalHeader>
          <ModalTitle>{editingId ? 'Edit Category' : 'Add Category'}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name" required>
                Name
              </Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sales, Utilities"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-type">Type</Label>
              <Select
                id="cat-type"
                value={formData?.type || 'both'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'in' | 'out' | 'both' })
                }
                options={[
                  { value: 'in', label: 'Cash In' },
                  { value: 'out', label: 'Cash Out' },
                  { value: 'both', label: 'Both' },
                ]}
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
            disabled={!formData.name}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${itemToDelete?.name}"?`}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

