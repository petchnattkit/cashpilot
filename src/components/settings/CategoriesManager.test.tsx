import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { CategoriesManager } from './CategoriesManager';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../../hooks/useCategories';

// Mock the hooks
vi.mock('../../hooks/useCategories', () => ({
  useCategories: vi.fn(),
  useCreateCategory: vi.fn(),
  useUpdateCategory: vi.fn(),
  useDeleteCategory: vi.fn(),
}));

describe('CategoriesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    (useCategories as Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    // Mock mutations to invoke onSuccess callback so modals close
    (useCreateCategory as Mock).mockReturnValue({
      mutate: vi.fn((data, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    (useUpdateCategory as Mock).mockReturnValue({
      mutate: vi.fn((data, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });

    (useDeleteCategory as Mock).mockReturnValue({
      mutate: vi.fn((id, options) => {
        options?.onSuccess?.();
      }),
      isPending: false,
    });
  });

  describe('render states', () => {
    it('renders loading state when categories are loading', () => {
      (useCategories as Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<CategoriesManager />);

      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it('renders empty state when no categories exist', () => {
      (useCategories as Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<CategoriesManager />);

      expect(screen.getByText(/No data available/i)).toBeInTheDocument();
    });

    it('renders list of categories with different types', () => {
      const mockCategories = [
        { id: '1', name: 'Sales', type: 'in' as const },
        { id: '2', name: 'Rent', type: 'out' as const },
        { id: '3', name: 'General', type: 'both' as const },
      ];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();

      // Verify type badges are displayed
      expect(screen.getByText('IN')).toBeInTheDocument();
      expect(screen.getByText('OUT')).toBeInTheDocument();
      expect(screen.getByText('BOTH')).toBeInTheDocument();
    });
  });

  describe('add category', () => {
    it('opens add modal when clicking Add Category button', () => {
      render(<CategoriesManager />);

      const addButton = screen.getByRole('button', { name: /add category/i });
      fireEvent.click(addButton);

      expect(screen.getByRole('heading', { name: 'Add Category' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type/i)).toBeInTheDocument();
    });

    it('creates a category - fills form, saves, and closes modal', async () => {
      render(<CategoriesManager />);

      // Open add modal
      fireEvent.click(screen.getByRole('button', { name: /add category/i }));

      // Fill form
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'Office Supplies' },
      });

      // Change type to 'out'
      fireEvent.change(screen.getByLabelText(/Type/i), {
        target: { value: 'out' },
      });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

      // Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Add Category' })).not.toBeInTheDocument();
      });
    });

    it('disables save button when name is empty', () => {
      render(<CategoriesManager />);

      // Open add modal
      fireEvent.click(screen.getByRole('button', { name: /add category/i }));

      // Verify save button is disabled initially (name is empty)
      const saveButton = screen.getByRole('button', { name: /^save$/i });
      expect(saveButton).toBeDisabled();

      // Enter name
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'Test Category' },
      });

      // Verify save button is now enabled
      expect(saveButton).not.toBeDisabled();

      // Clear name
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: '' },
      });

      // Verify save button is disabled again
      expect(saveButton).toBeDisabled();
    });

    it('closes modal when clicking cancel', () => {
      render(<CategoriesManager />);

      // Open add modal
      fireEvent.click(screen.getByRole('button', { name: /add category/i }));
      expect(screen.getByRole('heading', { name: 'Add Category' })).toBeInTheDocument();

      // Click cancel
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Verify modal closes
      expect(screen.queryByRole('heading', { name: 'Add Category' })).not.toBeInTheDocument();
    });
  });

  describe('edit category', () => {
    it('opens edit modal with category data when clicking edit', () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit category/i });
      fireEvent.click(editButton);

      // Verify modal shows edit title and pre-filled data
      expect(screen.getByRole('heading', { name: 'Edit Category' })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sales')).toBeInTheDocument();
    });

    it('updates category - changes name and saves', async () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Open edit modal
      fireEvent.click(screen.getByRole('button', { name: /edit category/i }));

      // Change name
      fireEvent.change(screen.getByLabelText(/Name/i), {
        target: { value: 'Revenue' },
      });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

      // Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Edit Category' })).not.toBeInTheDocument();
      });
    });

    it('updates category - changes type and saves', async () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Open edit modal
      fireEvent.click(screen.getByRole('button', { name: /edit category/i }));

      // Change type to 'both'
      fireEvent.change(screen.getByLabelText(/Type/i), {
        target: { value: 'both' },
      });

      // Save
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

      // Verify modal closes
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Edit Category' })).not.toBeInTheDocument();
      });
    });
  });

  describe('delete category', () => {
    it('opens delete confirmation dialog when clicking delete', () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete category/i });
      fireEvent.click(deleteButton);

      // Verify confirmation dialog appears
      expect(screen.getByRole('heading', { name: /delete category/i })).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete "Sales"?/i)).toBeInTheDocument();
    });

    it('closes delete dialog when confirming delete', async () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Open delete dialog
      fireEvent.click(screen.getByRole('button', { name: /delete category/i }));
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

      // Confirm delete
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

      // Verify dialog closes
      await waitFor(() => {
        expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
      });
    });

    it('closes delete dialog when clicking cancel', () => {
      const mockCategories = [{ id: '1', name: 'Sales', type: 'in' as const }];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Open delete dialog
      fireEvent.click(screen.getByRole('button', { name: /delete category/i }));
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

      // Click cancel
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      // Verify dialog closes
      expect(screen.queryByText(/Are you sure you want to delete/i)).not.toBeInTheDocument();
    });
  });

  describe('type constraint', () => {
    it('allows type values: in, out, both', () => {
      render(<CategoriesManager />);

      // Open add modal
      fireEvent.click(screen.getByRole('button', { name: /add category/i }));

      const typeSelect = screen.getByLabelText(/Type/i);

      // Verify all allowed options exist
      expect(typeSelect).toHaveValue('both'); // default value

      // Test 'in' type
      fireEvent.change(typeSelect, { target: { value: 'in' } });
      expect(typeSelect).toHaveValue('in');

      // Test 'out' type
      fireEvent.change(typeSelect, { target: { value: 'out' } });
      expect(typeSelect).toHaveValue('out');

      // Test 'both' type
      fireEvent.change(typeSelect, { target: { value: 'both' } });
      expect(typeSelect).toHaveValue('both');
    });

    it('renders categories with all valid type values', () => {
      const mockCategories = [
        { id: '1', name: 'Income', type: 'in' as const },
        { id: '2', name: 'Expense', type: 'out' as const },
        { id: '3', name: 'General', type: 'both' as const },
      ];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Verify all categories with valid types are rendered
      expect(screen.getByText('Income')).toBeInTheDocument();
      expect(screen.getByText('Expense')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();

      // Verify type badges
      const badges = screen.getAllByText(/IN|OUT|BOTH/);
      expect(badges).toHaveLength(3);
    });
  });

  describe('UI elements', () => {
    it('renders the page title', () => {
      render(<CategoriesManager />);

      expect(screen.getByText('Transaction Categories')).toBeInTheDocument();
    });

    it('renders search input', () => {
      render(<CategoriesManager />);

      expect(screen.getByPlaceholderText(/Search categories.../i)).toBeInTheDocument();
    });

    it('renders action buttons for each category', () => {
      const mockCategories = [
        { id: '1', name: 'Sales', type: 'in' as const },
        { id: '2', name: 'Rent', type: 'out' as const },
      ];

      (useCategories as Mock).mockReturnValue({
        data: mockCategories,
        isLoading: false,
      });

      render(<CategoriesManager />);

      // Should have 2 edit and 2 delete buttons
      const editButtons = screen.getAllByRole('button', { name: /edit category/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete category/i });

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });
});
