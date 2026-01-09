import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

function renderWithRouter(
    ui: React.ReactElement,
    { route = '/' }: { route?: string } = {}
) {
    return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('Sidebar', () => {
    it('renders all 5 navigation links', () => {
        renderWithRouter(<Sidebar />)

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Transactions')).toBeInTheDocument()
        expect(screen.getByText('Suppliers')).toBeInTheDocument()
        expect(screen.getByText('Customers')).toBeInTheDocument()
        expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders CashPilot branding when not collapsed', () => {
        renderWithRouter(<Sidebar isCollapsed={false} />)

        expect(screen.getByText('CashPilot')).toBeInTheDocument()
    })

    it('hides branding when collapsed', () => {
        renderWithRouter(<Sidebar isCollapsed={true} />)

        expect(screen.queryByText('CashPilot')).not.toBeInTheDocument()
    })

    it('hides navigation labels when collapsed', () => {
        renderWithRouter(<Sidebar isCollapsed={true} />)

        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
        expect(screen.queryByText('Transactions')).not.toBeInTheDocument()
    })

    it('highlights active link based on current route', () => {
        renderWithRouter(<Sidebar />, { route: '/transactions' })

        const transactionsLink = screen.getByRole('link', { name: /transactions/i })
        expect(transactionsLink).toHaveClass('bg-white/20')
    })

    it('calls onToggle when toggle button is clicked', async () => {
        const user = userEvent.setup()
        const handleToggle = vi.fn()

        renderWithRouter(<Sidebar onToggle={handleToggle} />)

        const toggleButton = screen.getByLabelText(/collapse sidebar/i)
        await user.click(toggleButton)

        expect(handleToggle).toHaveBeenCalledTimes(1)
    })

    it('shows mobile overlay when isMobileOpen is true', () => {
        renderWithRouter(<Sidebar isMobileOpen={true} />)

        // Overlay should be in the document
        const overlay = document.querySelector('[aria-hidden="true"]')
        expect(overlay).toBeInTheDocument()
    })

    it('calls onMobileClose when overlay is clicked', async () => {
        const user = userEvent.setup()
        const handleMobileClose = vi.fn()

        renderWithRouter(
            <Sidebar isMobileOpen={true} onMobileClose={handleMobileClose} />
        )

        const overlay = document.querySelector('[aria-hidden="true"]')
        if (overlay) {
            await user.click(overlay)
        }

        expect(handleMobileClose).toHaveBeenCalledTimes(1)
    })

    it('calls onMobileClose when nav link is clicked', async () => {
        const user = userEvent.setup()
        const handleMobileClose = vi.fn()

        renderWithRouter(
            <Sidebar isMobileOpen={true} onMobileClose={handleMobileClose} />
        )

        const transactionsLink = screen.getByRole('link', { name: /transactions/i })
        await user.click(transactionsLink)

        expect(handleMobileClose).toHaveBeenCalledTimes(1)
    })

    it('has correct navigation hrefs', () => {
        renderWithRouter(<Sidebar />)

        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute(
            'href',
            '/'
        )
        expect(screen.getByRole('link', { name: /transactions/i })).toHaveAttribute(
            'href',
            '/transactions'
        )
        expect(screen.getByRole('link', { name: /suppliers/i })).toHaveAttribute(
            'href',
            '/suppliers'
        )
        expect(screen.getByRole('link', { name: /customers/i })).toHaveAttribute(
            'href',
            '/customers'
        )
        expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
            'href',
            '/settings'
        )
    })
})
