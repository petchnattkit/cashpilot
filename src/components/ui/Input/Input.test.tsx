import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
    describe('Rendering', () => {
        it('renders an input element', () => {
            render(<Input placeholder="Enter text" />);
            expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
        });

        it('renders with default styling', () => {
            render(<Input data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveClass('border-neutral-300');
            expect(input).toHaveClass('rounded-md');
        });

        it('supports custom className', () => {
            render(<Input className="custom-input" data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveClass('custom-input');
        });

        it('passes native input props', () => {
            render(<Input type="email" name="email" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('type', 'email');
            expect(input).toHaveAttribute('name', 'email');
        });
    });

    describe('Error State', () => {
        it('shows error message when error prop is provided', () => {
            render(<Input error="This field is required" />);
            expect(screen.getByText('This field is required')).toBeInTheDocument();
        });

        it('has error border styling when error prop is provided', () => {
            render(<Input error="Error" data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveClass('border-error');
        });

        it('sets aria-invalid when error prop is provided', () => {
            render(<Input error="Error" data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveAttribute('aria-invalid', 'true');
        });

        it('sets aria-describedby linking to error message', () => {
            render(<Input id="test-input" error="Error message" />);
            const input = screen.getByRole('textbox');
            expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
        });

        it('does not show error message when no error', () => {
            render(<Input />);
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Addons', () => {
        it('renders left addon', () => {
            render(<Input leftAddon="$" />);
            expect(screen.getByText('$')).toBeInTheDocument();
        });

        it('renders right addon', () => {
            render(<Input rightAddon="%" />);
            expect(screen.getByText('%')).toBeInTheDocument();
        });

        it('renders both addons', () => {
            render(<Input leftAddon="$" rightAddon=".00" />);
            expect(screen.getByText('$')).toBeInTheDocument();
            expect(screen.getByText('.00')).toBeInTheDocument();
        });

        it('adds left padding when leftAddon is present', () => {
            render(<Input leftAddon="$" data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveClass('pl-10');
        });

        it('adds right padding when rightAddon is present', () => {
            render(<Input rightAddon="%" data-testid="input" />);
            const input = screen.getByTestId('input');
            expect(input).toHaveClass('pr-10');
        });
    });

    describe('Disabled State', () => {
        it('can be disabled', () => {
            render(<Input disabled />);
            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
        });
    });
});
