import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface MainLayoutProps {
    children: React.ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Mobile header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center px-4 lg:hidden z-30">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="ml-4 text-xl font-bold text-white">CashPilot</h1>
            </header>

            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
            />

            {/* Main content */}
            <main
                className={`
          pt-16 lg:pt-0 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
          p-6
        `}
            >
                {children}
            </main>
        </div>
    )
}

export { MainLayout }
export type { MainLayoutProps }
