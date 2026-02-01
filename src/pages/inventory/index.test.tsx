import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { InventoryPage } from './index';
import { useSkus, useCreateSku, useUpdateSku, useDeleteSku } from '../../hooks/useSkus';

// Mock the hooks
vi.mock('../../hooks/useSkus', () => ({
  useSkus: vi.fn(),
  useCreateSku: vi.fn(),
  useUpdateSku: vi.fn(),
  useDeleteSku: vi.fn(),
}));

describe('InventoryPage', () => {
  const mockCreateSku = vi.fn();
  const mockUpdateSku = vi.fn();
  const mockDeleteSku = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSkus as Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    (useCreateSku as Mock).mockReturnValue({
      mutate: mockCreateSku,
      isPending: false,
    });

    (useUpdateSku as Mock).mockReturnValue({
      mutate: mockUpdateSku,
      isPending: false,
    });

    (useDeleteSku as Mock).mockReturnValue({
      mutate: mockDeleteSku,
      isPending: false,
    });
  });

  it('renders loading state', () => {
    (useSkus as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<InventoryPage />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useSkus as Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<InventoryPage />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders a list of SKUs', () => {
    const mockSkus = [
      { id: '1', code: 'SKU-001', name: 'Product 1', description: 'Desc 1', image_url: '' },
      { id: '2', code: 'SKU-002', name: 'Product 2', description: 'Desc 2', image_url: '' },
    ];

    (useSkus as Mock).mockReturnValue({
      data: mockSkus,
      isLoading: false,
    });

    render(<InventoryPage />);

    expect(screen.getByText('SKU-001')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('SKU-002')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('opens modal when clicking "Add SKU"', () => {
    render(<InventoryPage />);

    const addButton = screen.getByText(/Add SKU/i);
    fireEvent.click(addButton);

    expect(screen.getByText('Add SKU', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
  });

  it('calls createSku when submitting form', () => {
    render(<InventoryPage />);

    fireEvent.click(screen.getByText(/Add SKU/i));

    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'NEW-001' } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Product' } });

    fireEvent.click(screen.getByText('Save', { selector: 'button' }));

    expect(mockCreateSku).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'NEW-001',
        name: 'New Product',
      }),
      expect.anything()
    );
  });

  it('renders error state', () => {
    (useSkus as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch SKUs'),
    });

    render(<InventoryPage />);
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  it('validates form - Save button disabled when required fields empty', () => {
    render(<InventoryPage />);

    fireEvent.click(screen.getByText(/Add SKU/i));

    const saveButton = screen.getByText('Save', { selector: 'button' });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'SKU-123' } });
    expect(saveButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Product Name' } });
    expect(saveButton).not.toBeDisabled();
  });

  it('cancels modal without saving', () => {
    render(<InventoryPage />);

    fireEvent.click(screen.getByText(/Add SKU/i));

    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'SKU-123' } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Product Name' } });

    fireEvent.click(screen.getByText('Cancel', { selector: 'button' }));

    expect(screen.queryByText('Add SKU', { selector: 'h2' })).not.toBeInTheDocument();
    expect(mockCreateSku).not.toHaveBeenCalled();
  });

  it('shows loading state during creation', () => {
    (useCreateSku as Mock).mockReturnValue({
      mutate: mockCreateSku,
      isPending: true,
    });

    render(<InventoryPage />);

    fireEvent.click(screen.getByText(/Add SKU/i));

    fireEvent.change(screen.getByLabelText(/Code/i), { target: { value: 'SKU-123' } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Product Name' } });

    const saveButton = screen.getByText('Save', { selector: 'button' });
    expect(saveButton).toBeDisabled();
  });

  it('opens edit modal when clicking edit button', () => {
    const mockSkus = [
      { id: '1', code: 'SKU-001', name: 'Product 1', description: 'Desc 1', image_url: '' },
    ];
    (useSkus as Mock).mockReturnValue({ data: mockSkus, isLoading: false });

    render(<InventoryPage />);

    const editButton = screen.getByLabelText(/Edit SKU/i);
    fireEvent.click(editButton);

    expect(screen.getByText('Edit SKU', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('SKU-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Product 1')).toBeInTheDocument();
  });

  it('calls deleteSku when confirming delete', () => {
    const mockSkus = [
      { id: '1', code: 'SKU-001', name: 'Product 1', description: 'Desc 1', image_url: '' },
    ];
    (useSkus as Mock).mockReturnValue({ data: mockSkus, isLoading: false });

    render(<InventoryPage />);

    fireEvent.click(screen.getByLabelText(/Delete SKU/i));
    fireEvent.click(screen.getByText('Confirm', { selector: 'button' }));

    expect(mockDeleteSku).toHaveBeenCalledWith('1', expect.anything());
  });

  it('calls updateSku when submitting edit form', () => {
    const mockSkus = [
      { id: '1', code: 'SKU-001', name: 'Product 1', description: 'Desc 1', image_url: '' },
    ];
    (useSkus as Mock).mockReturnValue({ data: mockSkus, isLoading: false });

    render(<InventoryPage />);

    fireEvent.click(screen.getByLabelText(/Edit SKU/i));
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated Product' } });
    fireEvent.click(screen.getByText('Save', { selector: 'button' }));

    expect(mockUpdateSku).toHaveBeenCalledWith(
      { id: '1', updates: expect.objectContaining({ name: 'Updated Product' }) },
      expect.anything()
    );
  });
});
