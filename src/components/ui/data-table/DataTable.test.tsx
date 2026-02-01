import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, Column } from './DataTable'

interface MockData {
    id: number
    name: string
    role: string
    score: number
    [key: string]: unknown
}

const mockData: MockData[] = [
    { id: 1, name: 'Alice', role: 'Admin', score: 95 },
    { id: 2, name: 'Bob', role: 'User', score: 80 },
    { id: 3, name: 'Charlie', role: 'User', score: 85 },
    { id: 4, name: 'David', role: 'Manager', score: 90 },
    { id: 5, name: 'Eve', role: 'User', score: 75 },
]

const columns: Column<MockData>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'role', header: 'Role' },
    { key: 'score', header: 'Score', sortable: true, align: 'right' },
]

describe('DataTable', () => {
    it('renders table headers and data correctly', () => {
        render(<DataTable data={mockData} columns={columns} />)

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Role')).toBeInTheDocument()
        expect(screen.getByText('Score')).toBeInTheDocument()

        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Eve')).toBeInTheDocument()
        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('95')).toBeInTheDocument()
    })

    it('handles searching', async () => {
        const user = userEvent.setup()
        render(<DataTable data={mockData} columns={columns} searchKeys={['name']} />)

        const searchInput = screen.getByPlaceholderText('Search...')
        await user.type(searchInput, 'Alice')

        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.queryByText('Bob')).not.toBeInTheDocument()

        // Search for non-existent
        await user.clear(searchInput)
        await user.type(searchInput, 'ZzZzZz')
        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('handles sorting', async () => {
        const user = userEvent.setup()
        render(<DataTable data={mockData} columns={columns} />)

        // Initial order (by ID effectively, as provided)
        const rowsBefore = screen.getAllByRole('row')
        expect(rowsBefore[1]).toHaveTextContent('Alice') // Header is row 0

        // Click Name header -> Ascending
        const nameHeader = screen.getByText('Name')
        await user.click(nameHeader)

        // Alice, Bob, Charlie, David, Eve
        const rowsAsc = screen.getAllByRole('row')
        expect(rowsAsc[1]).toHaveTextContent('Alice')
        expect(rowsAsc[5]).toHaveTextContent('Eve')

        // Click Name header -> Descending
        await user.click(nameHeader)

        // Eve, David, Charlie, Bob, Alice
        const rowsDesc = screen.getAllByRole('row')
        expect(rowsDesc[1]).toHaveTextContent('Eve')
        expect(rowsDesc[5]).toHaveTextContent('Alice')
    })

    it('handles pagination', async () => {
        const user = userEvent.setup()
        // 5 items, page size 2 -> 3 pages
        render(<DataTable data={mockData} columns={columns} pageSize={2} />)

        // Page 1: Alice, Bob
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument()
        expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()

        // Next page
        const nextButton = screen.getByLabelText('Next page')
        await user.click(nextButton)

        // Page 2: Charlie, David
        expect(screen.getByText('Charlie')).toBeInTheDocument()
        expect(screen.getByText('David')).toBeInTheDocument()
        expect(screen.queryByText('Alice')).not.toBeInTheDocument()
        expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    })

    it('renders empty state when no data provided', () => {
        render(<DataTable data={[]} columns={columns} emptyMessage="Nothing found" />)
        expect(screen.getByText('Nothing found')).toBeInTheDocument()
    })

    it('renders loading state', () => {
        render(<DataTable data={[]} columns={columns} isLoading={true} />)
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('calls onRowClick when row is clicked', async () => {
        const user = userEvent.setup()
        const handleClick = vi.fn()
        render(<DataTable data={mockData} columns={columns} onRowClick={handleClick} />)

        const aliceRow = screen.getByText('Alice').closest('tr')
        expect(aliceRow).toBeInTheDocument()
        if (aliceRow) await user.click(aliceRow)

        expect(handleClick).toHaveBeenCalledTimes(1)
        expect(handleClick).toHaveBeenCalledWith(mockData[0])
    })

    it('renders custom cell content', () => {
        const customColumns: Column<MockData>[] = [
            ...columns,
            {
                key: 'custom_score',
                header: 'Custom Score',
                render: (_: unknown, row: MockData) => <span data-testid="custom-score">Points: {row.score}</span>
            }
        ]

        render(<DataTable data={mockData.slice(0, 1)} columns={customColumns} />)
        expect(screen.getByTestId('custom-score')).toHaveTextContent('Points: 95')
    })
})
