import { useState, useEffect, useCallback } from 'react'
import type { Applicant, ApplicationStatus, Job } from '../../types'
import { SearchIcon, EyeIcon, DownloadIcon, ChevronDownIcon } from '../../components/icons'
import { jobService } from '../../services/job.service'
import { applicationService, formatUIToBackendApplicationStatus } from '../../services/application.service'
import { getApiErrorMessage } from '../../lib/api'

const STATUS_CONFIG: Record<ApplicationStatus, { bg: string; text: string }> = {
  Applied: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  'Under Review': { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
  Shortlisted: { bg: 'bg-[#E6F7F5]', text: 'text-[#0F9D8A]' },
  Rejected: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  Selected: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]' },
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
        <h1 className="text-2xl font-bold text-[#172033]">Applicants</h1>
        <p className="text-sm text-[#667085] mt-0.5">{applicants.length} total applications across {recruiterJobs.length} jobs</p>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-48 max-w-72">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search by name or university..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>

        <select
          value={filterJob}
          onChange={e => setFilterJob(e.target.value)}
          className="border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] bg-white outline-none"
        >
          <option value="All">All jobs</option>
          {recruiterJobs.map(j => (
            <option key={j.id} value={j.title}>{j.title}</option>
          ))}
        </select>

        <div className="flex gap-1">
          {(['All', 'Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                filterStatus === s ? 'bg-[#163A5F] text-white' : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5">
        {/* Table */}
        <div className={`bg-white border border-[#E4E7EC] rounded-lg overflow-hidden ${selected ? 'flex-1' : 'w-full'}`}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Candidate</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">University</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">GPA</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Applied for</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#2563EB] border-t-transparent mr-2 align-middle" />
                    Loading applicants...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map(ap => {
                  const config = STATUS_CONFIG[ap.status] || STATUS_CONFIG.Applied
                  const nextOptions = NEXT_STATUS[ap.status] ?? []
                  return (
                    <tr key={ap.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${selected === ap.id ? 'bg-[#EFF6FF]' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {ap.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#172033]">{ap.name}</p>
                            <p className="text-xs text-[#667085]">{ap.major}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#667085]">{ap.university}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${parseFloat(ap.gpa) >= 3.8 ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#F2F4F7] text-[#667085]'}`}>
                          {ap.gpa}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#667085]">{ap.jobTitle}</td>
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
                            <div className="absolute top-full mt-1 left-0 bg-white border border-[#E4E7EC] rounded shadow-lg z-10 min-w-[140px]">
                              {nextOptions.map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(ap.id, s)}
                                  className={`w-full text-left text-xs px-3 py-2 hover:bg-[#F7F8FA] transition-colors ${STATUS_CONFIG[s].text}`}
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
                            className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
                            title="View profile"
                          >
                            <EyeIcon size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
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
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">No applicants match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Profile panel */}
        {selected && selectedApplicant && (
          <div className="w-72 bg-white border border-[#E4E7EC] rounded-lg p-5 shrink-0 space-y-4 self-start sticky top-24">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#163A5F] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                {selectedApplicant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="font-semibold text-[#172033]">{selectedApplicant.name}</h3>
              <p className="text-sm text-[#667085]">{selectedApplicant.major}</p>
              <p className="text-sm text-[#667085]">{selectedApplicant.university}</p>
            </div>

            <div className="space-y-2.5 border-t border-[#F2F4F7] pt-4">
              {[
                { label: 'GPA', value: selectedApplicant.gpa },
                { label: 'Experience', value: selectedApplicant.experience },
                { label: 'Applied for', value: selectedApplicant.jobTitle },
                { label: 'Applied on', value: selectedApplicant.appliedDate },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start">
                  <span className="text-xs text-[#667085]">{label}</span>
                  <span className="text-xs font-medium text-[#172033] text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#F2F4F7] pt-4">
              <p className="text-xs text-[#667085] mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplicant.skills.map(s => (
                  <span key={s} className="text-xs bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F2F4F7] pt-4 space-y-2">
              <button className="w-full text-sm font-medium bg-[#2563EB] text-white py-2 rounded hover:bg-[#1D4ED8] transition-colors">
                Schedule interview
              </button>
              <button className="w-full text-sm font-medium border border-[#E4E7EC] text-[#667085] py-2 rounded hover:bg-[#F7F8FA] transition-colors">
                Download resume
              </button>
              {NEXT_STATUS[selectedApplicant.status]?.includes('Rejected') && (
                <button onClick={() => updateStatus(selectedApplicant.id, 'Rejected')} className="w-full text-xs text-[#DC2626] hover:underline py-1">
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
