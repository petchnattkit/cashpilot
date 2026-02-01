import { BarChart3, FileText, Truck, User, Settings, Menu, X, Package } from 'lucide-react'
import { NavLink } from './NavLink'

interface SidebarProps {
    isCollapsed?: boolean
    onToggle?: () => void
    isMobileOpen?: boolean
    onMobileClose?: () => void
}

const navItems = [
    { to: '/', icon: BarChart3, label: 'Dashboard' },
    { to: '/transactions', icon: FileText, label: 'Transactions' },
    { to: '/inventory', icon: Package, label: 'Inventory' },
    { to: '/suppliers', icon: Truck, label: 'Suppliers' },
    { to: '/customers', icon: User, label: 'Customers' },
    { to: '/settings', icon: Settings, label: 'Settings' },
]

function Sidebar({
    isCollapsed = false,
    onToggle,
    isMobileOpen = false,
    onMobileClose,
}: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 h-screen bg-primary z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
            >
                {/* Header / Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold text-white">CashPilot</h1>
                    )}
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-white/10 text-white hidden lg:block"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    {/* Mobile close button */}
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-lg hover:bg-white/10 text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-4 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={isCollapsed}
                            onClick={onMobileClose}
                        />
                    ))}
                </nav>
            </aside>
        </>
    )
}

export { Sidebar }
export type { SidebarProps }
