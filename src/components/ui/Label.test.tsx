import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './Label';

describe('Label', () => {
    it('renders children correctly', () => {
        render(<Label>Email</Label>);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders as a label element', () => {
        render(<Label>Name</Label>);
        const label = screen.getByText('Name');
        expect(label.tagName).toBe('LABEL');
    });

    it('shows required indicator when required prop is true', () => {
        render(<Label required>Username</Label>);
        expect(screen.getByText('*')).toBeInTheDocument();
        expect(screen.getByText('*')).toHaveClass('text-error');
    });

    it('does not show required indicator when required prop is false', () => {
        render(<Label>Optional Field</Label>);
        expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('supports custom className', () => {
        render(<Label className="custom-label">Test</Label>);
        expect(screen.getByText('Test')).toHaveClass('custom-label');
    });

    it('passes htmlFor to the label element', () => {
        render(<Label htmlFor="email-input">Email</Label>);
        const label = screen.getByText('Email');
        expect(label).toHaveAttribute('for', 'email-input');
    });

    it('has default styling', () => {
        render(<Label data-testid="label">Test</Label>);
        const label = screen.getByTestId('label');
        expect(label).toHaveClass('text-sm');
        expect(label).toHaveClass('font-medium');
        expect(label).toHaveClass('text-neutral-700');
    });
});
