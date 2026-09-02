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
    <div className="min-h-[calc(100vh-64px)] bg-[#F7F8FA] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#172033]">Create your account</h1>
          <p className="text-sm text-[#667085] mt-1">Join SkillBridge and take the next step in your career</p>
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
                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                  : 'border-[#E4E7EC] bg-white hover:border-[#94A3B8]'
              }`}
            >
              <div className={`w-8 h-8 rounded flex items-center justify-center mb-1 ${role === value ? 'bg-[#2563EB] text-white' : 'bg-[#F2F4F7] text-[#667085]'}`}>
                <Icon size={15} />
              </div>
              <span className={`text-sm font-semibold ${role === value ? 'text-[#2563EB]' : 'text-[#172033]'}`}>{label}</span>
              <span className="text-xs text-[#667085]">{desc}</span>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-[#2563EB] text-white' : 'bg-[#E4E7EC] text-[#667085]'}`}>
                {s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-[#2563EB] font-medium' : 'text-[#667085]'}`}>
                {s === 1 ? 'Account details' : 'Your information'}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ml-1 ${step > s ? 'bg-[#2563EB]' : 'bg-[#E4E7EC]'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white border border-[#E4E7EC] rounded-lg p-6">
          {serverError && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-3 text-sm text-[#DC2626] mb-4">
              {serverError}
            </div>
          )}

          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext() } : handleSubmit}>
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1.5">First name</label>
                    <input
                      value={form.firstName}
                      onChange={e => set('firstName', e.target.value)}
                      placeholder="Alex"
                      className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${errors.firstName ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                    />
                    {errors.firstName && <p className="text-xs text-[#DC2626] mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#172033] mb-1.5">Last name</label>
                    <input
                      value={form.lastName}
                      onChange={e => set('lastName', e.target.value)}
                      placeholder="Chen"
                      className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${errors.lastName ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                    />
                    {errors.lastName && <p className="text-xs text-[#DC2626] mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="you@university.edu"
                    className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${errors.email ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                  />
                  {errors.email && <p className="text-xs text-[#DC2626] mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters (Uppercase, lowercase, number)"
                    className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${errors.password ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                  />
                  {errors.password && <p className="text-xs text-[#DC2626] mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#172033] mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-shadow ${errors.confirmPassword ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
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
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">University / College</label>
                      <input
                        value={form.university}
                        onChange={e => set('university', e.target.value)}
                        placeholder="Stanford University"
                        className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 ${errors.university ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                      />
                      {errors.university && <p className="text-xs text-[#DC2626] mt-1">{errors.university}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">Field of study</label>
                      <input
                        value={form.major}
                        onChange={e => set('major', e.target.value)}
                        placeholder="Computer Science"
                        className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">Expected graduation</label>
                      <select
                        value={form.graduationYear}
                        onChange={e => set('graduationYear', e.target.value)}
                        className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
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
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">Company name</label>
                      <input
                        value={form.company}
                        onChange={e => set('company', e.target.value)}
                        placeholder="Stripe, Inc."
                        className={`w-full border rounded px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]/10 ${errors.company ? 'border-[#DC2626]' : 'border-[#E4E7EC] focus:border-[#2563EB]'}`}
                      />
                      {errors.company && <p className="text-xs text-[#DC2626] mt-1">{errors.company}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">Your role / position</label>
                      <input
                        value={form.position}
                        onChange={e => set('position', e.target.value)}
                        placeholder="Senior Technical Recruiter"
                        className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#172033] mb-1.5">Company size</label>
                      <select
                        value={form.companySize}
                        onChange={e => set('companySize', e.target.value)}
                        className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
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
                  <span className="text-sm text-[#667085]">
                    I agree to the <a href="#" className="text-[#2563EB] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2563EB] hover:underline">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && <p className="text-xs text-[#DC2626]">{errors.terms}</p>}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-[#E4E7EC] text-[#667085] py-2.5 rounded text-sm font-medium hover:bg-[#F7F8FA] transition-colors">
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

        <p className="text-center text-sm text-[#667085] mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-[#2563EB] font-medium hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  )
}
