import { NavLink as RouterNavLink, type NavLinkProps } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface NavLinkItemProps extends Omit<NavLinkProps, 'className'> {
  icon: LucideIcon
  label: string
  isCollapsed?: boolean
}

function NavLink({ icon: Icon, label, isCollapsed, ...props }: NavLinkItemProps) {
  return (
    <RouterNavLink
      {...props}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-neutral-300 hover:bg-white/10 transition-colors ${isActive
          ? 'bg-white/20 text-white border-r-2 border-accent'
          : ''
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="ml-3">{label}</span>}
          {isActive && <span className="sr-only">(current page)</span>}
        </>
      )}
    </RouterNavLink>
  )
}

export { NavLink }
export type { NavLinkItemProps }
