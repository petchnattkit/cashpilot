import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NotFoundPage } from './index'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

describe('NotFoundPage', () => {
    it('renders 404 message', () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByText(/page not found/i)).toBeInTheDocument()
        expect(
            screen.getByText(/the page you are looking for doesn't exist/i)
        ).toBeInTheDocument()
    })

    it('navigates to home when return button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        const button = screen.getByRole('button', { name: /return to dashboard/i })
        await user.click(button)

        expect(mockNavigate).toHaveBeenCalledWith('/')
    })
})
