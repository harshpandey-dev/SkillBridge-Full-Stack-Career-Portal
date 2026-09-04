import { useState, useEffect, useCallback } from 'react'
import type { Job } from '../../types'
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, UsersIcon, SearchIcon } from '../../components/icons'
import { jobService } from '../../services/job.service'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate: (page: string, id?: string) => void
}

export default function MyJobs({ navigate }: Props) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'Open' | 'Closed' | 'Draft'>('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchMyJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await jobService.getMyJobs({
        search: search.trim() || undefined,
        limit: 50,
      })
      setJobs(result.jobs)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load your jobs.'))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchMyJobs()
  }, [fetchMyJobs])

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'All' || j.status === filter
    return matchSearch && matchStatus
  })

  const handleClose = async (id: string) => {
    try {
      setActionLoading(id)
      const updated = await jobService.closeJob(id)
      setJobs(prev => prev.map(j => j.id === id ? updated : j))
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, 'Failed to close job.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleReopen = async (id: string) => {
    try {
      setActionLoading(id)
      const updated = await jobService.reopenJob(id)
      setJobs(prev => prev.map(j => j.id === id ? updated : j))
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, 'Failed to reopen job.'))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(id)
      await jobService.deleteJob(id)
      setJobs(prev => prev.filter(j => j.id !== id))
      setDeleteConfirm(null)
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, 'Failed to delete job.'))
    } finally {
      setActionLoading(null)
    }
  }

  const statusStyles = {
    Open: 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]',
    Closed: 'bg-sb-surface-2 text-sb-text-2',
    Draft: 'bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706]',
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sb-text">My Jobs</h1>
          <p className="text-sm text-sb-text-2 mt-0.5">
            {jobs.filter(j => j.status === 'Open').length} active · {jobs.length} total
          </p>
        </div>
        <button
          onClick={() => navigate('post-job')}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon size={15} /> Post new job
        </button>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-4 text-sm text-[#DC2626] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-sb-surface border border-sb-border rounded px-3 py-2.5 flex-1 min-w-48 max-w-xs">
          <SearchIcon size={15} className="text-sb-text-2" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-sb-text placeholder-sb-text-3 outline-none bg-transparent"
          />
        </div>
        <div className="flex gap-1">
          {(['All', 'Open', 'Closed', 'Draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                filter === s ? 'bg-[#163A5F] dark:bg-[#1E3A5F] text-white' : 'bg-sb-surface border border-sb-border text-sb-text-2 hover:border-sb-border-2'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-sb-surface border border-sb-border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sb-border bg-sb-surface-2">
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Job Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Posted</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Applicants</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-sb-text-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    <span>Loading jobs...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.map(job => (
              <tr key={job.id} className={`border-b border-sb-border hover:bg-sb-surface-2 transition-colors ${deleteConfirm === job.id ? 'bg-[#FEF2F2] dark:bg-[#3B0A0A]' : ''}`}>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-sb-text">{job.title}</p>
                    <p className="text-xs text-sb-text-2">{job.department} · {job.location}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]' : 'bg-sb-brand-bg text-[#2563EB] dark:text-[#3B82F6]'}`}>
                    {job.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-sb-text-2">{job.postedDate}</td>
                <td className="px-5 py-4">
                  <button onClick={() => navigate('applicants')} className="flex items-center gap-1.5 text-sm font-medium text-sb-text hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">
                    <UsersIcon size={14} className="text-sb-text-2" />
                    {job.applicants}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[job.status]}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {deleteConfirm === job.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#DC2626] dark:text-[#F87171]">Delete this job?</span>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-xs font-medium text-[#DC2626] dark:text-[#F87171] hover:underline"
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate('job-details', job.id)}
                        title="View job details"
                        className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                      >
                        <EyeIcon size={14} />
                      </button>
                      <button
                        onClick={() => navigate('post-job', job.id)}
                        title="Edit job"
                        className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                      >
                        <EditIcon size={14} />
                      </button>
                      {job.status === 'Open' && (
                        <button
                          onClick={() => handleClose(job.id)}
                          disabled={actionLoading === job.id}
                          title="Close listing"
                          className="text-xs px-2 py-1 border border-sb-border rounded text-sb-text-2 hover:bg-sb-surface-2 transition-colors"
                        >
                          Close
                        </button>
                      )}
                      {job.status === 'Closed' && (
                        <button
                          onClick={() => handleReopen(job.id)}
                          disabled={actionLoading === job.id}
                          title="Reopen listing"
                          className="text-xs px-2 py-1 border border-[#BFDBFE] dark:border-[#1E3A5F] rounded text-[#2563EB] dark:text-[#3B82F6] bg-sb-brand-bg hover:bg-[#DBEAFE] dark:hover:bg-[#1E3A5F] transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(job.id)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-[#FEF2F2] dark:hover:bg-[#3B0A0A] text-sb-text-3 hover:text-[#DC2626] dark:hover:text-[#F87171] transition-colors"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-sb-text-2">
                  No jobs found.
                  <button onClick={() => navigate('post-job')} className="ml-1 text-[#2563EB] dark:text-[#3B82F6] hover:underline">Post your first job</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total applicants across all jobs', value: jobs.reduce((sum, j) => sum + j.applicants, 0), color: 'text-[#2563EB] dark:text-[#3B82F6]' },
          { label: 'Average applicants per job', value: Math.round(jobs.reduce((sum, j) => sum + j.applicants, 0) / Math.max(jobs.length, 1)), color: 'text-[#0F9D8A]' },
          { label: 'Open positions', value: jobs.filter(j => j.status === 'Open').length, color: 'text-sb-text' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-sb-surface border border-sb-border rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-sb-text-2 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
