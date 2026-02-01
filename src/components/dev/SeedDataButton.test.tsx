import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeedDataButton } from './SeedDataButton';

// Mock useQueryClient
vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// Mock services
vi.mock('../../services/supplierService', () => ({
  supplierService: {
    create: vi.fn(),
  },
}));

vi.mock('../../services/customerService', () => ({
  customerService: {
    create: vi.fn(),
  },
}));

vi.mock('../../services/transactionService', () => ({
  transactionService: {
    create: vi.fn(),
  },
}));

vi.mock('../../services/skuService', () => ({
  skuService: {
    create: vi.fn(),
  },
}));

describe('SeedDataButton', () => {
  it('renders correctly', () => {
    render(<SeedDataButton />);
    expect(screen.getByRole('button', { name: /seed data/i })).toBeInTheDocument();
  });

  it('shows confirmation dialog on click', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => false);
    render(<SeedDataButton />);

    fireEvent.click(screen.getByRole('button', { name: /seed data/i }));

    expect(confirmSpy).toHaveBeenCalledWith('This will create 2 years of sample data (2025-2027). Are you sure?');
    confirmSpy.mockRestore();
  });
});
