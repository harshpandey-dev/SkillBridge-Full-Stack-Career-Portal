import { useState, useEffect, useCallback } from 'react'
import { SearchIcon, EyeIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import {
  adminService,
  type AdminJobItem,
  type AdminDashboardStats,
} from '../../services/admin.service'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate: (page: string, jobId?: string) => void
}

const STATUS_STYLES: Record<string, string> = {
  OPEN: 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400',
  Open: 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400',
  CLOSED: 'bg-[#F2F4F7] text-[#667085] dark:bg-slate-800 dark:text-slate-400',
  Closed: 'bg-[#F2F4F7] text-[#667085] dark:bg-slate-800 dark:text-slate-400',
  DRAFT: 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400',
  Draft: 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400',
}


export default function JobManagement({ navigate }: Props) {
  const [jobs, setJobs] = useState<AdminJobItem[]>([])
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'OPEN' | 'CLOSED' | 'DRAFT'>('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const LIMIT = 10

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg)
    setTimeout(() => setSuccessBanner(null), 3000)
  }

  const loadStats = useCallback(async () => {
    try {
      const res = await adminService.getDashboard()
      setStats(res)
    } catch {
      // Fallback
    }
  }, [])

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminService.getJobs({
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        jobType: typeFilter !== 'All' ? typeFilter : undefined,
        page,
        limit: LIMIT,
      })
      setJobs(res.items)
      setTotal(res.total)
      setTotalPages(Math.max(1, res.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load jobs.'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter, page])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const handleUpdateStatus = async (jobId: string, newStatus: 'OPEN' | 'CLOSED' | 'DRAFT') => {
    try {
      setActionLoadingId(jobId)
      setActionError(null)

      // Optimistic update
      setJobs(prev =>
        prev.map(j => (j.id === jobId ? { ...j, status: newStatus } : j))
      )

      await adminService.updateJobStatus(jobId, newStatus)
      showSuccess(`Job status updated to ${newStatus}`)
      loadStats()
    } catch (err: unknown) {
      loadJobs()
      setActionError(getApiErrorMessage(err, 'Unable to update job status.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setActionLoadingId(jobId)
      setActionError(null)
      await adminService.deleteJob(jobId)
      setDeleteConfirm(null)
      showSuccess('Job deleted successfully')
      loadJobs()
      loadStats()
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Unable to delete job.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const jobStats = {
    open: stats?.jobs.open ?? 0,
    closed: stats?.jobs.closed ?? 0,
    draft: stats?.jobs.draft ?? 0,
    totalApplicants: stats?.applications.total ?? 0,
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">Job Management</h1>
        <p className="text-sm text-sb-text-2 mt-0.5">
          {total} total listings · {jobStats.totalApplicants.toLocaleString()} total applications
        </p>
      </div>

      {successBanner && (
        <div className="bg-[#E6F7F5] dark:bg-teal-950/40 border border-[#BFDBFE] dark:border-teal-800 text-[#0F9D8A] dark:text-teal-400 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900 text-[#DC2626] dark:text-red-400 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Open listings', value: jobStats.open, color: 'text-[#0F9D8A] dark:text-teal-400' },
          { label: 'Closed listings', value: jobStats.closed, color: 'text-[#667085] dark:text-slate-400' },
          { label: 'Draft listings', value: jobStats.draft, color: 'text-[#D97706] dark:text-amber-400' },
          { label: 'Total applications', value: jobStats.totalApplicants.toLocaleString(), color: 'text-[#2563EB] dark:text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-sb-surface border border-sb-border rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-sb-text-2 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-sb-surface border border-sb-border rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-sb-text-3" />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 text-sm text-sb-text placeholder-sb-text-3 bg-transparent outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => {
            setTypeFilter(e.target.value)
            setPage(1)
          }}
          className="border border-sb-border rounded px-3 py-2.5 text-sm text-sb-text bg-sb-surface outline-none"
        >
          <option value="All">All types</option>
          <option value="FULL_TIME">Full-time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="PART_TIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
        </select>

        <div className="flex gap-1">
          {[
            { label: 'All', val: 'All' as const },
            { label: 'Open', val: 'OPEN' as const },
            { label: 'Closed', val: 'CLOSED' as const },
            { label: 'Draft', val: 'DRAFT' as const },
          ].map(s => (
            <button
              key={s.val}
              onClick={() => {
                setStatusFilter(s.val)
                setPage(1)
              }}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                statusFilter === s.val
                  ? 'bg-[#163A5F] text-white dark:bg-sb-brand dark:text-white'
                  : 'bg-sb-surface border border-sb-border text-sb-text-2 hover:border-sb-border-2 hover:text-sb-text'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900 text-[#DC2626] dark:text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-sb-text-2">Loading jobs…</div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center text-sm text-sb-text-2">No jobs match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sb-border bg-sb-surface-2">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Job</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Location</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Applicants</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Posted</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const companyInitials = job.company?.name ? job.company.name[0].toUpperCase() : 'C'
                  const postedDate = new Date(job.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                  const appCount = job._count?.applications ?? 0
                  const isProcessing = actionLoadingId === job.id

                  return (
                    <tr
                      key={job.id}
                      className={`border-b border-sb-border hover:bg-sb-surface-2 transition-colors ${
                        deleteConfirm === job.id ? 'bg-[#FEF2F2] dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#163A5F] dark:bg-sb-brand flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden">
                            {job.company?.logo ? (
                              <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                            ) : (
                              companyInitials
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sb-text max-w-[240px] truncate">{job.title}</p>
                            <p className="text-xs text-sb-text-2">
                              {job.company?.name} {job.department ? `· ${job.department}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            job.jobType === 'INTERNSHIP' || job.jobType === 'Internship'
                              ? 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400'
                              : 'bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400'
                          }`}
                        >
                          {job.jobType.replace('_', ' ').toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{job.location}</td>
                      <td className="px-5 py-4 text-sm font-medium text-sb-text">
                        {appCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{postedDate}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[job.status] || STATUS_STYLES.OPEN
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {deleteConfirm === job.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#DC2626] dark:text-red-400 font-medium">Remove?</span>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-xs font-medium text-[#DC2626] dark:text-red-400 hover:underline disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-sb-text-2 hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => navigate('job-details', job.id)}
                              className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                              title="View listing"
                            >
                              <EyeIcon size={13} />
                            </button>
                            {job.status === 'OPEN' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(job.id, 'CLOSED')}
                                className="text-xs px-2 py-1 border border-sb-border rounded text-sb-text-2 hover:bg-sb-surface-2 bg-sb-surface transition-colors disabled:opacity-50"
                              >
                                Close
                              </button>
                            ) : job.status === 'CLOSED' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(job.id, 'OPEN')}
                                className="text-xs px-2 py-1 border border-sb-border rounded text-[#0F9D8A] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 bg-sb-surface transition-colors disabled:opacity-50"
                              >
                                Reopen
                              </button>
                            ) : null}
                            <button
                              disabled={isProcessing}
                              onClick={() => setDeleteConfirm(job.id)}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-sb-text-3 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                              title="Delete job"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-sb-text-3">
          Showing {jobs.length} of {total} listings
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                    : 'border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
