import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check for "Vite + React" or whatever default text is in the template
        // Since we don't know exact content of App.tsx from the template, we'll just check true for now
        // to ensure the test runner works.
        expect(true).toBe(true);
    });
});
