import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Radio, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/[0-9]/.test(form.password)) {
      setError('Password must contain at least one number.')
      return
    }
    if (!/[a-zA-Z]/.test(form.password)) {
      setError('Password must contain at least one letter.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await register(form.name.trim(), form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-headline-md text-on-surface">NexusFlow</h1>
            <p className="text-body-md text-on-surface-variant mt-0.5">
              IoT Monitoring &amp; Workflow Automation
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface border border-outline/40 rounded-xl p-6 shadow-xl">
          <h2 className="text-title-lg text-on-surface mb-6">Create your account</h2>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-error-container border border-error/30 rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
              <p className="text-body-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50
                  focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50
                  focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 chars, include a number"
                  className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 pr-10 text-body-md text-on-surface placeholder:text-on-surface-variant/50
                    focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5" htmlFor="confirm">
                Confirm password
              </label>
              <input
                id="confirm"
                name="confirm"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50
                  focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-on-primary font-semibold py-2.5 px-4 rounded-lg
                transition-all duration-150 flex items-center justify-center gap-2 mt-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-body-sm text-on-surface-variant mt-5">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
