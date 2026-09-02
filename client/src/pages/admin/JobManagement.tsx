import { useState } from 'react'
import { JOBS } from '../../mockData'
import type { JobStatus } from '../../types'
import { SearchIcon, EyeIcon, TrashIcon } from '../../components/icons'

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function JobManagement({ navigate }: Props) {
  const [jobs, setJobs] = useState(JOBS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'All'>('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All' || j.type === typeFilter
    const matchStatus = statusFilter === 'All' || j.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const updateStatus = (id: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
  }

  const deleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id))
    setDeleteConfirm(null)
  }

  const stats = {
    open: jobs.filter(j => j.status === 'Open').length,
    closed: jobs.filter(j => j.status === 'Closed').length,
    draft: jobs.filter(j => j.status === 'Draft').length,
    totalApplicants: jobs.reduce((sum, j) => sum + j.applicants, 0),
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Job Management</h1>
        <p className="text-sm text-[#667085] mt-0.5">{jobs.length} total listings · {stats.totalApplicants.toLocaleString()} total applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Open listings', value: stats.open, color: 'text-[#0F9D8A]' },
          { label: 'Closed listings', value: stats.closed, color: 'text-[#667085]' },
          { label: 'Draft listings', value: stats.draft, color: 'text-[#D97706]' },
          { label: 'Total applications', value: stats.totalApplicants.toLocaleString(), color: 'text-[#2563EB]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-[#667085] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search by title or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] bg-white outline-none"
        >
          <option value="All">All types</option>
          <option>Full-time</option>
          <option>Internship</option>
          <option>Part-time</option>
          <option>Contract</option>
        </select>

        <div className="flex gap-1">
          {(['All', 'Open', 'Closed', 'Draft'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                statusFilter === s ? 'bg-[#163A5F] text-white' : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
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
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Job</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Type</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Location</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Applicants</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Posted</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(job => (
              <tr key={job.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${deleteConfirm === job.id ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: job.companyColor }}>
                      {job.company[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#172033]">{job.title}</p>
                      <p className="text-xs text-[#667085]">{job.company} · {job.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                    {job.type}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-[#667085]">{job.location}</td>
                <td className="px-5 py-4 text-sm font-medium text-[#172033]">{job.applicants.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm text-[#667085]">{job.postedDate}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    job.status === 'Open' ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
                    job.status === 'Closed' ? 'bg-[#F2F4F7] text-[#667085]' :
                    'bg-[#FFFBEB] text-[#D97706]'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {deleteConfirm === job.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#DC2626]">Remove?</span>
                      <button onClick={() => deleteJob(job.id)} className="text-xs font-medium text-[#DC2626] hover:underline">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#667085] hover:underline">No</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate('job-details', job.id)}
                        className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
                        title="View listing"
                      >
                        <EyeIcon size={13} />
                      </button>
                      {job.status === 'Open' ? (
                        <button
                          onClick={() => updateStatus(job.id, 'Closed')}
                          className="text-xs px-2 py-1 border border-[#E4E7EC] rounded text-[#667085] hover:bg-[#F7F8FA] transition-colors"
                        >
                          Close
                        </button>
                      ) : job.status === 'Closed' ? (
                        <button
                          onClick={() => updateStatus(job.id, 'Open')}
                          className="text-xs px-2 py-1 border border-[#E4E7EC] rounded text-[#0F9D8A] hover:bg-[#E6F7F5] transition-colors"
                        >
                          Reopen
                        </button>
                      ) : null}
                      <button
                        onClick={() => setDeleteConfirm(job.id)}
                        className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#667085]">No jobs match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#94A3B8]">Showing {filtered.length} of {jobs.length} listings</p>
    </div>
  )
}
