import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
    describe('Rendering', () => {
        it('renders with children text', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
        });

        it('renders primary variant by default', () => {
            render(<Button>Primary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-primary');
        });

        it('renders secondary variant', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('border-primary');
        });

        it('renders ghost variant', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('text-neutral-600');
        });

        it('renders danger variant', () => {
            render(<Button variant="danger">Danger</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-error');
        });
    });

    describe('Sizes', () => {
        it('renders medium size by default', () => {
            render(<Button>Medium</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('px-4', 'py-2');
        });

        it('renders small size', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('px-3', 'py-1.5');
        });

        it('renders large size', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('px-6', 'py-3');
        });
    });

    describe('Loading State', () => {
        it('shows spinner when loading', () => {
            render(<Button isLoading>Loading</Button>);
            const button = screen.getByRole('button');
            expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
        });

        it('disables button when loading', () => {
            render(<Button isLoading>Loading</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('sets aria-busy when loading', () => {
            render(<Button isLoading>Loading</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('aria-busy', 'true');
        });

        it('does not fire onClick when loading', () => {
            const handleClick = vi.fn();
            render(
                <Button isLoading onClick={handleClick}>
                    Loading
                </Button>
            );
            const button = screen.getByRole('button');
            fireEvent.click(button);
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Click Handler', () => {
        it('fires onClick when clicked', () => {
            const handleClick = vi.fn();
            render(<Button onClick={handleClick}>Click me</Button>);
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('does not fire onClick when disabled', () => {
            const handleClick = vi.fn();
            render(
                <Button disabled onClick={handleClick}>
                    Disabled
                </Button>
            );
            fireEvent.click(screen.getByRole('button'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Icons', () => {
        it('renders left icon', () => {
            render(
                <Button leftIcon={<span data-testid="left-icon">L</span>}>
                    With Icon
                </Button>
            );
            expect(screen.getByTestId('left-icon')).toBeInTheDocument();
        });

        it('renders right icon', () => {
            render(
                <Button rightIcon={<span data-testid="right-icon">R</span>}>
                    With Icon
                </Button>
            );
            expect(screen.getByTestId('right-icon')).toBeInTheDocument();
        });

        it('hides left icon when loading', () => {
            render(
                <Button isLoading leftIcon={<span data-testid="left-icon">L</span>}>
                    Loading
                </Button>
            );
            expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('is focusable', () => {
            render(<Button>Focusable</Button>);
            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();
        });

        it('supports custom className', () => {
            render(<Button className="custom-class">Custom</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('custom-class');
        });
    });
});
