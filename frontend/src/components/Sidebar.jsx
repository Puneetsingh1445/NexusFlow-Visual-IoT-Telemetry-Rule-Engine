import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Cpu,
  BarChart3,
  Zap,
  Bell,
  Settings,
  Radio,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/devices',   icon: Cpu,             label: 'Devices' },
  { path: '/analytics', icon: BarChart3,        label: 'Analytics' },
  { path: '/workflows', icon: Zap,              label: 'Workflows' },
  { path: '/alerts',    icon: Bell,             label: 'Alerts' },
  { path: '/settings',  icon: Settings,         label: 'Settings' },
]

export default function Sidebar({ open, onClose }) {
  const location = useLocation()

  return (
    <>
      {/* Overlay — mobile only */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-sidebar flex flex-col
          border-r border-outline/40
          transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-outline/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="text-title-md text-on-sidebar font-semibold tracking-tight">
              NexusFlow
            </span>
          </div>
          {/* Close on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-lg
                     transition-all duration-150 group
                     ${isActive
                       ? 'bg-primary/15 text-primary'
                       : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                     }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-outline/40">
          <p className="text-label-sm text-on-surface-variant">
            NexusFlow v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
