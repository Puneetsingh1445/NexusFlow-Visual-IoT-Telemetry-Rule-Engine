import { useState, useEffect } from 'react'
import { deviceService } from '../services/deviceService'
import { telemetryService } from '../services/telemetryService'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { BarChart3, Cpu, RefreshCw, Loader2 } from 'lucide-react'

const SENSOR_CONFIG = {
  temperature: { color: '#F59E0B', label: 'Temperature (°C)', unit: '°C' },
  humidity:    { color: '#06B6D4', label: 'Humidity (%)',     unit: '%' },
  pressure:    { color: '#7C3AED', label: 'Pressure (hPa)',   unit: ' hPa' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-surface-container border border-outline/40 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-label-sm text-on-surface-variant mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} className="text-body-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [telemetry, setTelemetry] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const [loadingTelemetry, setLoadingTelemetry] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const data = await deviceService.getDevices()
        const devs = data.data || []
        setDevices(devs)
        if (devs.length > 0) setSelectedDevice(devs[0].deviceId)
      } catch {
        setError('Failed to load devices.')
      } finally {
        setLoadingDevices(false)
      }
    }
    fetchDevices()
  }, [])

  useEffect(() => {
    if (!selectedDevice) return
    fetchTelemetry()
  }, [selectedDevice])

  const fetchTelemetry = async () => {
    if (!selectedDevice) return
    setLoadingTelemetry(true)
    setError('')
    try {
      const data = await telemetryService.getDeviceTelemetry(selectedDevice)
      const raw = data.data || []
      // Normalize to chart-friendly format, most recent last
      const chartData = [...raw]
        .reverse()
        .slice(-50)
        .map((t) => ({
          time: new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: t.temperature ?? null,
          humidity: t.humidity ?? null,
          pressure: t.pressure ?? null,
        }))
      setTelemetry(chartData)
    } catch {
      setError('Failed to load telemetry for this device.')
      setTelemetry([])
    } finally {
      setLoadingTelemetry(false)
    }
  }

  // Compute stats
  const stats = {}
  if (telemetry.length > 0) {
    for (const key of ['temperature', 'humidity', 'pressure']) {
      const vals = telemetry.map((t) => t[key]).filter((v) => v !== null && v !== undefined)
      if (vals.length > 0) {
        stats[key] = {
          avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
          min: Math.min(...vals).toFixed(1),
          max: Math.max(...vals).toFixed(1),
          latest: vals[vals.length - 1],
        }
      }
    }
  }

  const deviceObj = devices.find((d) => d.deviceId === selectedDevice)
  const hasData = telemetry.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-headline-lg text-on-surface">Analytics</h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">
            Sensor telemetry charts and statistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Device selector */}
          {!loadingDevices && devices.length > 0 && (
            <select
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="bg-surface-container border border-outline/60 rounded-lg px-3 py-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.name} ({d.deviceId})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={fetchTelemetry}
            disabled={loadingTelemetry || !selectedDevice}
            className="flex items-center gap-1.5 bg-surface-container border border-outline/60 hover:bg-surface-container-high text-on-surface-variant px-3 py-2 rounded-lg text-label-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingTelemetry ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3">
          <p className="text-body-sm text-on-error-container">{error}</p>
        </div>
      )}

      {loadingDevices ? (
        <div className="h-64 skeleton rounded-xl" />
      ) : devices.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/40 rounded-xl">
          <Cpu className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
          <h3 className="text-title-md text-on-surface mb-1">No devices registered</h3>
          <p className="text-body-md text-on-surface-variant">Register a device first to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(stats).map(([key, s]) => {
              const cfg = SENSOR_CONFIG[key]
              if (!cfg) return null
              return (
                <div key={key} className="bg-surface border border-outline/40 rounded-xl p-4">
                  <p className="text-label-md text-on-surface-variant">{cfg.label}</p>
                  <p className="text-headline-md font-semibold mt-1" style={{ color: cfg.color }}>
                    {s.latest}{cfg.unit}
                  </p>
                  <div className="flex gap-3 mt-2 text-label-sm text-on-surface-variant">
                    <span>Min: {s.min}</span>
                    <span>Avg: {s.avg}</span>
                    <span>Max: {s.max}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {loadingTelemetry ? (
            <div className="h-64 skeleton rounded-xl" />
          ) : !hasData ? (
            <div className="text-center py-16 bg-surface border border-outline/40 rounded-xl">
              <BarChart3 className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
              <h3 className="text-title-md text-on-surface mb-1">No telemetry data</h3>
              <p className="text-body-md text-on-surface-variant">
                {deviceObj?.name} hasn&apos;t sent any sensor readings yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Temperature */}
              {telemetry.some((t) => t.temperature !== null) && (
                <ChartCard
                  title="Temperature"
                  color={SENSOR_CONFIG.temperature.color}
                  dataKey="temperature"
                  unit="°C"
                  data={telemetry}
                />
              )}
              {/* Humidity */}
              {telemetry.some((t) => t.humidity !== null) && (
                <ChartCard
                  title="Humidity"
                  color={SENSOR_CONFIG.humidity.color}
                  dataKey="humidity"
                  unit="%"
                  data={telemetry}
                />
              )}
              {/* Pressure */}
              {telemetry.some((t) => t.pressure !== null) && (
                <ChartCard
                  title="Pressure"
                  color={SENSOR_CONFIG.pressure.color}
                  dataKey="pressure"
                  unit=" hPa"
                  data={telemetry}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ChartCard({ title, color, dataKey, unit, data }) {
  return (
    <div className="bg-surface border border-outline/40 rounded-xl p-5">
      <h3 className="text-title-md text-on-surface mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(v) => `${v}${unit}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={false}
            connectNulls
            name={title}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
