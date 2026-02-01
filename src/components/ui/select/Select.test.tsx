import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';

const mockOptions = [
    { value: 'usd', label: 'US Dollar' },
    { value: 'eur', label: 'Euro' },
    { value: 'gbp', label: 'British Pound' },
];

describe('Select', () => {
    describe('Rendering', () => {
        it('renders a select element', () => {
            render(<Select options={mockOptions} />);
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('renders all options', () => {
            render(<Select options={mockOptions} />);
            expect(screen.getByText('US Dollar')).toBeInTheDocument();
            expect(screen.getByText('Euro')).toBeInTheDocument();
            expect(screen.getByText('British Pound')).toBeInTheDocument();
        });

        it('renders placeholder option when provided', () => {
            render(<Select options={mockOptions} placeholder="Select currency" />);
            expect(screen.getByText('Select currency')).toBeInTheDocument();
        });

        it('placeholder option is disabled', () => {
            render(<Select options={mockOptions} placeholder="Select one" />);
            const placeholder = screen.getByText('Select one');
            expect(placeholder).toHaveAttribute('disabled');
        });

        it('renders with default styling', () => {
            render(<Select options={mockOptions} data-testid="select" />);
            const select = screen.getByTestId('select');
            expect(select).toHaveClass('border-neutral-300');
            expect(select).toHaveClass('rounded-md');
        });

        it('supports custom className', () => {
            render(<Select options={mockOptions} className="custom-select" data-testid="select" />);
            const select = screen.getByTestId('select');
            expect(select).toHaveClass('custom-select');
        });
    });

    describe('Error State', () => {
        it('shows error message when error prop is provided', () => {
            render(<Select options={mockOptions} error="Selection required" />);
            expect(screen.getByText('Selection required')).toBeInTheDocument();
        });

        it('has error border styling when error prop is provided', () => {
            render(<Select options={mockOptions} error="Error" data-testid="select" />);
            const select = screen.getByTestId('select');
            expect(select).toHaveClass('border-error');
        });

        it('sets aria-invalid when error prop is provided', () => {
            render(<Select options={mockOptions} error="Error" data-testid="select" />);
            const select = screen.getByTestId('select');
            expect(select).toHaveAttribute('aria-invalid', 'true');
        });

        it('sets aria-describedby linking to error message', () => {
            render(<Select id="currency-select" options={mockOptions} error="Error" />);
            const select = screen.getByRole('combobox');
            expect(select).toHaveAttribute('aria-describedby', 'currency-select-error');
        });
    });

    describe('Disabled State', () => {
        it('can be disabled', () => {
            render(<Select options={mockOptions} disabled />);
            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });
    });

    describe('Value Selection', () => {
        it('each option has correct value attribute', () => {
            render(<Select options={mockOptions} />);
            const options = screen.getAllByRole('option');
            expect(options[0]).toHaveValue('usd');
            expect(options[1]).toHaveValue('eur');
            expect(options[2]).toHaveValue('gbp');
        });
    });
});
