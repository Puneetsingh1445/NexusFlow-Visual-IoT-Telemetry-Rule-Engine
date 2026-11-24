import api from './api'

export const alertService = {
  // GET /api/alerts — Get all alerts for the logged-in user
  getAllAlerts: async () => {
    const response = await api.get('/alerts')
    return response.data
  },

  // GET /api/alerts/device/:deviceId — Get alerts for a specific device
  getDeviceAlerts: async (deviceId) => {
    const response = await api.get(`/alerts/device/${deviceId}`)
    return response.data
  },

  // PATCH /api/alerts/:id/read — Mark an alert as read
  markAlertAsRead: async (id) => {
    const response = await api.patch(`/alerts/${id}/read`)
    return response.data
  },

  // DELETE /api/alerts/:id — Delete an alert
  deleteAlert: async (id) => {
    const response = await api.delete(`/alerts/${id}`)
    return response.data
  },
}
