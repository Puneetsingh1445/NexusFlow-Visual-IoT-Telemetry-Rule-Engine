import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  User, Shield, Bell, Palette, LogOut,
  CheckCircle, Radio,
} from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [toast, setToast] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-headline-lg text-on-surface">Settings</h1>
        <p className="text-body-md text-on-surface-variant mt-0.5">Manage your account and application preferences.</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-4 py-3">
          <CheckCircle className="w-4 h-4 text-success" />
          <p className="text-body-sm text-on-success-container">{toast}</p>
        </div>
      )}

      {/* Profile card */}
      <section className="bg-surface border border-outline/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-title-md text-on-surface">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-headline-md text-primary font-bold">
              {user?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </span>
          </div>
          <div>
            <p className="text-title-md text-on-surface">{user?.name}</p>
            <p className="text-body-md text-on-surface-variant">{user?.email}</p>
            <p className="text-label-sm text-on-surface-variant mt-0.5">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Application info */}
      <section className="bg-surface border border-outline/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="text-title-md text-on-surface">Application</h2>
        </div>
        <div className="space-y-3">
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Backend" value="http://localhost:5000" />
          <InfoRow label="Frontend" value="http://localhost:5173" />
          <InfoRow label="Stack" value="React · Vite · Tailwind · Node.js · MongoDB" />
        </div>
      </section>

      {/* API info */}
      <section className="bg-surface border border-outline/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-title-md text-on-surface">API Endpoints</h2>
        </div>
        <div className="space-y-2 font-mono">
          {[
            ['POST',   '/api/auth/login'],
            ['POST',   '/api/auth/register'],
            ['GET',    '/api/auth/me'],
            ['GET',    '/api/devices'],
            ['POST',   '/api/devices'],
            ['GET',    '/api/telemetry/:deviceId'],
            ['POST',   '/api/telemetry'],
            ['GET',    '/api/workflows'],
            ['POST',   '/api/workflows'],
            ['PUT',    '/api/workflows/:id'],
            ['DELETE', '/api/workflows/:id'],
            ['GET',    '/api/alerts'],
            ['PATCH',  '/api/alerts/:id/read'],
            ['DELETE', '/api/alerts/:id'],
          ].map(([method, path]) => (
            <div key={path} className="flex items-center gap-3 text-mono-sm py-1 border-b border-outline/20 last:border-0">
              <span className={`flex-shrink-0 w-14 text-center text-label-sm font-bold rounded px-1.5 py-0.5 ${
                method === 'GET' ? 'bg-success/10 text-success'
                : method === 'POST' ? 'bg-primary/10 text-primary'
                : method === 'PUT' ? 'bg-warning/10 text-warning'
                : method === 'PATCH' ? 'bg-secondary/10 text-secondary'
                : 'bg-error/10 text-error'
              }`}>{method}</span>
              <span className="text-on-surface-variant">{path}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="bg-surface border border-outline/40 rounded-xl p-5">
        <h2 className="text-title-md text-on-surface mb-4">Account Actions</h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-error/10 hover:bg-error/20 text-error border border-error/30 px-4 py-2.5 rounded-lg text-label-lg font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </section>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline/20 last:border-0">
      <span className="text-label-md text-on-surface-variant">{label}</span>
      <span className="text-body-sm text-on-surface font-mono">{value}</span>
    </div>
  )
}
