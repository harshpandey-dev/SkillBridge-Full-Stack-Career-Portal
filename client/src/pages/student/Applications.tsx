import { useState, useEffect, useCallback } from 'react'
import type { Application, ApplicationStatus } from '../../types'
import { SearchIcon, XIcon } from '../../components/icons'
import { applicationService, formatUIToBackendApplicationStatus } from '../../services/application.service'
import { getApiErrorMessage } from '../../lib/api'

const STATUSES: ApplicationStatus[] = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected']

const STATUS_CONFIG: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
  Applied: { bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]', border: 'border-[#BFDBFE]' },
  'Under Review': { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
  Shortlisted: { bg: 'bg-[#E6F7F5]', text: 'text-[#0F9D8A]', border: 'border-[#99E6DD]' },
  Rejected: { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', border: 'border-[#FECACA]' },
  Selected: { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', border: 'border-[#A7F3D0]' },
}

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function Applications({ navigate }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'All'>('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    All: 0,
    Applied: 0,
    'Under Review': 0,
    Shortlisted: 0,
    Rejected: 0,
    Selected: 0,
  })

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const backendStatus = filterStatus !== 'All' ? formatUIToBackendApplicationStatus(filterStatus) : undefined

      const result = await applicationService.getMyApplications({
        search: search.trim() || undefined,
        status: backendStatus,
        page,
        limit: 20,
      })

      setApplications(result.items)
      setTotalCount(result.total)
      setTotalPages(Math.max(1, result.totalPages))

      // Update aggregate counts when fetching all
      if (filterStatus === 'All' && !search.trim()) {
        const counts: Record<string, number> = { All: result.total }
        STATUSES.forEach(s => {
          counts[s] = result.items.filter(a => a.status === s).length
        })
        setStatusCounts(counts)
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load applications.'))
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [filterStatus, search, page])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const selectedApp = applications.find(a => a.id === selected)

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">My Applications</h1>
          <p className="text-sm text-[#667085] mt-0.5">{totalCount} total · tracking all your activity</p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['All', ...STATUSES] as const).map(s => {
          const isActive = filterStatus === s
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setPage(1) }}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#163A5F] text-white'
                  : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {s}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-[rgba(255,255,255,0.2)] text-white' : 'bg-[#F2F4F7] text-[#667085]'
              }`}>
                {statusCounts[s] ?? 0}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 max-w-sm">
        <SearchIcon size={15} className="text-[#667085]" />
        <input
          type="text"
          placeholder="Search by job or company..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Position</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Applied</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Last updated</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#2563EB] border-t-transparent mr-2 align-middle" />
                  Loading your applications...
                </td>
              </tr>
            ) : applications.length > 0 ? (
              applications.map(app => {
                const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.Applied
                return (
                  <tr key={app.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${selected === app.id ? 'bg-[#F7F9FF]' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: app.companyColor }}>
                          {app.company[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#172033]">{app.jobTitle}</p>
                          <p className="text-xs text-[#667085]">{app.company} · {app.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        app.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#EFF6FF] text-[#2563EB]'
                      }`}>
                        {app.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#667085]">{app.appliedDate}</td>
                    <td className="px-5 py-4 text-sm text-[#667085]">{app.lastUpdated}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                        {app.status === 'Selected' && <span className="w-1.5 h-1.5 rounded-full bg-[#059669] mr-1.5" />}
                        {app.status === 'Shortlisted' && <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D8A] mr-1.5" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate('job-details', app.jobId)}
                          className="text-xs text-[#2563EB] hover:underline font-medium"
                        >
                          View job
                        </button>
                        <span className="text-[#E4E7EC]">·</span>
                        <button
                          onClick={() => setSelected(selected === app.id ? null : app.id)}
                          className="text-xs text-[#667085] hover:text-[#172033] transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">
                  No applications match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex justify-center gap-1 pt-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                page === i + 1 ? 'bg-[#2563EB] text-white' : 'text-[#667085] hover:bg-[#F2F4F7]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Application timeline info box */}
      {selectedApp && (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#172033]">Application timeline — {selectedApp.jobTitle}</h3>
              <p className="text-sm text-[#667085]">{selectedApp.company}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-[#667085] hover:text-[#172033] p-1">
              <XIcon size={16} />
            </button>
          </div>
          <div className="relative pl-6">
            {[
              { date: selectedApp.appliedDate, event: 'Application submitted', active: true },
              { date: selectedApp.status !== 'Applied' ? selectedApp.lastUpdated : '—', event: 'Application reviewed', active: ['Under Review', 'Shortlisted', 'Rejected', 'Selected'].includes(selectedApp.status) },
              { date: ['Shortlisted', 'Selected'].includes(selectedApp.status) ? selectedApp.lastUpdated : '—', event: 'Shortlisted for interview', active: ['Shortlisted', 'Selected'].includes(selectedApp.status) },
              { date: selectedApp.status === 'Selected' ? selectedApp.lastUpdated : '—', event: 'Offer extended', active: selectedApp.status === 'Selected' },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 mb-4 last:mb-0">
                <div className="absolute left-0 flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full border-2 mt-0.5 ${step.active ? 'bg-[#2563EB] border-[#2563EB]' : 'bg-white border-[#E4E7EC]'}`} style={{ marginLeft: '-1px' }} />
                  {i < 3 && <div className={`w-0.5 h-8 mt-1 ${step.active ? 'bg-[#BFDBFE]' : 'bg-[#F2F4F7]'}`} />}
                </div>
                <div className="pl-4">
                  <p className={`text-sm font-medium ${step.active ? 'text-[#172033]' : 'text-[#94A3B8]'}`}>{step.event}</p>
                  <p className="text-xs text-[#667085]">{step.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
