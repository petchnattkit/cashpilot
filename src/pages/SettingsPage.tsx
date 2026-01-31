import { useState } from 'react';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import {
    useCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from '../hooks/useCategories';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import type { Category, CategoryInsert } from '../services/categoryService';

type SettingsTab = 'general' | 'categories';

function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [baselineValue, setBaselineValue] = useState(() => {
        return localStorage.getItem('cashpilot_baseline') || '0';
    });

    const handleSaveBaseline = () => {
        localStorage.setItem('cashpilot_baseline', baselineValue);
        // Optional: Show toast
        alert('Settings saved');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
                <p className="text-neutral-500 mt-1">Configure application settings and master data</p>
            </div>

            <div className="flex border-b border-neutral-200">
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'general'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                        }`}
                    onClick={() => setActiveTab('general')}
                >
                    General
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'categories'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                        }`}
                    onClick={() => setActiveTab('categories')}
                >
                    Categories (Master Data)
                </button>
            </div>

            <div className="pt-4">
                {activeTab === 'general' && (
                    <div className="max-w-md space-y-4 p-4 bg-white rounded-lg border border-neutral-200">
                        <h2 className="text-lg font-semibold text-neutral-900">Graph Configuration</h2>
                        <div className="space-y-2">
                            <Label htmlFor="baseline">Baseline Value</Label>
                            <Input
                                id="baseline"
                                type="number"
                                value={baselineValue}
                                onChange={(e) => setBaselineValue(e.target.value)}
                                placeholder="0"
                            />
                            <p className="text-xs text-neutral-500">
                                This value determines the baseline for cashflow graphs (e.g. minimum safety buffer).
                            </p>
                        </div>
                        <Button onClick={handleSaveBaseline} leftIcon={<Save size={16} />}>
                            Save Settings
                        </Button>
                    </div>
                )}

                {activeTab === 'categories' && <CategoriesManager />}
            </div>
        </div>
    );
}

function CategoriesManager() {
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

export { SettingsPage };
