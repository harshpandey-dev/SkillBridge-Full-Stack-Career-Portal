import { useState, useEffect } from 'react'
import { XIcon, CheckIcon } from '../../components/icons'
import {
  jobService,
  formatUIToBackendJobType,
  formatUIToBackendExperienceLevel,
  formatJobTypeToUI,
  formatExperienceLevelToUI,
} from '../../services/job.service'
import { getApiErrorMessage } from '../../lib/api'

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'AWS', 'Go', 'Java', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker', 'CI/CD', 'Figma']

interface Props {
  jobId?: string | null
  navigate: (page: string, id?: string) => void
}

export default function PostJob({ jobId, navigate }: Props) {
  const isEditMode = Boolean(jobId)
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript'])
  const [form, setForm] = useState({
    title: '',
    department: '',
    type: 'Full-time',
    location: '',
    remote: false,
    salary_min: '',
    salary_max: '',
    experience: 'Mid Level (2–5 years)',
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    deadline: '',
  })

  // Load existing job if in edit mode
  useEffect(() => {
    if (!jobId) return

    async function loadJobForEdit() {
      try {
        setInitialLoading(true)
        const raw = await jobService.getRawJobById(jobId!)
        setForm({
          title: raw.title || '',
          department: raw.department || '',
          type: formatJobTypeToUI(raw.jobType),
          location: raw.location || '',
          remote: Boolean(raw.isRemote),
          salary_min: raw.salaryMin ? String(raw.salaryMin) : '',
          salary_max: raw.salaryMax ? String(raw.salaryMax) : '',
          experience: `${formatExperienceLevelToUI(raw.experienceLevel)}`,
          description: raw.description || '',
          responsibilities: (raw.responsibilities || []).map(r => `• ${r}`).join('\n'),
          requirements: (raw.requirements || []).map(r => `• ${r}`).join('\n'),
          benefits: (raw.benefits || []).map(b => `• ${b}`).join('\n'),
          deadline: raw.applicationDeadline ? new Date(raw.applicationDeadline).toISOString().split('T')[0] : '',
        })
        if (raw.skills && raw.skills.length > 0) {
          setSkills(raw.skills.map(s => s.skill.name).filter(Boolean))
        }
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load job for editing.'))
      } finally {
        setInitialLoading(false)
      }
    }

    loadJobForEdit()
  }, [jobId])

  const set = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))
  const addSkill = (s: string) => { if (!skills.includes(s)) setSkills(prev => [...prev, s]) }
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s))

  const parseList = (text: string, fallback: string[] = ['Standard duties']) => {
    const items = text
      .split('\n')
      .map(line => line.replace(/^[\s•\-\*]+/, '').trim())
      .filter(Boolean)
    return items.length > 0 ? items : fallback
  }

  const buildPayload = (status: 'OPEN' | 'DRAFT' = 'OPEN') => {
    const salaryMin = form.salary_min ? parseInt(form.salary_min.replace(/\D/g, ''), 10) : null
    const salaryMax = form.salary_max ? parseInt(form.salary_max.replace(/\D/g, ''), 10) : null

    return {
      title: form.title.trim() || 'Software Engineer',
      department: form.department.trim() || null,
      description: form.description.trim() || 'Exciting opportunity to build impactful products.',
      responsibilities: parseList(form.responsibilities, ['Collaborate with engineering and product teams']),
      requirements: parseList(form.requirements, ['Demonstrated problem-solving skills']),
      benefits: parseList(form.benefits, []),
      jobType: formatUIToBackendJobType(form.type),
      experienceLevel: formatUIToBackendExperienceLevel(form.experience),
      location: form.location.trim() || (form.remote ? 'Remote' : 'United States'),
      isRemote: Boolean(form.remote),
      salaryMin: salaryMin && !isNaN(salaryMin) ? salaryMin : null,
      salaryMax: salaryMax && !isNaN(salaryMax) ? salaryMax : null,
      applicationDeadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status,
      skills,
    }
  }

  const handleSubmit = async (status: 'OPEN' | 'DRAFT' = 'OPEN') => {
    setError(null)
    if (!form.title.trim()) {
      setError('Please enter a job title.')
      setStep(1)
      return
    }
    if (!form.description.trim()) {
      setError('Please provide a job description.')
      setStep(2)
      return
    }

    try {
      setLoading(true)
      const payload = buildPayload(status)

      if (isEditMode && jobId) {
        await jobService.updateJob(jobId, payload)
      } else {
        await jobService.createJob(payload)
      }

      setSubmitted(true)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to save job listing. Please check the fields and try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-5 max-w-[860px] animate-pulse">
        <div className="h-8 bg-sb-surface-2 rounded w-1/3" />
        <div className="bg-sb-surface border border-sb-border rounded-lg p-6 space-y-4">
          <div className="h-10 bg-sb-surface-2 rounded" />
          <div className="h-10 bg-sb-surface-2 rounded" />
          <div className="h-32 bg-sb-surface-2 rounded" />
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-[#E6F7F5] dark:bg-[#042F2E] rounded-full flex items-center justify-center mx-auto">
          <CheckIcon size={28} className="text-[#0F9D8A]" />
        </div>
        <h2 className="text-2xl font-bold text-sb-text">
          {isEditMode ? 'Job updated successfully!' : 'Job posted successfully!'}
        </h2>
        <p className="text-sb-text-2">
          {isEditMode
            ? 'Your job listing has been updated and students will see the latest details.'
            : 'Your listing is live and accepting applications. Students matching your criteria have been notified.'}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => navigate('my-jobs')} className="bg-[#163A5F] dark:bg-[#1E3A5F] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#0F2A45] transition-colors">
            View all jobs
          </button>
          <button onClick={() => navigate('applicants')} className="border border-sb-border text-sb-text-2 px-5 py-2.5 rounded text-sm font-medium hover:bg-sb-surface-2 transition-colors">
            View applicants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-[860px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">
          {isEditMode ? 'Edit Job' : 'Post a Job'}
        </h1>
        <p className="text-sm text-sb-text-2 mt-0.5">
          {isEditMode ? 'Update the details for your job listing' : 'Fill in the details to publish your job listing'}
        </p>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-4 text-sm text-[#DC2626] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {/* Steps */}
      <div className="flex items-center gap-2">
        {['Job details', 'Description', 'Review & publish'].map((label, i) => {
          const s = i + 1
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-[#2563EB] text-white' : 'bg-sb-surface-2 text-sb-text-2'}`}>
                  {step > s ? <CheckIcon size={13} /> : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-sb-text' : 'text-sb-text-3'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-10 h-0.5 mx-1 ${step > s ? 'bg-[#2563EB]' : 'bg-sb-border'}`} />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="bg-sb-surface border border-sb-border rounded-lg p-6 space-y-5">
          <h2 className="text-base font-semibold text-sb-text pb-3 border-b border-sb-border">Job details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Job title *</label>
              <input
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Department</label>
              <input
                value={form.department}
                onChange={e => set('department', e.target.value)}
                placeholder="e.g. Engineering"
                className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Job type</label>
              <select
                value={form.type}
                onChange={e => set('type', e.target.value)}
                className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text outline-none focus:border-[#2563EB]"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Experience level</label>
              <select
                value={form.experience}
                onChange={e => set('experience', e.target.value)}
                className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text outline-none focus:border-[#2563EB]"
              >
                <option>Entry Level (0–2 years)</option>
                <option>Mid Level (2–5 years)</option>
                <option>Senior (5+ years)</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Location</label>
            <input
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. San Francisco, CA"
              className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB]"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={e => set('remote', e.target.checked)}
              className="w-4 h-4 rounded accent-[#2563EB]"
            />
            <span className="text-sm text-sb-text">This position allows remote work</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Compensation</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-sb-text-3">$</span>
                <input
                  value={form.salary_min}
                  onChange={e => set('salary_min', e.target.value)}
                  placeholder="130,000"
                  className="w-full border border-sb-border bg-sb-surface rounded pl-7 pr-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-sb-text-3">$</span>
                <input
                  value={form.salary_max}
                  onChange={e => set('salary_max', e.target.value)}
                  placeholder="175,000"
                  className="w-full border border-sb-border bg-sb-surface rounded pl-7 pr-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Required skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <div key={s} className="flex items-center gap-1.5 bg-sb-brand-bg text-[#2563EB] dark:text-[#3B82F6] px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="text-[#93C5FD] hover:text-[#2563EB]"><XIcon size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSkill(s)}
                  className="text-xs border border-dashed border-sb-border text-sb-text-2 px-2.5 py-1 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Application deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={e => set('deadline', e.target.value)}
              className="border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-sb-text"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (!form.title.trim()) {
                  setError('Please enter a job title.')
                  return
                }
                setError(null)
                setStep(2)
              }}
              className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Next: Description →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-sb-surface border border-sb-border rounded-lg p-6 space-y-5">
          <h2 className="text-base font-semibold text-sb-text pb-3 border-b border-sb-border">Job description</h2>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">About the role *</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the position, your team, and the impact this role will have..."
              className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB] resize-none"
            />
            <p className="text-xs text-sb-text-3 mt-1">{form.description.length}/2000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Key responsibilities</label>
            <textarea
              rows={5}
              value={form.responsibilities}
              onChange={e => set('responsibilities', e.target.value)}
              placeholder="• Build and maintain high-quality web applications&#10;• Collaborate with product and design teams&#10;• Contribute to technical architecture decisions"
              className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Requirements</label>
            <textarea
              rows={5}
              value={form.requirements}
              onChange={e => set('requirements', e.target.value)}
              placeholder="• 3+ years of experience in frontend development&#10;• Deep knowledge of React and TypeScript&#10;• Strong understanding of web performance"
              className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sb-text mb-1.5">Benefits & perks</label>
            <textarea
              rows={4}
              value={form.benefits}
              onChange={e => set('benefits', e.target.value)}
              placeholder="• Competitive equity package&#10;• Full health, dental & vision coverage&#10;• $5,000 annual learning budget"
              className="w-full border border-sb-border bg-sb-surface rounded px-3 py-2.5 text-sm text-sb-text placeholder-sb-text-3 outline-none focus:border-[#2563EB] resize-none"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="border border-sb-border text-sb-text-2 px-5 py-2.5 rounded text-sm font-medium hover:bg-sb-surface-2 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (!form.description.trim()) {
                  setError('Please provide a job description.')
                  return
                }
                setError(null)
                setStep(3)
              }}
              className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Review & publish →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-sb-surface border border-sb-border rounded-lg p-6">
            <h2 className="text-base font-semibold text-sb-text pb-3 border-b border-sb-border mb-4">Review your listing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Job title', value: form.title || 'Senior Frontend Engineer (placeholder)' },
                { label: 'Department', value: form.department || 'Engineering' },
                { label: 'Type', value: form.type },
                { label: 'Experience', value: form.experience || 'Mid Level (2–5 years)' },
                { label: 'Location', value: form.location || 'San Francisco, CA' },
                { label: 'Remote', value: form.remote ? 'Yes' : 'No' },
                { label: 'Salary range', value: form.salary_min && form.salary_max ? `$${form.salary_min} – $${form.salary_max}` : '$130,000 – $175,000' },
                { label: 'Deadline', value: form.deadline || 'Open' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-sb-text-2 mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-sb-text">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-sb-border">
              <p className="text-xs text-sb-text-2 mb-2">Required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="text-xs bg-sb-brand-bg text-[#2563EB] dark:text-[#3B82F6] px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-sb-brand-bg border border-[#BFDBFE] dark:border-[#1E3A5F] rounded-lg p-4">
            <p className="text-sm font-medium text-[#1D4ED8] dark:text-[#60A5FA]">Ready to publish?</p>
            <p className="text-xs text-sb-text-2 mt-1">
              Your listing will be visible to students immediately. You can edit or close it at any time from My Jobs.
            </p>
          </div>

          <div className="flex justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="border border-sb-border text-sb-text-2 px-5 py-2.5 rounded text-sm font-medium hover:bg-sb-surface-2 transition-colors"
            >
              ← Back to edit
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('DRAFT')}
                className="border border-sb-border text-sb-text-2 px-5 py-2.5 rounded text-sm font-medium hover:bg-sb-surface-2 disabled:opacity-60 transition-colors"
              >
                Save as draft
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit('OPEN')}
                className="bg-[#163A5F] dark:bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#0F2A45] dark:hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors"
              >
                {loading ? 'Publishing…' : isEditMode ? 'Update listing' : 'Publish listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
