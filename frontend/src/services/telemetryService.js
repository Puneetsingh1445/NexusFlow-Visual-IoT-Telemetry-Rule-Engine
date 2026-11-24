import api from './api'

export const telemetryService = {
  // GET /api/telemetry/:deviceId — fetch readings for a specific device
  getDeviceTelemetry: async (deviceId) => {
    const response = await api.get(`/telemetry/${deviceId}`)
    return response.data
  },

  // POST /api/telemetry — submit new sensor reading
  createTelemetry: async (telemetryData) => {
    const response = await api.post('/telemetry', telemetryData)
    return response.data
  },
}
