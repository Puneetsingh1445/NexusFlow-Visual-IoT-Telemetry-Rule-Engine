import { useState, useEffect, useCallback } from 'react'
import { alertService } from '../services/alertService'
import {
  Bell, Trash2, Eye, CheckCircle, AlertTriangle,
  AlertCircle, Info, RefreshCw, Loader2,
} from 'lucide-react'

const SEVERITY_CONFIG = {
  low:      { icon: Info,          cls: 'text-info border-info/20 bg-info/10',           label: 'Low'      },
  medium:   { icon: AlertTriangle, cls: 'text-warning border-warning/20 bg-warning/10',  label: 'Medium'   },
  high:     { icon: AlertCircle,   cls: 'text-error border-error/20 bg-error/10',         label: 'High'     },
  critical: { icon: AlertCircle,   cls: 'text-error border-error/20 bg-error/10',         label: 'Critical' },
}

export default function Alerts() {
  const [alerts, setAlerts]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]       = useState('all') // all | unread | read
  const [toast, setToast]         = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const data = await alertService.getAllAlerts()
      setAlerts(data.data || [])
    } catch {
      showToast('Failed to load alerts.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchAlerts() }, [fetchAlerts])

  const handleMarkRead = async (id) => {
    try {
      const data = await alertService.markAlertAsRead(id)
      setAlerts((prev) => prev.map((a) => a._id === id ? data.data : a))
    } catch {
      showToast('Failed to mark as read.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await alertService.deleteAlert(id)
      setAlerts((prev) => prev.filter((a) => a._id !== id))
      showToast('Alert deleted.')
    } catch {
      showToast('Failed to delete alert.')
    }
  }

  const handleMarkAllRead = async () => {
    const unread = alerts.filter((a) => !a.isRead)
    try {
      await Promise.all(unread.map((a) => alertService.markAlertAsRead(a._id)))
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })))
      showToast('All alerts marked as read.')
    } catch {
      showToast('Failed to mark all as read.')
    }
  }

  const filtered = filter === 'unread' ? alerts.filter((a) => !a.isRead)
    : filter === 'read' ? alerts.filter((a) => a.isRead)
    : alerts

  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface flex items-center gap-2">
            Alerts
            {unreadCount > 0 && (
              <span className="bg-error text-white text-label-sm font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">Workflow-triggered sensor alerts.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-label-md text-primary hover:text-primary-hover border border-primary/40 hover:bg-primary/10 px-3 py-2 rounded-lg transition-all">
              <CheckCircle className="w-4 h-4" /> Mark all read
            </button>
          )}
          <button onClick={() => fetchAlerts(true)} disabled={refreshing}
            className="flex items-center gap-1.5 bg-surface-container border border-outline/60 hover:bg-surface-container-high text-on-surface-variant px-3 py-2 rounded-lg text-label-md transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-success" />
          <p className="text-body-sm text-on-success-container">{toast}</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-surface-container rounded-lg w-fit">
        {[
          { key: 'all',    label: `All (${alerts.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'read',   label: 'Read' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-md text-label-md font-medium transition-all ${filter === key ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Alert list */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/40 rounded-xl">
          <Bell className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
          <h3 className="text-title-md text-on-surface mb-1">No alerts</h3>
          <p className="text-body-md text-on-surface-variant">
            {filter === 'unread' ? 'All alerts have been read.' : 'Alerts appear when workflows trigger.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.high
            const Icon = cfg.icon
            return (
              <div key={alert._id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${!alert.isRead ? 'bg-surface border-outline/40' : 'bg-surface/50 border-outline/20'}`}>
                <div className={`flex-shrink-0 p-2 rounded-lg border ${cfg.cls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-body-md ${!alert.isRead ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                        {alert.message}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="text-label-sm text-on-surface-variant">Device: {alert.deviceId}</span>
                        <span className="text-label-sm text-on-surface-variant">Workflow: {alert.workflowName}</span>
                        <span className="text-label-sm text-on-surface-variant">{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      {alert.sensorData && (
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {Object.entries(alert.sensorData).map(([k, v]) => (
                            <span key={k} className="font-mono text-label-sm bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant border border-outline/20">
                              {k}: {typeof v === 'number' ? v.toFixed(2) : v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!alert.isRead && (
                        <button onClick={() => handleMarkRead(alert._id)} title="Mark as read"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-success hover:bg-success/10 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(alert._id)} title="Delete"
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {!alert.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
