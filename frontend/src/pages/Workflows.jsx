import { useState, useEffect } from 'react'
import { workflowService } from '../services/workflowService'
import { deviceService } from '../services/deviceService'
import {
  Zap, Plus, X, Loader2, AlertCircle, CheckCircle,
  Edit2, Trash2, ToggleLeft, ToggleRight, ChevronDown,
} from 'lucide-react'

const PARAMETERS = ['temperature', 'humidity', 'pressure']
const OPERATORS  = ['greater_than', 'less_than', 'equal_to']
const ACTIONS    = ['alert', 'webhook']
const OP_LABELS  = { greater_than: '>', less_than: '<', equal_to: '=' }

const INITIAL_FORM = {
  name: '', description: '', deviceId: '',
  condition: { parameter: 'temperature', operator: 'greater_than', value: '' },
  action: 'alert', webhookUrl: '', isActive: true,
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState([])
  const [devices, setDevices]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null) // workflow being edited
  const [form, setForm]           = useState(INITIAL_FORM)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError]         = useState('')
  const [toast, setToast]         = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadData = async () => {
    try {
      const [wRes, dRes] = await Promise.allSettled([
        workflowService.getWorkflows(),
        deviceService.getDevices(),
      ])
      if (wRes.status === 'fulfilled') setWorkflows(wRes.value.data || [])
      if (dRes.status === 'fulfilled') setDevices(dRes.value.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const openCreate = () => {
    setEditTarget(null)
    setForm(INITIAL_FORM)
    setError('')
    setShowForm(true)
  }

  const openEdit = (wf) => {
    setEditTarget(wf)
    setForm({
      name: wf.name,
      description: wf.description || '',
      deviceId: wf.deviceId,
      condition: { ...wf.condition },
      action: wf.action,
      webhookUrl: wf.webhookUrl || '',
      isActive: wf.isActive,
    })
    setError('')
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditTarget(null); setForm(INITIAL_FORM); setError('') }

  const setCondField = (k, v) =>
    setForm((prev) => ({ ...prev, condition: { ...prev.condition, [k]: v } }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.deviceId) { setError('Name and device are required.'); return }
    if (form.condition.value === '' || isNaN(Number(form.condition.value))) {
      setError('Condition value must be a number.'); return
    }
    if (form.action === 'webhook' && !form.webhookUrl.startsWith('https://')) {
      setError('Webhook URL must start with https://.'); return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      deviceId: form.deviceId,
      condition: { ...form.condition, value: Number(form.condition.value) },
      action: form.action,
      ...(form.action === 'webhook' ? { webhookUrl: form.webhookUrl } : {}),
      isActive: form.isActive,
    }

    setFormLoading(true); setError('')
    try {
      if (editTarget) {
        const { deviceId: _d, ...updatePayload } = payload
        const data = await workflowService.updateWorkflow(editTarget._id, updatePayload)
        setWorkflows((prev) => prev.map((w) => w._id === editTarget._id ? data.data : w))
        showToast('Workflow updated!')
      } else {
        const data = await workflowService.createWorkflow(payload)
        setWorkflows((prev) => [data.data, ...prev])
        showToast('Workflow created!')
      }
      closeForm()
    } catch (err) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Failed to save workflow.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workflow?')) return
    try {
      await workflowService.deleteWorkflow(id)
      setWorkflows((prev) => prev.filter((w) => w._id !== id))
      showToast('Workflow deleted.')
    } catch {
      showToast('Failed to delete workflow.')
    }
  }

  const handleToggle = async (wf) => {
    try {
      const data = await workflowService.updateWorkflow(wf._id, { isActive: !wf.isActive })
      setWorkflows((prev) => prev.map((w) => w._id === wf._id ? data.data : w))
    } catch {
      showToast('Failed to toggle workflow.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface">Workflows</h1>
          <p className="text-body-md text-on-surface-variant mt-0.5">Automate actions based on sensor conditions.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary text-label-lg font-semibold px-4 py-2.5 rounded-lg transition-all">
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-success" />
          <p className="text-body-sm text-on-success-container">{toast}</p>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-surface border border-outline/40 rounded-xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-outline/40">
              <h2 className="text-title-lg text-on-surface">{editTarget ? 'Edit Workflow' : 'New Workflow'}</h2>
              <button onClick={closeForm} className="text-on-surface-variant hover:text-on-surface transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-error-container border border-error/30 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                  <p className="text-body-sm text-on-error-container">{error}</p>
                </div>
              )}

              <WField label="Name *" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="High Temperature Alert" />
              <WField label="Description" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Optional description" />

              {/* Device */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Device *</label>
                {editTarget ? (
                  <div className="bg-surface-container border border-outline/40 rounded-lg px-3 py-2.5 text-body-md text-on-surface-variant">
                    {form.deviceId} <span className="text-label-sm">(cannot change after creation)</span>
                  </div>
                ) : (
                  <select value={form.deviceId} onChange={(e) => setForm((p) => ({ ...p, deviceId: e.target.value }))}
                    className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all">
                    <option value="">— Select a device —</option>
                    {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.name} ({d.deviceId})</option>)}
                  </select>
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={form.condition.parameter} onChange={(e) => setCondField('parameter', e.target.value)}
                    className="bg-surface-container border border-outline/60 rounded-lg px-2 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all">
                    {PARAMETERS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <select value={form.condition.operator} onChange={(e) => setCondField('operator', e.target.value)}
                    className="bg-surface-container border border-outline/60 rounded-lg px-2 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all">
                    {OPERATORS.map((op) => <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>)}
                  </select>
                  <input type="number" value={form.condition.value} onChange={(e) => setCondField('value', e.target.value)}
                    placeholder="e.g. 35"
                    className="bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all" />
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">Action</label>
                <div className="flex gap-2">
                  {ACTIONS.map((a) => (
                    <button key={a} type="button" onClick={() => setForm((p) => ({ ...p, action: a }))}
                      className={`flex-1 py-2.5 rounded-lg text-label-md font-semibold transition-all border capitalize ${form.action === a ? 'bg-primary/15 text-primary border-primary/40' : 'bg-surface-container text-on-surface-variant border-outline/60 hover:border-outline'}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {form.action === 'webhook' && (
                <WField label="Webhook URL (HTTPS)" value={form.webhookUrl} onChange={(v) => setForm((p) => ({ ...p, webhookUrl: v }))} placeholder="https://hooks.example.com/..." />
              )}

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                  className={`transition-colors ${form.isActive ? 'text-success' : 'text-on-surface-variant'}`}>
                  {form.isActive ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
                <span className="text-body-md text-on-surface">{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 border border-outline/60 text-on-surface-variant hover:text-on-surface py-2.5 rounded-lg text-label-lg transition-all">Cancel</button>
                <button type="submit" disabled={formLoading} className="flex-1 bg-primary hover:bg-primary-hover text-on-primary py-2.5 rounded-lg text-label-lg font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline/40 rounded-xl">
          <Zap className="w-12 h-12 text-on-surface-variant mx-auto mb-3" />
          <h3 className="text-title-md text-on-surface mb-1">No workflows yet</h3>
          <p className="text-body-md text-on-surface-variant mb-4">Create a workflow to automate actions when conditions are met.</p>
          <button onClick={openCreate} className="bg-primary hover:bg-primary-hover text-on-primary px-5 py-2.5 rounded-lg text-label-lg font-semibold transition-all">New Workflow</button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <div key={wf._id} className="bg-surface border border-outline/40 rounded-xl p-5 hover:border-outline/60 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${wf.isActive ? 'bg-success' : 'bg-on-surface-variant'}`} />
                  <div className="min-w-0">
                    <h3 className="text-title-md text-on-surface font-semibold truncate">{wf.name}</h3>
                    {wf.description && <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">{wf.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Chip label={`Device: ${wf.deviceId}`} />
                      <Chip label={`If ${wf.condition.parameter} ${OP_LABELS[wf.condition.operator]} ${wf.condition.value}`} />
                      <Chip label={`→ ${wf.action}`} accent />
                      <Chip label={wf.isActive ? 'Active' : 'Inactive'} color={wf.isActive ? 'success' : 'muted'} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleToggle(wf)} title={wf.isActive ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors ${wf.isActive ? 'text-success hover:bg-success/10' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                    {wf.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(wf)} className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(wf._id)} className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function WField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-label-md text-on-surface-variant mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/60 transition-all" />
    </div>
  )
}

function Chip({ label, accent, color }) {
  const cls = color === 'success' ? 'bg-success/10 text-success border-success/20'
    : color === 'muted' ? 'bg-surface-container text-on-surface-variant border-outline/30'
    : accent ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-surface-container text-on-surface-variant border-outline/30'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-label-sm border font-mono ${cls}`}>{label}</span>
  )
}
