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
    Open: 'bg-[#E6F7F5] text-[#0F9D8A]',
    Closed: 'bg-[#F2F4F7] text-[#667085]',
    Draft: 'bg-[#FFFBEB] text-[#D97706]',
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">My Jobs</h1>
          <p className="text-sm text-[#667085] mt-0.5">
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
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-4 text-sm text-[#DC2626]">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-48 max-w-xs">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>
        <div className="flex gap-1">
          {(['All', 'Open', 'Closed', 'Draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                filter === s ? 'bg-[#163A5F] text-white' : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Job Title</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Posted</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Applicants</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-[#667085]">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                    <span>Loading jobs...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.map(job => (
              <tr key={job.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${deleteConfirm === job.id ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#172033]">{job.title}</p>
                    <p className="text-xs text-[#667085]">{job.department} · {job.location}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                    {job.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-[#667085]">{job.postedDate}</td>
                <td className="px-5 py-4">
                  <button onClick={() => navigate('applicants')} className="flex items-center gap-1.5 text-sm font-medium text-[#172033] hover:text-[#2563EB] transition-colors">
                    <UsersIcon size={14} className="text-[#667085]" />
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
                      <span className="text-xs text-[#DC2626]">Delete this job?</span>
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={actionLoading === job.id}
                        className="text-xs font-medium text-[#DC2626] hover:underline"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-[#667085] hover:underline"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate('job-details', job.id)}
                        title="View job details"
                        className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
                      >
                        <EyeIcon size={14} />
                      </button>
                      <button
                        onClick={() => navigate('post-job', job.id)}
                        title="Edit job"
                        className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
                      >
                        <EditIcon size={14} />
                      </button>
                      {job.status === 'Open' && (
                        <button
                          onClick={() => handleClose(job.id)}
                          disabled={actionLoading === job.id}
                          title="Close listing"
                          className="text-xs px-2 py-1 border border-[#E4E7EC] rounded text-[#667085] hover:bg-[#F7F8FA] transition-colors"
                        >
                          Close
                        </button>
                      )}
                      {job.status === 'Closed' && (
                        <button
                          onClick={() => handleReopen(job.id)}
                          disabled={actionLoading === job.id}
                          title="Reopen listing"
                          className="text-xs px-2 py-1 border border-[#BFDBFE] rounded text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors"
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(job.id)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors"
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
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">
                  No jobs found.
                  <button onClick={() => navigate('post-job')} className="ml-1 text-[#2563EB] hover:underline">Post your first job</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total applicants across all jobs', value: jobs.reduce((sum, j) => sum + j.applicants, 0), color: 'text-[#2563EB]' },
          { label: 'Average applicants per job', value: Math.round(jobs.reduce((sum, j) => sum + j.applicants, 0) / Math.max(jobs.length, 1)), color: 'text-[#0F9D8A]' },
          { label: 'Open positions', value: jobs.filter(j => j.status === 'Open').length, color: 'text-[#172033]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#667085] mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
