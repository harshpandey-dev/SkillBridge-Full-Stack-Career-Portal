import { useState, useEffect, useCallback } from 'react'
import type { Job } from '../../types'
import { SearchIcon, MapPinIcon, BookmarkIcon, BookmarkFilledIcon } from '../../components/icons'
import { jobService, formatUIToBackendJobType } from '../../services/job.service'
import { getApiErrorMessage } from '../../lib/api'

const JOB_TYPES = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract']
const SKILLS = ['React', 'Python', 'TypeScript', 'SQL', 'Machine Learning', 'AWS', 'Design', 'Go']

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function Opportunities({ navigate }: Props) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState('')
  const [type, setType] = useState('All')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [applied, setApplied] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  const toggleSkill = (s: string) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const backendJobType = type !== 'All' ? formatUIToBackendJobType(type) : undefined

      const result = await jobService.getJobs({
        search: search.trim() || undefined,
        jobType: backendJobType,
        isRemote: remoteOnly ? true : undefined,
        page,
        limit: PER_PAGE,
      })

      let filtered = result.jobs
      if (selectedSkills.length > 0) {
        filtered = filtered.filter(j => selectedSkills.some(s => j.skills.includes(s)))
      }

      setJobs(filtered)
      setTotal(result.total)
      setTotalPages(Math.max(1, result.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load opportunities.'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [search, type, selectedSkills, remoteOnly, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleApply = (jobId: string) => {
    setApplied(prev => [...prev, jobId])
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Opportunities</h1>
        <p className="text-sm text-[#667085] mt-0.5">Discover roles matched to your profile and skills</p>
      </div>

      <div className="flex gap-5">
        {/* Filters */}
        <aside className="w-52 shrink-0 space-y-5">
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-[#172033] uppercase tracking-wide mb-3">Job Type</h3>
              <div className="space-y-2">
                {JOB_TYPES.map(t => (
                  <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={type === t}
                      onChange={() => { setType(t); setPage(1) }}
                      className="accent-[#2563EB]"
                    />
                    <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F2F4F7] pt-4">
              <h3 className="text-xs font-semibold text-[#172033] uppercase tracking-wide mb-3">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {SKILLS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { toggleSkill(s); setPage(1) }}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedSkills.includes(s)
                        ? 'bg-[#163A5F] text-white border-[#163A5F]'
                        : 'border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F2F4F7] pt-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={remoteOnly} onChange={() => { setRemoteOnly(!remoteOnly); setPage(1) }} className="w-4 h-4 rounded accent-[#2563EB]" />
                <span className="text-sm font-medium text-[#172033]">Remote only</span>
              </label>
            </div>

            {(selectedSkills.length > 0 || type !== 'All' || remoteOnly || search) && (
              <button
                type="button"
                onClick={() => { setSelectedSkills([]); setType('All'); setRemoteOnly(false); setSearch(''); setPage(1) }}
                className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Job list */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5">
              <SearchIcon size={15} className="text-[#667085]" />
              <input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
              />
            </div>
            <p className="text-sm text-[#667085] shrink-0">
              <span className="font-semibold text-[#172033]">{total}</span> jobs found
            </p>
          </div>

          {error && (
            <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-4 text-sm text-[#DC2626]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
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
                <div
                  key={job.id}
                  className="bg-white border border-[#E4E7EC] rounded-lg p-5 hover:border-[#94A3B8] transition-all"
                >
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
                          <button
                            onClick={() => navigate('job-details', job.id)}
                            className="font-semibold text-[#172033] hover:text-[#2563EB] transition-colors text-[15px] text-left"
                          >
                            {job.title}
                          </button>
                          <p className="text-sm text-[#667085] mt-0.5">{job.company} · {job.department}</p>
                        </div>
                        <button
                          onClick={() => setSaved(prev => prev.includes(job.id) ? prev.filter(id => id !== job.id) : [...prev, job.id])}
                          className={`p-1.5 rounded shrink-0 transition-colors ${saved.includes(job.id) ? 'text-[#2563EB]' : 'text-[#94A3B8] hover:text-[#667085]'}`}
                        >
                          {saved.includes(job.id) ? <BookmarkFilledIcon size={16} /> : <BookmarkIcon size={16} />}
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2.5 text-xs text-[#667085]">
                        <span className="flex items-center gap-1"><MapPinIcon size={12} />{job.location}</span>
                        <span className={`font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                          {job.type}
                        </span>
                        {job.remote && <span className="bg-[#F2F4F7] px-2 py-0.5 rounded-full">Remote</span>}
                        <span>{job.experience}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {job.skills.slice(0, 5).map(s => (
                          <span key={s} className={`text-xs px-2 py-0.5 rounded ${selectedSkills.includes(s) ? 'bg-[#163A5F] text-white' : 'bg-[#F2F4F7] text-[#667085]'}`}>{s}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F2F4F7]">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#172033]">{job.salary}</span>
                          <span className="text-xs text-[#94A3B8]">{job.applicants} applicants</span>
                          <span className="text-xs text-[#94A3B8]">Posted {job.postedDate}</span>
                        </div>
                        <div className="flex gap-2">
                          {applied.includes(job.id) ? (
                            <span className="text-xs font-medium text-[#0F9D8A] bg-[#E6F7F5] px-3 py-1.5 rounded">Applied ✓</span>
                          ) : (
                            <button
                              onClick={() => handleApply(job.id)}
                              className="text-xs font-semibold bg-[#2563EB] text-white px-4 py-1.5 rounded hover:bg-[#1D4ED8] transition-colors"
                            >
                              Apply now
                            </button>
                          )}
                          <button
                            onClick={() => navigate('job-details', job.id)}
                            className="text-xs font-medium text-[#667085] border border-[#E4E7EC] px-3 py-1.5 rounded hover:border-[#94A3B8] transition-colors"
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="bg-white border border-[#E4E7EC] rounded-lg p-12 text-center">
                  <p className="text-[#667085]">No jobs match your search or filters.</p>
                  <button
                    onClick={() => { setSearch(''); setType('All'); setSelectedSkills([]); setRemoteOnly(false); setPage(1) }}
                    className="text-sm text-[#2563EB] mt-2 hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          )}

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
        </div>
      </div>
    </div>
  )
}
