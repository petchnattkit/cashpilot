import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'

interface Column<T> {
    key: keyof T
    header: string
    sortable?: boolean
    render?: (value: T[keyof T], row: T) => React.ReactNode
    align?: 'left' | 'center' | 'right'
}

interface DataTableProps<T extends Record<string, unknown>> {
    data: T[]
    columns: Column<T>[]
    searchPlaceholder?: string
    searchKeys?: (keyof T)[]
    pageSize?: number
    onRowClick?: (row: T) => void
    emptyMessage?: string
    isLoading?: boolean
}

type SortDirection = 'asc' | 'desc' | null

const ALIGNMENT_STYLES = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
} as const

const SORT_ICONS = {
    asc: <ChevronUp className="ml-1 w-4 h-4 inline" />,
    desc: <ChevronDown className="ml-1 w-4 h-4 inline" />,
    none: <span className="ml-1 text-neutral-300">↕</span>,
} as const

function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    searchPlaceholder = 'Search...',
    searchKeys,
    pageSize = 10,
    onRowClick,
    emptyMessage = 'No data available',
    isLoading = false,
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortKey, setSortKey] = useState<keyof T | null>(null)
    const [sortDirection, setSortDirection] = useState<SortDirection>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Filter data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery || !searchKeys || searchKeys.length === 0) {
            return data
        }

        const query = searchQuery.toLowerCase()
        return data.filter((row) =>
            searchKeys.some((key) => {
                const value = row[key]
                if (value == null) return false
                return String(value).toLowerCase().includes(query)
            })
        )
    }, [data, searchQuery, searchKeys])

    // Sort filtered data
    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) {
            return filteredData
        }

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortKey]
            const bValue = b[sortKey]

            if (aValue == null && bValue == null) return 0
            if (aValue == null) return 1
            if (bValue == null) return -1

            let comparison = 0
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue)
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue
            } else {
                comparison = String(aValue).localeCompare(String(bValue))
            }

            return sortDirection === 'desc' ? -comparison : comparison
        })
    }, [filteredData, sortKey, sortDirection])

    // Paginate sorted data
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return sortedData.slice(startIndex, startIndex + pageSize)
    }, [sortedData, currentPage, pageSize])

    // Reset to first page when search/sort changes
    const handleSearch = (value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }

    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            if (sortDirection === 'asc') {
                setSortDirection('desc')
            } else if (sortDirection === 'desc') {
                setSortKey(null)
                setSortDirection(null)
            } else {
                setSortDirection('asc')
            }
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
        setCurrentPage(1)
    }

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1))
    }

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
    }





    const isEmpty = paginatedData.length === 0 && !isLoading

    return (
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
            {/* Search Bar */}
            {searchKeys && searchKeys.length > 0 && (
                <div className="p-4 border-b border-neutral-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            aria-label="Search"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-neutral-50 text-neutral-600 text-sm font-bold">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={String(column.key)}
                                    className={`px-4 py-3 ${ALIGNMENT_STYLES[column.align ?? 'left']} ${column.sortable
                                        ? 'cursor-pointer hover:bg-neutral-100 select-none'
                                        : ''
                                        }`}
                                    onClick={() => column.sortable && handleSort(column.key)}
                                    aria-sort={
                                        sortKey === column.key
                                            ? sortDirection === 'asc'
                                                ? 'ascending'
                                                : 'descending'
                                            : 'none'
                                    }
                                >
                                    {column.header}
                                    {column.sortable && (sortKey === column.key && sortDirection ? SORT_ICONS[sortDirection] : SORT_ICONS.none)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-8 text-center text-neutral-400"
                                >
                                    Loading...
                                </td>
                            </tr>
                        ) : isEmpty ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-8 text-center text-neutral-400"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`border-b border-neutral-100 hover:bg-primary/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''
                                        }`}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={`px-4 py-3 text-sm ${ALIGNMENT_STYLES[
                                                column.align ?? 'left'
                                            ]}`}
                                        >
                                            {column.render
                                                ? column.render(row[column.key], row)
                                                : String(row[column.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center p-4 border-t border-neutral-100">
                    <span className="text-sm text-neutral-500">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Next page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export { DataTable }
export type { DataTableProps, Column }
