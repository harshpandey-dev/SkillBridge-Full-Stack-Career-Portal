import { useState } from 'react'
import type { UserRole } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../lib/api'

const UserIconLocal = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const BuildingIconLocal = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
)

interface Props {
  onLogin: (email: string, role: UserRole) => void
  navigate: (page: string) => void
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

// Reusable dark-mode input class builder
const inputCls = (hasError?: boolean) =>
  `w-full border rounded px-3 py-2.5 text-sm bg-sb-surface text-sb-text placeholder-sb-text-3 outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${
    hasError ? 'border-[#DC2626]' : 'border-sb-border focus:border-[#2563EB] dark:focus:border-[#3B82F6]'
  }`

export default function Register({ onLogin, navigate }: Props) {
  const { registerStudent, registerRecruiter } = useAuth()
  const [role, setRole] = useState<'student' | 'recruiter'>('student')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    major: '',
    graduationYear: 'May 2026',
    company: '',
    position: '',
    companySize: '51–200 employees',
    terms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string | boolean) => {
    setForm(f => ({ ...f, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.includes('@')) e.email = 'Enter a valid email address'
    if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters'
    } else if (!PASSWORD_REGEX.test(form.password)) {
      e.password = 'Must include at least 1 uppercase, 1 lowercase letter, and 1 number'
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (step === 2 && role === 'student' && !form.university.trim()) e.university = 'University is required'
    if (step === 2 && role === 'recruiter' && !form.company.trim()) e.company = 'Company is required'
    if (step === 2 && !form.terms) e.terms = 'You must accept the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validate()) {
      setStep(2)
      setServerError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    try {
      setLoading(true)
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
      const email = form.email.trim().toLowerCase()

      let user
      if (role === 'student') {
        const yearNumber = parseInt(form.graduationYear.replace(/\D/g, ''), 10) || 2026
        user = await registerStudent({
          name: fullName,
          email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          university: form.university.trim(),
          major: form.major.trim() || 'General Studies',
          graduationYear: yearNumber,
        })
      } else {
        user = await registerRecruiter({
          name: fullName,
          email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          companyName: form.company.trim(),
          position: form.position.trim() || 'Recruiter',
          companySize: form.companySize,
        })
      }

      onLogin(user.email, user.role)
    } catch (err: unknown) {
      setServerError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-sb-bg flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-sb-text">Create your account</h1>
          <p className="text-sm text-sb-text-2 mt-1">Join SkillBridge and take the next step in your career</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { value: 'student', label: 'Student', desc: 'Looking for opportunities', Icon: UserIconLocal },
            { value: 'recruiter', label: 'Recruiter', desc: 'Hiring students & grads', Icon: BuildingIconLocal },
          ] as const).map(({ value, label, desc, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setRole(value)
                setErrors({})
                setServerError('')
              }}
              className={`flex flex-col items-start gap-1 p-4 rounded-lg border-2 text-left transition-all ${
                role === value
                  ? 'border-[#2563EB] bg-sb-brand-bg'
                  : 'border-sb-border bg-sb-surface hover:border-sb-border-2'
              }`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center mb-1 ${role === value ? 'bg-[#2563EB] text-white' : 'bg-sb-surface-2 text-sb-text-2'}`}>
                <Icon size={15} />
              </div>
              <span className={`text-sm font-semibold ${role === value ? 'text-[#2563EB] dark:text-[#3B82F6]' : 'text-sb-text'}`}>{label}</span>
              <span className="text-xs text-sb-text-2">{desc}</span>
            </button>
          ))}
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-[#2563EB] text-white' : 'bg-sb-surface-2 text-sb-text-2'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-[#2563EB] dark:text-[#3B82F6] font-medium' : 'text-sb-text-2'}`}>
                {s === 1 ? 'Account details' : 'Your information'}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ml-1 ${step > s ? 'bg-[#2563EB]' : 'bg-sb-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-sb-surface border border-sb-border rounded-lg p-6">
          {serverError && (
            <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-3 text-sm text-[#DC2626] dark:text-[#F87171] mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-sb-text mb-1.5">First name</label>
                    <input
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="Alex"
                      className={inputCls(!!errors.firstName)}
                    />
                    {errors.firstName && <p className="text-xs text-[#DC2626] mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-sb-text mb-1.5">Last name</label>
                    <input
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="Chen"
                      className={inputCls(!!errors.lastName)}
                    />
                    {errors.lastName && <p className="text-xs text-[#DC2626] mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-sb-text mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@university.edu"
                    className={inputCls(!!errors.email)}
                  />
                  {errors.email && <p className="text-xs text-[#DC2626] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-sb-text mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters (Uppercase, lowercase, number)"
                    className={inputCls(!!errors.password)}
                  />
                  {errors.password && <p className="text-xs text-[#DC2626] mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-sb-text mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className={inputCls(!!errors.confirmPassword)}
                  />
                  {errors.confirmPassword && <p className="text-xs text-[#DC2626] mt-1">{errors.confirmPassword}</p>}
                </div>
                <button type="submit" className="w-full bg-[#2563EB] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                {role === 'student' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">University / College</label>
                      <input
                        value={form.university}
                        onChange={e => set('university', e.target.value)}
                        placeholder="Stanford University"
                        className={inputCls(!!errors.university)}
                      />
                      {errors.university && <p className="text-xs text-[#DC2626] mt-1">{errors.university}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">Field of study</label>
                      <input
                        value={form.major}
                        onChange={e => set('major', e.target.value)}
                        placeholder="Computer Science"
                        className={inputCls()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">Expected graduation</label>
                      <select
                        value={form.graduationYear}
                        onChange={e => set('graduationYear', e.target.value)}
                        className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                      >
                        <option value="May 2025">May 2025</option>
                        <option value="December 2025">December 2025</option>
                        <option value="May 2026">May 2026</option>
                        <option value="December 2026">December 2026</option>
                        <option value="May 2027">May 2027</option>
                        <option value="December 2027">December 2027</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">Company name</label>
                      <input
                        value={form.company}
                        onChange={e => set('company', e.target.value)}
                        placeholder="Stripe, Inc."
                        className={inputCls(!!errors.company)}
                      />
                      {errors.company && <p className="text-xs text-[#DC2626] mt-1">{errors.company}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">Your role / position</label>
                      <input
                        value={form.position}
                        onChange={e => set('position', e.target.value)}
                        placeholder="Senior Technical Recruiter"
                        className={inputCls()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sb-text mb-1.5">Company size</label>
                      <select
                        value={form.companySize}
                        onChange={e => set('companySize', e.target.value)}
                        className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                      >
                        <option value="1–50 employees">1–50 employees</option>
                        <option value="51–200 employees">51–200 employees</option>
                        <option value="201–1,000 employees">201–1,000 employees</option>
                        <option value="1,001–10,000 employees">1,001–10,000 employees</option>
                        <option value="10,000+ employees">10,000+ employees</option>
                      </select>
                    </div>
                  </>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={e => set('terms', e.target.checked)}
                    className="w-4 h-4 rounded accent-[#2563EB] mt-0.5"
                  />
                  <span className="text-sm text-sb-text-2">
                    I agree to the <a href="#" className="text-[#2563EB] dark:text-[#3B82F6] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2563EB] dark:text-[#3B82F6] hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-[#DC2626]">{errors.terms}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-sb-border text-sb-text-2 py-2.5 rounded text-sm font-medium hover:bg-sb-surface-2 transition-colors">
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#2563EB] text-white py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors">
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-sb-text-2 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-[#2563EB] dark:text-[#3B82F6] font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  )
}
