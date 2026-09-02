import { useState } from 'react'
import { XIcon, CheckIcon } from '../../components/icons'

const SKILL_SUGGESTIONS = ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'AWS', 'Go', 'Java', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'Redis', 'Docker', 'CI/CD', 'Figma']

interface Props {
  navigate: (page: string) => void
}

export default function PostJob({ navigate }: Props) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript'])
  const [form, setForm] = useState({
    title: '', department: '', type: 'Full-time', location: '', remote: false,
    salary_min: '', salary_max: '', experience: '',
    description: '', responsibilities: '', requirements: '', benefits: '',
    deadline: '',
  })

  const set = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))
  const addSkill = (s: string) => { if (!skills.includes(s)) setSkills(prev => [...prev, s]) }
  const removeSkill = (s: string) => setSkills(prev => prev.filter(x => x !== s))

  const handleSubmit = () => {
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto pt-16 text-center space-y-4">
        <div className="w-16 h-16 bg-[#E6F7F5] rounded-full flex items-center justify-center mx-auto">
          <CheckIcon size={28} className="text-[#0F9D8A]" />
        </div>
        <h2 className="text-2xl font-bold text-[#172033]">Job posted successfully!</h2>
        <p className="text-[#667085]">Your listing is live and accepting applications. Students matching your criteria have been notified.</p>
        <div className="flex gap-3 justify-center pt-2">
          <button onClick={() => navigate('my-jobs')} className="bg-[#163A5F] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#0F2A45] transition-colors">
            View all jobs
          </button>
          <button onClick={() => navigate('applicants')} className="border border-[#E4E7EC] text-[#667085] px-5 py-2.5 rounded text-sm font-medium hover:bg-[#F7F8FA] transition-colors">
            View applicants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-[860px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Post a Job</h1>
        <p className="text-sm text-[#667085] mt-0.5">Fill in the details to publish your job listing</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {['Job details', 'Description', 'Review & publish'].map((label, i) => {
          const s = i + 1
          return (
            <div key={label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-[#2563EB] text-white' : 'bg-[#F2F4F7] text-[#667085]'}`}>
                  {step > s ? <CheckIcon size={13} /> : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-[#172033]' : 'text-[#94A3B8]'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-10 h-0.5 mx-1 ${step > s ? 'bg-[#2563EB]' : 'bg-[#E4E7EC]'}`} />}
            </div>
          )
        })}
      </div>

      {step === 1 && (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#172033] pb-3 border-b border-[#F2F4F7]">Job details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Job title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Frontend Engineer" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Department</label>
              <input value={form.department} onChange={e => set('department', e.target.value)} placeholder="e.g. Engineering" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Job type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB]">
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Experience level</label>
              <select value={form.experience} onChange={e => set('experience', e.target.value)} className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB]">
                <option>Entry Level (0–2 years)</option>
                <option>Mid Level (2–5 years)</option>
                <option>Senior (5+ years)</option>
                <option>Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. San Francisco, CA" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.remote} onChange={e => set('remote', e.target.checked)} className="w-4 h-4 rounded accent-[#2563EB]" />
            <span className="text-sm text-[#172033]">This position allows remote work</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Compensation</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#94A3B8]">$</span>
                <input value={form.salary_min} onChange={e => set('salary_min', e.target.value)} placeholder="130,000" className="w-full border border-[#E4E7EC] rounded pl-7 pr-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-[#94A3B8]">$</span>
                <input value={form.salary_max} onChange={e => set('salary_max', e.target.value)} placeholder="175,000" className="w-full border border-[#E4E7EC] rounded pl-7 pr-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Required skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <div key={s} className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-full text-sm font-medium">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-[#93C5FD] hover:text-[#2563EB]"><XIcon size={12} /></button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                <button key={s} onClick={() => addSkill(s)} className="text-xs border border-dashed border-[#E4E7EC] text-[#667085] px-2.5 py-1 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Application deadline</label>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] text-[#172033]" />
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(2)} className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
              Next: Description →
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#172033] pb-3 border-b border-[#F2F4F7]">Job description</h2>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">About the role *</label>
            <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the position, your team, and the impact this role will have..." className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
            <p className="text-xs text-[#94A3B8] mt-1">{form.description.length}/2000 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Key responsibilities</label>
            <textarea rows={5} value={form.responsibilities} onChange={e => set('responsibilities', e.target.value)} placeholder="• Build and maintain high-quality web applications&#10;• Collaborate with product and design teams&#10;• Contribute to technical architecture decisions" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Requirements</label>
            <textarea rows={5} value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="• 3+ years of experience in frontend development&#10;• Deep knowledge of React and TypeScript&#10;• Strong understanding of web performance" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#172033] mb-1.5">Benefits & perks</label>
            <textarea rows={4} value={form.benefits} onChange={e => set('benefits', e.target.value)} placeholder="• Competitive equity package&#10;• Full health, dental & vision coverage&#10;• $5,000 annual learning budget" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB] resize-none" />
          </div>

          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="border border-[#E4E7EC] text-[#667085] px-5 py-2.5 rounded text-sm font-medium hover:bg-[#F7F8FA] transition-colors">
              ← Back
            </button>
            <button onClick={() => setStep(3)} className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
              Review & publish →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-6">
            <h2 className="text-base font-semibold text-[#172033] pb-3 border-b border-[#F2F4F7] mb-4">Review your listing</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Job title', value: form.title || 'Senior Frontend Engineer (placeholder)' },
                { label: 'Department', value: form.department || 'Engineering' },
                { label: 'Type', value: form.type },
                { label: 'Experience', value: form.experience || 'Mid Level (2–5 years)' },
                { label: 'Location', value: form.location || 'San Francisco, CA' },
                { label: 'Remote', value: form.remote ? 'Yes' : 'No' },
                { label: 'Salary range', value: form.salary_min && form.salary_max ? `$${form.salary_min} – $${form.salary_max}` : '$130,000 – $175,000' },
                { label: 'Deadline', value: form.deadline || '2026-10-15' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-[#667085] mb-0.5">{label}</p>
                  <p className="text-sm font-medium text-[#172033]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#F2F4F7]">
              <p className="text-xs text-[#667085] mb-2">Required skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span key={s} className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4">
            <p className="text-sm font-medium text-[#1D4ED8]">Ready to publish?</p>
            <p className="text-xs text-[#667085] mt-1">Your listing will be visible to 50,000+ students immediately. You can edit or close it at any time from My Jobs.</p>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="border border-[#E4E7EC] text-[#667085] px-5 py-2.5 rounded text-sm font-medium hover:bg-[#F7F8FA] transition-colors">
              ← Back to edit
            </button>
            <div className="flex gap-3">
              <button className="border border-[#E4E7EC] text-[#667085] px-5 py-2.5 rounded text-sm font-medium hover:bg-[#F7F8FA] transition-colors">
                Save as draft
              </button>
              <button onClick={handleSubmit} className="bg-[#163A5F] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#0F2A45] transition-colors">
                Publish listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
