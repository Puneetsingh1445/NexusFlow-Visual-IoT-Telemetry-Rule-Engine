import api from './api'

export const deviceService = {
  // GET /api/devices — all devices for logged-in user
  getDevices: async () => {
    const response = await api.get('/devices')
    return response.data
  },

  // POST /api/devices — register a new device
  createDevice: async (deviceData) => {
    const response = await api.post('/devices', deviceData)
    return response.data
  },
}
