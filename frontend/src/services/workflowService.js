import api from './api'

export const workflowService = {
  // GET /api/workflows — Get all workflows for the logged-in user
  getWorkflows: async () => {
    const response = await api.get('/workflows')
    return response.data
  },

  // POST /api/workflows — Create a new workflow
  createWorkflow: async (workflowData) => {
    const response = await api.post('/workflows', workflowData)
    return response.data
  },

  // PUT /api/workflows/:id — Update a workflow (name, description, condition, action, webhookUrl, isActive)
  updateWorkflow: async (id, workflowData) => {
    const response = await api.put(`/workflows/${id}`, workflowData)
    return response.data
  },

  // DELETE /api/workflows/:id — Delete a workflow
  deleteWorkflow: async (id) => {
    const response = await api.delete(`/workflows/${id}`)
    return response.data
  },
}
