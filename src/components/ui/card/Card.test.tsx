import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './index';

describe('Card', () => {
    describe('Rendering', () => {
        it('renders children correctly', () => {
            render(<Card>Card content</Card>);
            expect(screen.getByText('Card content')).toBeInTheDocument();
        });

        it('renders default variant with correct styles', () => {
            render(<Card data-testid="card">Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toHaveClass('bg-white');
            expect(card).toHaveClass('shadow-soft');
            expect(card).toHaveClass('border-neutral-200');
        });

        it('renders glass variant with correct styles', () => {
            render(<Card variant="glass" data-testid="card">Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toHaveClass('bg-transparent');
            expect(card).toHaveClass('backdrop-blur-lg');
            expect(card).toHaveClass('shadow-glass');
        });

        it('supports custom className', () => {
            render(<Card className="custom-class" data-testid="card">Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toHaveClass('custom-class');
        });

        it('passes additional props to the element', () => {
            render(<Card data-testid="card" id="my-card">Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toHaveAttribute('id', 'my-card');
        });
    });
});

describe('CardHeader', () => {
    it('renders children correctly', () => {
        render(<CardHeader>Header content</CardHeader>);
        expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('has correct default styles', () => {
        render(<CardHeader data-testid="header">Content</CardHeader>);
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('p-4');
        expect(header).toHaveClass('md:p-6');
        expect(header).toHaveClass('border-b');
        expect(header).toHaveClass('border-neutral-100');
    });

    it('supports custom className', () => {
        render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>);
        const header = screen.getByTestId('header');
        expect(header).toHaveClass('custom-header');
    });
});

describe('CardTitle', () => {
    it('renders as h3 element', () => {
        render(<CardTitle>Title text</CardTitle>);
        const title = screen.getByRole('heading', { level: 3 });
        expect(title).toHaveTextContent('Title text');
    });

    it('has correct default styles', () => {
        render(<CardTitle data-testid="title">Title</CardTitle>);
        const title = screen.getByTestId('title');
        expect(title).toHaveClass('text-lg');
        expect(title).toHaveClass('font-bold');
        expect(title).toHaveClass('text-neutral-900');
    });

    it('supports custom className', () => {
        render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>);
        const title = screen.getByTestId('title');
        expect(title).toHaveClass('custom-title');
    });
});

describe('CardContent', () => {
    it('renders children correctly', () => {
        render(<CardContent>Body content</CardContent>);
        expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('has correct responsive padding', () => {
        render(<CardContent data-testid="content">Content</CardContent>);
        const content = screen.getByTestId('content');
        expect(content).toHaveClass('p-4');
        expect(content).toHaveClass('md:p-6');
    });

    it('supports custom className', () => {
        render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
        const content = screen.getByTestId('content');
        expect(content).toHaveClass('custom-content');
    });
});

describe('CardFooter', () => {
    it('renders children correctly', () => {
        render(<CardFooter>Footer content</CardFooter>);
        expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('has correct default styles', () => {
        render(<CardFooter data-testid="footer">Content</CardFooter>);
        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('p-4');
        expect(footer).toHaveClass('md:p-6');
        expect(footer).toHaveClass('border-t');
        expect(footer).toHaveClass('border-neutral-100');
    });

    it('supports custom className', () => {
        render(<CardFooter className="custom-footer" data-testid="footer">Content</CardFooter>);
        const footer = screen.getByTestId('footer');
        expect(footer).toHaveClass('custom-footer');
    });
});

describe('Card Compound Component', () => {
    it('renders a complete card with all sub-components', () => {
        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>Card body content</CardContent>
                <CardFooter>Card footer</CardFooter>
            </Card>
        );

        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title');
        expect(screen.getByText('Card body content')).toBeInTheDocument();
        expect(screen.getByText('Card footer')).toBeInTheDocument();
    });

    it('can render a simple card with just content', () => {
        render(
            <Card>
                <CardContent>Simple content</CardContent>
            </Card>
        );

        expect(screen.getByText('Simple content')).toBeInTheDocument();
    });
});
