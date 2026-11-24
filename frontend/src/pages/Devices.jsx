import { useState, useEffect } from 'react'
import { deviceService } from '../services/deviceService'
import {
  Cpu, Plus, X, Loader2, AlertCircle, CheckCircle,
  Wifi, WifiOff, MapPin, Tag, Clock,
} from 'lucide-react'

const DEVICE_TYPES = ['temperature', 'humidity', 'pressure', 'other']

const INITIAL_FORM = {
  name: '', deviceId: '', deviceType: 'temperature', location: '',
}

function DeviceTypeIcon({ type }) {
  const icons = {
    temperature: '🌡️',
    humidity: '💧',
    pressure: '🔵',
    other: '📡',
  }
  return <span className="text-sm">{icons[type] || '📡'}</span>
}

export default function Devices() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDevices = async () => {
    try {
      const data = await deviceService.getDevices()
      setDevices(data.data || [])
    } catch {
      setError('Failed to load devices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDevices() }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.deviceId.trim()) {
      setError('Name and Device ID are required.')
      return
    }
    setFormLoading(true)
    setError('')
    try {
      const data = await deviceService.createDevice({
        name: form.name.trim(),
        deviceId: form.deviceId.trim(),
        deviceType: form.deviceType,
        location: form.location.trim() || 'Unknown',
      })
      setDevices((prev) => [data.data, ...prev])
      setForm(INITIAL_FORM)
      setShowForm(false)
      setSuccess('Device registered successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to register device.'
      )
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Devices</h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            Manage and monitor your registered IoT devices.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setError('') }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary text-label-lg font-semibold px-4 py-2.5 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-success" />
          <p className="text-body-sm text-on-success-container">{success}</p>
        </div>
      )}

      {/* Add Device modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-surface border border-outline/40 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-outline/40">
              <h2 className="text-title-lg text-on-surface">Register New Device</h2>
              <button onClick={() => { setShowForm(false); setError(''); setForm(INITIAL_FORM) }} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-error-container border border-error/30 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                  <p className="text-body-sm text-on-error-container">{error}</p>
                </div>
              )}
              <Field label="Device Name" name="name" value={form.name} onChange={handleChange} placeholder="Living Room Sensor" required />
              <Field label="Device ID" name="deviceId" value={form.deviceId} onChange={handleChange} placeholder="device-001" required hint="Unique identifier (e.g. device-001)" />
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Device Type</label>
                <select
                  name="deviceType"
                  value={form.deviceType}
                  onChange={handleChange}
                  className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
                >
                  {DEVICE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <Field label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Living Room (optional)" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(INITIAL_FORM) }} className="flex-1 border border-outline/60 text-on-surface-variant hover:text-on-surface py-2.5 rounded-lg text-label-lg transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-label-lg font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Registering…</> : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/40 rounded-xl">
          <Cpu className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
          <h3 className="text-title-md text-on-surface mb-1">No devices yet</h3>
          <p className="text-body-md text-on-surface-variant mb-4">Register your first IoT device to get started.</p>
          <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-hover text-on-primary px-5 py-2.5 rounded-lg text-label-lg font-semibold transition-all">
            Add Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device._id} device={device} />
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, name, value, onChange, placeholder, required, hint }) {
  return (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-1.5" htmlFor={name}>
        {label}{required && <span className="text-error ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50
          focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
      />
      {hint && <p className="text-label-sm text-on-surface-variant mt-1">{hint}</p>}
    </div>
  )
}

function DeviceCard({ device }) {
  const isOnline = device.status === 'online'
  return (
    <div className="bg-surface border border-outline/40 rounded-xl p-5 hover:border-outline/60 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-lg">
            <DeviceTypeIcon type={device.deviceType} />
          </div>
          <div>
            <h3 className="text-title-md text-on-surface font-semibold">{device.name}</h3>
            <p className="text-label-sm text-on-surface-variant font-mono">{device.deviceId}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-label-sm font-semibold px-2.5 py-1 rounded-full ${isOnline ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-container-high text-on-surface-variant border border-outline/30'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {device.status}
        </span>
      </div>
      <div className="space-y-1.5 mt-4">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <Tag className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="capitalize">{device.deviceType}</span>
        </div>
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{device.location || 'Unknown'}</span>
        </div>
        {device.lastSeen && (
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Last seen {new Date(device.lastSeen).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
