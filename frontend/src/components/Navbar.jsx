import { Menu, Bell, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { alertService } from '../services/alertService'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await alertService.getAllAlerts()
        const unread = (data.data || []).filter((a) => !a.isRead).length
        setUnreadCount(unread)
      } catch {
        // silent — navbar badge is non-critical
      }
    }
    fetchUnread()
    // Refresh every 30 seconds
    const id = setInterval(fetchUnread, 30000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="h-16 bg-sidebar border-b border-outline/40 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left: hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-on-surface-variant hover:text-on-surface transition-colors p-1"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Page title area - empty on desktop (title is in page itself) */}
      <div className="hidden lg:block" />

      {/* Right: Alerts + Avatar */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Alert bell */}
        <button
          onClick={() => navigate('/alerts')}
          className="relative text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-lg hover:bg-surface-container"
          aria-label={`${unreadCount} unread alerts`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User avatar + name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <span className="text-label-md text-primary font-semibold">{initials}</span>
          </div>
          <span className="hidden sm:block text-label-lg text-on-surface">{user?.name}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="text-on-surface-variant hover:text-error transition-colors p-2 rounded-lg hover:bg-error/10"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
