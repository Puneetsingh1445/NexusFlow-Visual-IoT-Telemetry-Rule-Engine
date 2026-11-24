import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { deviceService } from '../services/deviceService'
import { alertService } from '../services/alertService'
import { workflowService } from '../services/workflowService'
import { useAuth } from '../context/AuthContext'
import {
  Cpu, Bell, Zap, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  ArrowRight, Wifi, WifiOff,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colorMap = {
    primary:  'bg-primary/10 text-primary border-primary/20',
    success:  'bg-success/10 text-success border-success/20',
    warning:  'bg-warning/10 text-warning border-warning/20',
    error:    'bg-error/10 text-error border-error/20',
    secondary:'bg-secondary/10 text-secondary border-secondary/20',
  }
  return (
    <div className="bg-surface border border-outline/40 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant">{label}</p>
        <p className="text-headline-md text-on-surface font-semibold mt-0.5">{value}</p>
        {sub && <p className="text-body-sm text-on-surface-variant mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [devices, setDevices] = useState([])
  const [alerts, setAlerts] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, aRes, wRes] = await Promise.allSettled([
          deviceService.getDevices(),
          alertService.getAllAlerts(),
          workflowService.getWorkflows(),
        ])
        if (dRes.status === 'fulfilled') setDevices(dRes.value.data || [])
        if (aRes.status === 'fulfilled') setAlerts(aRes.value.data || [])
        if (wRes.status === 'fulfilled') setWorkflows(wRes.value.data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const onlineDevices = devices.filter((d) => d.status === 'online').length
  const offlineDevices = devices.length - onlineDevices
  const unreadAlerts = alerts.filter((a) => !a.isRead).length
  const activeWorkflows = workflows.filter((w) => w.isActive).length
  const recentAlerts = alerts.slice(0, 5)

  const severityColor = { low: 'text-info', medium: 'text-warning', high: 'text-error', critical: 'text-error' }
  const severityBg = { low: 'bg-info/10', medium: 'bg-warning/10', high: 'bg-error/10', critical: 'bg-error/10' }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-on-surface">
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Here&apos;s a live overview of your IoT infrastructure.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Cpu}           label="Total Devices"    value={devices.length}      sub={`${onlineDevices} online`}       color="primary"   />
        <StatCard icon={Wifi}          label="Online Devices"   value={onlineDevices}        sub={offlineDevices > 0 ? `${offlineDevices} offline` : 'All online'} color="success" />
        <StatCard icon={Bell}          label="Unread Alerts"    value={unreadAlerts}         sub={`${alerts.length} total`}        color={unreadAlerts > 0 ? 'error' : 'success'} />
        <StatCard icon={Zap}           label="Active Workflows" value={activeWorkflows}      sub={`${workflows.length} total`}     color="secondary" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <div className="bg-surface border border-outline/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-md text-on-surface">Recent Alerts</h2>
            <Link
              to="/alerts"
              className="text-label-md text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="text-body-md text-on-surface-variant">No alerts yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentAlerts.map((alert) => (
                <li
                  key={alert._id}
                  className={`flex items-start gap-3 p-3 rounded-lg border border-outline/20 ${!alert.isRead ? 'bg-surface-container' : ''}`}
                >
                  <span className={`mt-0.5 flex-shrink-0 px-2 py-0.5 rounded text-label-sm font-semibold ${severityBg[alert.severity]} ${severityColor[alert.severity]}`}>
                    {alert.severity}
                  </span>
                  <div className="min-w-0">
                    <p className="text-body-sm text-on-surface truncate">{alert.message}</p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Device: {alert.deviceId} · {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Device Status */}
        <div className="bg-surface border border-outline/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-title-md text-on-surface">Device Status</h2>
            <Link
              to="/devices"
              className="text-label-md text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
            >
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {devices.length === 0 ? (
            <div className="text-center py-8">
              <Cpu className="w-10 h-10 text-on-surface-variant mx-auto mb-2" />
              <p className="text-body-md text-on-surface-variant">No devices registered</p>
              <Link to="/devices" className="text-primary text-body-sm hover:underline">
                Register your first device →
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {devices.slice(0, 5).map((device) => (
                <li
                  key={device._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${device.status === 'online' ? 'bg-success' : 'bg-on-surface-variant'}`} />
                    <div className="min-w-0">
                      <p className="text-body-sm text-on-surface font-medium truncate">{device.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{device.deviceId} · {device.deviceType}</p>
                    </div>
                  </div>
                  <span className={`text-label-sm font-semibold flex-shrink-0 ${device.status === 'online' ? 'text-success' : 'text-on-surface-variant'}`}>
                    {device.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
