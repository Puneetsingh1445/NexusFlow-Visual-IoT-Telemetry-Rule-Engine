import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Radio, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(form.email.trim(), form.password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Invalid email or password.'
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
          <h2 className="text-title-lg text-on-surface mb-6">Sign in to your account</h2>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-error-container border border-error/30 rounded-lg px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
              <p className="text-body-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-outline/60 rounded-lg px-3 py-2.5 pr-10 text-body-md text-on-surface placeholder:text-on-surface-variant/50
                    focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-body-sm text-on-surface-variant mt-5">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-primary hover:text-primary-hover font-medium transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
