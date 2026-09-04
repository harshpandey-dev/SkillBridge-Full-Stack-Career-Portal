import { useState, useEffect, useCallback } from 'react'
import type { Applicant, ApplicationStatus, Job } from '../../types'
import { SearchIcon, EyeIcon, DownloadIcon, ChevronDownIcon } from '../../components/icons'
import { jobService } from '../../services/job.service'
import { applicationService, formatUIToBackendApplicationStatus } from '../../services/application.service'
import { getApiErrorMessage } from '../../lib/api'

const STATUS_CONFIG: Record<ApplicationStatus, { bg: string; text: string }> = {
  Applied: { bg: 'bg-sb-brand-bg', text: 'text-[#2563EB] dark:text-[#3B82F6]' },
  'Under Review': { bg: 'bg-[#FFFBEB] dark:bg-[#2D1B00]', text: 'text-[#D97706]' },
  Shortlisted: { bg: 'bg-[#E6F7F5] dark:bg-[#042F2E]', text: 'text-[#0F9D8A]' },
  Rejected: { bg: 'bg-[#FEF2F2] dark:bg-[#3B0A0A]', text: 'text-[#DC2626] dark:text-[#F87171]' },
  Selected: { bg: 'bg-[#ECFDF5] dark:bg-[#052E16]', text: 'text-[#059669]' },
}

const NEXT_STATUS: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  Applied: ['Under Review', 'Rejected'],
  'Under Review': ['Shortlisted', 'Rejected'],
  Shortlisted: ['Selected', 'Rejected'],
}

interface Props {
  navigate?: (page: string) => void
}

export default function Applicants({ navigate: _navigate }: Props) {
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All')
  const [filterJob, setFilterJob] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const jobsResult = await jobService.getMyJobs({ limit: 50 })
      setRecruiterJobs(jobsResult.jobs)

      if (jobsResult.jobs.length === 0) {
        setApplicants([])
        return
      }

      const backendStatus = filterStatus !== 'All' ? formatUIToBackendApplicationStatus(filterStatus) : undefined

      if (filterJob !== 'All') {
        const targetJob = jobsResult.jobs.find(j => j.title === filterJob || j.id === filterJob)
        if (targetJob) {
          const appResult = await applicationService.getJobApplicants(targetJob.id, {
            search: search.trim() || undefined,
            status: backendStatus,
            limit: 50,
          })
          setApplicants(appResult.items.map(a => ({ ...a, jobTitle: targetJob.title })))
        }
      } else {
        const promises = jobsResult.jobs.map(j =>
          applicationService.getJobApplicants(j.id, {
            search: search.trim() || undefined,
            status: backendStatus,
            limit: 50,
          }).catch(() => ({ items: [] }))
        )
        const results = await Promise.all(promises)
        const combined = results.flatMap((r, i) =>
          r.items.map(a => ({ ...a, jobTitle: jobsResult.jobs[i]?.title || a.jobTitle }))
        )
        setApplicants(combined)
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load applicants.'))
      setApplicants([])
    } finally {
      setLoading(false)
    }
  }, [filterJob, filterStatus, search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    try {
      setUpdatingId(id)
      await applicationService.updateApplicationStatus(id, status)
      setApplicants(prev => prev.map(a => (a.id === id ? { ...a, status } : a)))
      setStatusDropdown(null)
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, 'Failed to update application status.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = applicants.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.university.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    const matchJob = filterJob === 'All' || a.jobTitle === filterJob
    return matchSearch && matchStatus && matchJob
  })

  const selectedApplicant = applicants.find(a => a.id === selected)

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">Applicants</h1>
        <p className="text-sm text-sb-text-2 mt-0.5">{applicants.length} total applications across {recruiterJobs.length} jobs</p>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-4 text-sm text-[#DC2626] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-sb-surface border border-sb-border rounded px-3 py-2.5 flex-1 min-w-48 max-w-72">
          <SearchIcon size={15} className="text-sb-text-2" />
          <input
            type="text"
            placeholder="Search by name or university..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-sb-text placeholder-sb-text-3 outline-none bg-transparent"
          />
        </div>

        <select
          value={filterJob}
          onChange={e => setFilterJob(e.target.value)}
          className="border border-sb-border rounded px-3 py-2.5 text-sm text-sb-text bg-sb-surface outline-none"
        >
          <option value="All">All jobs</option>
          {recruiterJobs.map(j => (
            <option key={j.id} value={j.title}>{j.title}</option>
          ))}
        </select>

        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {(['All', 'Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filterStatus === s ? 'bg-[#163A5F] dark:bg-[#1E3A5F] text-white' : 'bg-sb-surface border border-sb-border text-sb-text-2 hover:border-sb-border-2'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Table */}
        <div className={`bg-sb-surface border border-sb-border rounded-lg overflow-x-auto ${selected ? 'flex-1' : 'w-full'}`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-sb-border bg-sb-surface-2">
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Candidate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">University</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">GPA</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Applied for</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-sb-text-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#2563EB] border-t-transparent mr-2 align-middle" />
                    Loading applicants...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(ap => {
                  const config = STATUS_CONFIG[ap.status] || STATUS_CONFIG.Applied
                  const nextOptions = NEXT_STATUS[ap.status] ?? []
                  return (
                    <tr key={ap.id} className={`border-b border-sb-border hover:bg-sb-surface-2 transition-colors ${selected === ap.id ? 'bg-sb-brand-bg' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {ap.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sb-text">{ap.name}</p>
                            <p className="text-xs text-sb-text-2">{ap.major}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{ap.university}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${parseFloat(ap.gpa) >= 3.8 ? 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]' : 'bg-sb-surface-2 text-sb-text-2'}`}>
                          {ap.gpa}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{ap.jobTitle}</td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <button
                            disabled={updatingId === ap.id}
                            onClick={() => setStatusDropdown(statusDropdown === ap.id ? null : ap.id)}
                            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}
                          >
                            {updatingId === ap.id ? 'Updating…' : ap.status} {nextOptions.length > 0 && <ChevronDownIcon size={11} />}
                          </button>
                          {statusDropdown === ap.id && nextOptions.length > 0 && (
                            <div className="absolute top-full mt-1 left-0 bg-sb-surface border border-sb-border rounded shadow-lg z-10 min-w-[140px]">
                              {nextOptions.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(ap.id, s)}
                                  className={`w-full text-left text-xs px-3 py-2 hover:bg-sb-surface-2 transition-colors ${STATUS_CONFIG[s].text}`}
                                >
                                  Move to: {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelected(selected === ap.id ? null : ap.id)}
                            className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                            title="View profile"
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                            title="Download resume"
                          >
                            <DownloadIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-sb-text-2">No applicants match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Profile panel */}
        {selected && selectedApplicant && (
          <div className="w-full lg:w-72 bg-sb-surface border border-sb-border rounded-lg p-5 shrink-0 space-y-4 self-start lg:sticky lg:top-24">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#163A5F] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                {selectedApplicant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold text-sb-text">{selectedApplicant.name}</h3>
              <p className="text-sm text-sb-text-2">{selectedApplicant.major}</p>
              <p className="text-sm text-sb-text-2">{selectedApplicant.university}</p>
            </div>

            <div className="space-y-2.5 border-t border-sb-border pt-4">
              {[
                { label: 'GPA', value: selectedApplicant.gpa },
                { label: 'Experience', value: selectedApplicant.experience },
                { label: 'Applied for', value: selectedApplicant.jobTitle },
                { label: 'Applied on', value: selectedApplicant.appliedDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start">
                  <span className="text-xs text-sb-text-2">{label}</span>
                  <span className="text-xs font-medium text-sb-text text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-sb-border pt-4">
              <p className="text-xs text-sb-text-2 mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplicant.skills.map(s => (
                  <span key={s} className="text-xs bg-sb-surface-2 text-sb-text-2 px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-sb-border pt-4 space-y-2">
              <button className="w-full text-sm font-medium bg-[#2563EB] text-white py-2 rounded hover:bg-[#1D4ED8] transition-colors">
                Schedule interview
              </button>
              <button className="w-full text-sm font-medium border border-sb-border text-sb-text-2 py-2 rounded hover:bg-sb-surface-2 transition-colors">
                Download resume
              </button>
              {NEXT_STATUS[selectedApplicant.status]?.includes('Rejected') && (
                <button onClick={() => updateStatus(selectedApplicant.id, 'Rejected')} className="w-full text-xs text-[#DC2626] dark:text-[#F87171] hover:underline py-1">
                  Reject candidate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
