import { useState } from 'react'
import { JOBS } from '../../mockData'
import type { Job } from '../../types'
import { SearchIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, BookmarkIcon } from '../../components/icons'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract']
const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Remote', 'Redmond, WA', 'Austin, TX', 'Cupertino, CA']

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function Jobs({ navigate }: Props) {
  const [search, setSearch] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const toggle = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const filtered = JOBS.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(j.type)
    const matchLoc = selectedLocations.length === 0 || selectedLocations.includes(j.location)
    const matchRemote = !remoteOnly || j.remote
    return matchSearch && matchType && matchLoc && matchRemote
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Search bar */}
      <div className="bg-[#163A5F] py-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-2xl font-bold text-white mb-4">Find your next opportunity</h1>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 bg-white rounded px-3 py-2.5 flex-1">
              <SearchIcon size={16} className="text-[#667085]" />
              <input
                type="text"
                placeholder="Job title or company"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="flex-1 text-sm text-[#172033] placeholder-[#667085] outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded px-3 py-2.5 w-56">
              <MapPinIcon size={16} className="text-[#667085]" />
              <input
                type="text"
                placeholder="Location"
                className="flex-1 text-sm text-[#172033] placeholder-[#667085] outline-none"
              />
            </div>
            <button className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shrink-0">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Filters sidebar */}
          <aside className="w-56 shrink-0 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#172033] mb-3">Job Type</h3>
              <div className="space-y-2">
                {JOB_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => { toggle(selectedTypes, setSelectedTypes, type); setPage(1) }}
                      className="w-4 h-4 rounded border-[#E4E7EC] text-[#2563EB] accent-[#2563EB]"
                    />
                    <span className="text-sm text-[#667085] group-hover:text-[#172033] transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E4E7EC] pt-4">
              <h3 className="text-sm font-semibold text-[#172033] mb-3">Location</h3>
              <div className="space-y-2">
                {LOCATIONS.map(loc => (
                  <label key={loc} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => { toggle(selectedLocations, setSelectedLocations, loc); setPage(1) }}
                      className="w-4 h-4 rounded border-[#E4E7EC] accent-[#2563EB]"
                    />
                    <span className="text-sm text-[#667085] group-hover:text-[#172033] transition-colors">{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E4E7EC] pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={() => { setRemoteOnly(!remoteOnly); setPage(1) }}
                  className="w-4 h-4 rounded accent-[#2563EB]"
                />
                <span className="text-sm font-medium text-[#172033]">Remote only</span>
              </label>
            </div>

            {(selectedTypes.length > 0 || selectedLocations.length > 0 || remoteOnly) && (
              <button
                onClick={() => { setSelectedTypes([]); setSelectedLocations([]); setRemoteOnly(false); setPage(1) }}
                className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                Clear all filters
              </button>
            )}
          </aside>

          {/* Job list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#667085]">
                Showing <span className="font-semibold text-[#172033]">{filtered.length}</span> jobs
              </p>
              <select className="text-sm text-[#667085] border border-[#E4E7EC] rounded px-2 py-1.5 bg-white outline-none">
                <option>Most recent</option>
                <option>Most relevant</option>
                <option>Salary: High to low</option>
              </select>
            </div>

            <div className="space-y-3">
              {paginated.map(job => (
                <JobCard key={job.id} job={job} onClick={() => navigate('job-details', job.id)} />
              ))}
              {paginated.length === 0 && (
                <div className="bg-white border border-[#E4E7EC] rounded-lg p-12 text-center">
                  <p className="text-[#667085] text-sm">No jobs match your filters.</p>
                  <button onClick={() => { setSelectedTypes([]); setSelectedLocations([]); setRemoteOnly(false) }} className="mt-2 text-sm text-[#2563EB] hover:underline">Clear filters</button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-[#667085]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                          : 'border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const [saved, setSaved] = useState(false)

  return (
    <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 hover:border-[#2563EB] hover:shadow-sm transition-all group">
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded flex items-center justify-center text-white font-bold text-base shrink-0"
          style={{ backgroundColor: job.companyColor }}
        >
          {job.company[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <button onClick={onClick} className="font-semibold text-[#172033] group-hover:text-[#2563EB] transition-colors text-[15px] text-left">
                {job.title}
              </button>
              <p className="text-sm text-[#667085] mt-0.5">{job.company} · {job.department}</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setSaved(!saved) }}
              className={`shrink-0 p-1.5 rounded hover:bg-[#F7F8FA] transition-colors ${saved ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}
            >
              <BookmarkIcon size={16} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 mb-3">
            <span className="flex items-center gap-1 text-xs text-[#667085]">
              <MapPinIcon size={12} /> {job.location}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
              job.type === 'Full-time' ? 'bg-[#EFF6FF] text-[#2563EB]' :
              'bg-[#F2F4F7] text-[#667085]'
            }`}>
              {job.type}
            </span>
            {job.remote && <span className="text-xs bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded-full">Remote</span>}
            <span className="text-xs text-[#667085]">{job.experience}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.skills.slice(0, 4).map(s => (
              <span key={s} className="text-xs bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded">{s}</span>
            ))}
            {job.skills.length > 4 && <span className="text-xs text-[#667085]">+{job.skills.length - 4} more</span>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#172033]">{job.salary}</span>
              <span className="text-xs text-[#667085]">Posted {job.postedDate}</span>
            </div>
            <button
              onClick={onClick}
              className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              View details →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
