import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { MainLayout } from './MainLayout'

function renderWithRouter(
    ui: React.ReactElement,
    { route = '/' }: { route?: string } = {}
) {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('MainLayout', () => {
    it('renders children content', () => {
        renderWithRouter(
            <MainLayout>
                <div data-testid="child-content">Hello World</div>
            </MainLayout>
        )

        expect(screen.getByTestId('child-content')).toBeInTheDocument()
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders sidebar with navigation', () => {
        renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        // Should render the sidebar with navigation links
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Transactions')).toBeInTheDocument()
    })

    it('renders mobile header with menu button', () => {
        renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        // Should have mobile menu button
        expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
    })

    it('opens mobile sidebar when hamburger menu is clicked', async () => {
        const user = userEvent.setup()

        renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        const menuButton = screen.getByLabelText('Open menu')
        await user.click(menuButton)

        // Mobile sidebar should now be open (overlay visible)
        const overlay = document.querySelector('[aria-hidden="true"]')
        expect(overlay).toBeInTheDocument()
    })

    it('closes mobile sidebar when close button is clicked', async () => {
        const user = userEvent.setup()

        renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        // Open mobile menu
        const menuButton = screen.getByLabelText('Open menu')
        await user.click(menuButton)

        // Close mobile menu
        const closeButton = screen.getByLabelText('Close sidebar')
        await user.click(closeButton)

        // After closing, overlay should be removed (check for overlay div with bg-black class)
        const overlay = document.querySelector('div.fixed.bg-black\\/50')
        expect(overlay).toBeNull()
    })

    it('toggles sidebar collapsed state', async () => {
        const user = userEvent.setup()

        renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        // Initially expanded - CashPilot branding should be visible (both sidebar and mobile header)
        const brandingElements = screen.getAllByText('CashPilot')
        expect(brandingElements.length).toBeGreaterThanOrEqual(1)

        // Click collapse button
        const collapseButton = screen.getByLabelText('Collapse sidebar')
        await user.click(collapseButton)

        // After collapse, navigation labels should be hidden in sidebar
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    })

    it('renders main content area with proper margin', () => {
        const { container } = renderWithRouter(
            <MainLayout>
                <div>Content</div>
            </MainLayout>
        )

        const main = container.querySelector('main')
        expect(main).toBeInTheDocument()
        expect(main).toHaveClass('lg:ml-64')
    })
})
