import { useState } from 'react'
import type { UserRole } from '../../types'
import { ShieldIcon } from '../../components/icons'

interface Props {
  onLogin: (email: string, role: UserRole) => void
  navigate: (page: string) => void
}

const DEMO_ACCOUNTS: { label: string; email: string; role: UserRole; description: string }[] = [
  { label: 'Student', email: 'alex.chen@stanford.edu', role: 'student', description: 'Browse jobs, track applications, manage profile' },
  { label: 'Recruiter', email: 'jordan.lee@stripe.com', role: 'recruiter', description: 'Post jobs, review applicants, manage pipeline' },
  { label: 'Admin', email: 'sam.torres@skillbridge.io', role: 'admin', description: 'Platform management and analytics' },
]

export default function Login({ onLogin, navigate }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setTimeout(() => {
      const demo = DEMO_ACCOUNTS.find(d => d.email === email)
      if (demo && password === 'demo') {
        onLogin(email, demo.role)
      } else {
        setError('Invalid email or password. Use a demo account below.')
        setLoading(false)
      }
    }, 600)
  }

  const handleDemoLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    setLoading(true)
    setTimeout(() => onLogin(account.email, account.role), 400)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F8FA] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-[#163A5F] flex-col justify-between p-12">
        <div>
          <div className="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center mb-8">
            <span className="text-white font-bold text-xs">SB</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your career journey starts here
          </h2>
          <p className="text-[rgba(255,255,255,0.6)] text-base leading-relaxed">
            Access thousands of opportunities from top employers, track your applications, and develop the skills to land your dream role.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { value: '50,000+', label: 'Students on platform' },
            { value: '2,800+', label: 'Partner companies' },
            { value: '94%', label: 'Placement rate for active users' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-[rgba(255,255,255,0.55)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#172033]">Welcome back</h1>
            <p className="text-sm text-[#667085] mt-1">Sign in to your SkillBridge account</p>
          </div>

          {/* Demo accounts */}
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold text-[#2563EB] mb-3 flex items-center gap-1.5">
              <ShieldIcon size={13} /> Demo accounts — click to sign in instantly
            </p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoLogin(acc)}
                  className="w-full flex items-start gap-3 text-left bg-white border border-[#BFDBFE] rounded p-3 hover:border-[#2563EB] hover:shadow-sm transition-all"
                >
                  <div className="w-7 h-7 rounded bg-[#163A5F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {acc.label[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#172033]">{acc.label}</p>
                    <p className="text-xs text-[#667085]">{acc.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#E4E7EC]" />
            <span className="text-xs text-[#667085]">or sign in with credentials</span>
            <div className="flex-1 h-px bg-[#E4E7EC]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-3 text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#172033]">Password</label>
                <button type="button" className="text-xs text-[#2563EB] hover:underline">Forgot password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] placeholder-[#94A3B8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="w-4 h-4 rounded accent-[#2563EB]"
              />
              <label htmlFor="remember" className="text-sm text-[#667085]">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#667085] mt-6">
            Don&apos;t have an account?{' '}
            <button onClick={() => navigate('register')} className="text-[#2563EB] font-medium hover:underline">
              Sign up free
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
