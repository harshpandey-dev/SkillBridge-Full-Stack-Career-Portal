import { useState, useEffect, useCallback } from 'react'
import type { Job } from '../../types'
import { SearchIcon, MapPinIcon, ChevronLeftIcon, ChevronRightIcon, BookmarkIcon, BookmarkFilledIcon } from '../../components/icons'
import { jobService, formatUIToBackendJobType } from '../../services/job.service'
import { savedJobService } from '../../services/savedJob.service'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../lib/api'

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract']
const LOCATIONS = ['San Francisco, CA', 'New York, NY', 'Remote', 'Redmond, WA', 'Austin, TX', 'Cupertino, CA']

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function Jobs({ navigate }: Props) {
  const { user, role } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedJobIds, setSavedJobIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState('')
  const [locationInput, setLocationInput] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [sort, setSort] = useState<'newest' | 'salary_desc' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const PER_PAGE = 6

  const toggle = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
  }

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let backendJobType: string | undefined = undefined
      if (selectedTypes.length === 1) {
        backendJobType = formatUIToBackendJobType(selectedTypes[0])
      }

      const activeLocation = locationInput || (selectedLocations.length === 1 ? selectedLocations[0] : undefined)

      const result = await jobService.getJobs({
        search: search.trim() || undefined,
        location: activeLocation,
        jobType: backendJobType,
        isRemote: remoteOnly ? true : undefined,
        sort,
        page,
        limit: PER_PAGE,
      })

      let clientRefined = result.jobs
      if (selectedTypes.length > 1) {
        clientRefined = clientRefined.filter(j => selectedTypes.includes(j.type))
      }
      if (selectedLocations.length > 1) {
        clientRefined = clientRefined.filter(j => selectedLocations.includes(j.location))
      }

      setJobs(clientRefined)
      setTotal(result.total)
      setTotalPages(Math.max(1, result.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load jobs. Please try again.'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, locationInput, selectedTypes, selectedLocations, remoteOnly, sort, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    async function loadSavedList() {
      if (user && role === 'student') {
        try {
          const res = await savedJobService.getMySavedJobs({ limit: 100 })
          setSavedJobIds(res.jobs.map(j => j.id))
        } catch {
          // Ignore
        }
      } else {
        setSavedJobIds([])
      }
    }
    loadSavedList()
  }, [user, role])

  const handleToggleSave = async (jobId: string) => {
    if (!user) {
      navigate('login')
      return
    }
    if (role !== 'student') {
      alert('Only students can bookmark jobs.')
      return
    }

    const isCurrentlySaved = savedJobIds.includes(jobId)
    if (isCurrentlySaved) {
      setSavedJobIds(prev => prev.filter(id => id !== jobId))
      try {
        await savedJobService.removeSavedJob(jobId)
      } catch {
        setSavedJobIds(prev => [...prev, jobId])
      }
    } else {
      setSavedJobIds(prev => [...prev, jobId])
      try {
        await savedJobService.saveJob(jobId)
      } catch {
        setSavedJobIds(prev => prev.filter(id => id !== jobId))
      }
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Search bar */}
      <div className="bg-[#163A5F] py-8">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-2xl font-bold text-white mb-4">Find your next opportunity</h1>
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
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
            <div className="flex items-center gap-2 bg-white rounded px-3 py-2.5 flex-1">
              <MapPinIcon size={16} className="text-[#667085]" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'"
                value={locationInput}
                onChange={e => { setLocationInput(e.target.value); setPage(1) }}
                className="flex-1 text-sm text-[#172033] placeholder-[#667085] outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F2F4F7]">
                <h2 className="font-semibold text-[#172033] text-sm">Filters</h2>
                {(selectedTypes.length > 0 || selectedLocations.length > 0 || remoteOnly || search || locationInput) && (
                  <button
                    onClick={() => {
                      setSelectedTypes([])
                      setSelectedLocations([])
                      setRemoteOnly(false)
                      setSearch('')
                      setLocationInput('')
                      setPage(1)
                    }}
                    className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Remote toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={e => { setRemoteOnly(e.target.checked); setPage(1) }}
                    className="w-4 h-4 rounded border-[#E4E7EC] text-[#2563EB] focus:ring-[#2563EB] accent-[#2563EB]"
                  />
                  <span className="text-sm font-medium text-[#172033]">Remote only</span>
                </label>
              </div>

              {/* Job Type */}
              <div>
                <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wide mb-3">Job Type</h3>
                <div className="space-y-2">
                  {JOB_TYPES.map(t => (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() => { toggle(selectedTypes, setSelectedTypes, t); setPage(1) }}
                        className="w-4 h-4 rounded border-[#E4E7EC] text-[#2563EB] accent-[#2563EB]"
                      />
                      <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-xs font-semibold text-[#667085] uppercase tracking-wide mb-3">Popular Locations</h3>
                <div className="space-y-2">
                  {LOCATIONS.map(loc => (
                    <label key={loc} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => { toggle(selectedLocations, setSelectedLocations, loc); setPage(1) }}
                        className="w-4 h-4 rounded border-[#E4E7EC] text-[#2563EB] accent-[#2563EB]"
                      />
                      <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Job Listings Main */}
          <div className="flex-1 min-w-0">
            {/* Sort & Count Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#667085]">
                Showing <span className="font-semibold text-[#172033]">{jobs.length}</span> of <span className="font-semibold text-[#172033]">{total}</span> roles
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#667085]">Sort by:</span>
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value as 'newest' | 'salary_desc' | 'oldest'); setPage(1) }}
                  className="text-xs font-medium text-[#172033] bg-white border border-[#E4E7EC] rounded px-2.5 py-1.5 outline-none focus:border-[#2563EB]"
                >
                  <option value="newest">Newest first</option>
                  <option value="salary_desc">Highest salary</option>
                  <option value="oldest">Oldest first</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-sm text-[#DC2626] mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white border border-[#E4E7EC] rounded-lg p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 bg-[#F2F4F7] rounded shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[#F2F4F7] rounded w-1/3" />
                        <div className="h-3 bg-[#F2F4F7] rounded w-1/4" />
                        <div className="h-3 bg-[#F2F4F7] rounded w-1/2 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={() => handleToggleSave(job.id)}
                    onClick={() => navigate('job-details', job.id)}
                  />
                ))}

                {jobs.length === 0 && (
                  <div className="bg-white border border-[#E4E7EC] rounded-lg p-12 text-center">
                    <div className="text-3xl mb-3">🔍</div>
                    <h3 className="font-semibold text-[#172033] text-base mb-1">No roles matched your search</h3>
                    <p className="text-sm text-[#667085] mb-4">Try broadening your search terms or clearing active filters.</p>
                    <button
                      onClick={() => {
                        setSelectedTypes([])
                        setSelectedLocations([])
                        setRemoteOnly(false)
                        setSearch('')
                        setLocationInput('')
                        setPage(1)
                      }}
                      className="text-xs font-semibold bg-[#2563EB] text-white px-4 py-2 rounded hover:bg-[#1D4ED8] transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && totalPages > 1 && (
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

function JobCard({
  job,
  isSaved,
  onToggleSave,
  onClick,
}: {
  job: Job;
  isSaved: boolean;
  onToggleSave: () => void;
  onClick: () => void;
}) {
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
              onClick={e => { e.stopPropagation(); onToggleSave() }}
              className={`shrink-0 p-1.5 rounded hover:bg-[#F7F8FA] transition-colors ${isSaved ? 'text-[#2563EB]' : 'text-[#94A3B8]'}`}
              title={isSaved ? 'Remove bookmark' : 'Bookmark job'}
            >
              {isSaved ? <BookmarkFilledIcon size={16} /> : <BookmarkIcon size={16} />}
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
