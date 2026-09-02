import { useState, useEffect } from 'react'
import type { Job } from '../../types'
import {
  MapPinIcon, BriefcaseIcon, DollarSignIcon, ClockIcon, UsersIcon,
  BookmarkIcon, BookmarkFilledIcon, BuildingIcon, GlobeIcon, ChevronLeftIcon, CheckIcon,
} from '../../components/icons'
import { jobService } from '../../services/job.service'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  jobId: string | null
  navigate: (page: string, jobId?: string) => void
}

export default function JobDetails({ jobId, navigate }: Props) {
  const [job, setJob] = useState<Job | null>(null)
  const [otherJobs, setOtherJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    async function loadJobDetails() {
      if (!jobId) {
        // If no jobId passed, load first available job
        try {
          setLoading(true)
          const result = await jobService.getJobs({ limit: 4 })
          if (result.jobs.length > 0) {
            setJob(result.jobs[0])
            setOtherJobs(result.jobs.slice(1))
          } else {
            setError('No job details found.')
          }
        } catch (err: unknown) {
          setError(getApiErrorMessage(err, 'Failed to load job details.'))
        } finally {
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)
        const [fetchedJob, listResult] = await Promise.all([
          jobService.getJobById(jobId),
          jobService.getJobs({ limit: 4 }),
        ])
        setJob(fetchedJob)
        setOtherJobs(listResult.jobs.filter(j => j.id !== jobId).slice(0, 3))
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Job not found or no longer available.'))
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    loadJobDetails()
  }, [jobId])

  const handleApply = () => {
    setApplied(true)
    setShowApplyModal(false)
  }

  if (loading) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen">
        <div className="bg-white border-b border-[#E4E7EC]">
          <div className="max-w-[1280px] mx-auto px-6 py-4">
            <button
              onClick={() => navigate('jobs')}
              className="flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#172033] transition-colors"
            >
              <ChevronLeftIcon size={16} /> Back to jobs
            </button>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-8 animate-pulse space-y-4">
            <div className="h-6 bg-[#F2F4F7] rounded w-1/3" />
            <div className="h-4 bg-[#F2F4F7] rounded w-1/4" />
            <div className="h-24 bg-[#F2F4F7] rounded mt-4" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen">
        <div className="bg-white border-b border-[#E4E7EC]">
          <div className="max-w-[1280px] mx-auto px-6 py-4">
            <button
              onClick={() => navigate('jobs')}
              className="flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#172033] transition-colors"
            >
              <ChevronLeftIcon size={16} /> Back to jobs
            </button>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto px-6 py-16 text-center">
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-12 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-[#172033] mb-2">Job Not Found</h2>
            <p className="text-sm text-[#667085] mb-6">{error || 'The job you are looking for is not available or has been removed.'}</p>
            <button
              onClick={() => navigate('jobs')}
              className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      <div className="bg-white border-b border-[#E4E7EC]">
        <div className="max-w-[1280px] mx-auto px-6 py-4">
          <button
            onClick={() => navigate('jobs')}
            className="flex items-center gap-1.5 text-sm text-[#667085] hover:text-[#172033] transition-colors"
          >
            <ChevronLeftIcon size={16} /> Back to jobs
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Header card */}
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0"
                  style={{ backgroundColor: job.companyColor }}
                >
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-[#172033]">{job.title}</h1>
                  <p className="text-base text-[#667085] mt-1">{job.company} · {job.department}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-sm text-[#667085]">
                      <MapPinIcon size={14} /> {job.location}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
                      job.type === 'Full-time' ? 'bg-[#EFF6FF] text-[#2563EB]' :
                      'bg-[#F2F4F7] text-[#667085]'
                    }`}>
                      {job.type}
                    </span>
                    {job.remote && <span className="text-xs bg-[#F2F4F7] text-[#667085] px-2.5 py-1 rounded-full">Remote OK</span>}
                    <span className="text-sm font-semibold text-[#172033]">{job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-5 pt-5 border-t border-[#F2F4F7]">
                {applied ? (
                  <div className="flex items-center gap-2 bg-[#E6F7F5] text-[#0F9D8A] px-5 py-2.5 rounded font-medium text-sm">
                    <CheckIcon size={16} /> Applied
                  </div>
                ) : (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
                  >
                    Apply now
                  </button>
                )}
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium border transition-colors ${
                    saved
                      ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]'
                      : 'bg-white text-[#667085] border-[#E4E7EC] hover:border-[#2563EB] hover:text-[#2563EB]'
                  }`}
                >
                  {saved ? <BookmarkFilledIcon size={16} /> : <BookmarkIcon size={16} />}
                  {saved ? 'Saved' : 'Save job'}
                </button>
              </div>
            </div>

            {/* Quick info */}
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: DollarSignIcon, label: 'Compensation', value: job.salary },
                { icon: BriefcaseIcon, label: 'Experience', value: job.experience },
                { icon: ClockIcon, label: 'Application closes', value: job.deadline },
                { icon: UsersIcon, label: 'Total applicants', value: `${job.applicants.toLocaleString()}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 text-[#667085] mb-1">
                    <Icon size={14} />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#172033]">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#172033] mb-4">About this role</h2>
              <p className="text-sm text-[#667085] leading-relaxed whitespace-pre-line">{job.description}</p>

              {job.responsibilities && job.responsibilities.length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-[#172033] mt-6 mb-3">Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#667085]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0 mt-2" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {job.requirements && job.requirements.length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-[#172033] mt-6 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#667085]">
                        <CheckIcon size={14} className="text-[#0F9D8A] shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {job.skills && job.skills.length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-[#172033] mt-6 mb-3">Skills required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => (
                      <span key={s} className="text-sm bg-[#EFF6FF] text-[#2563EB] px-3 py-1.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                </>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <h3 className="text-base font-semibold text-[#172033] mt-6 mb-3">Benefits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.benefits.map(b => (
                      <div key={b} className="flex items-center gap-2 text-sm text-[#667085]">
                        <CheckIcon size={14} className="text-[#0F9D8A] shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-72 shrink-0 space-y-4">
            {/* Company info */}
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
              <h3 className="text-sm font-semibold text-[#172033] mb-4">About {job.company}</h3>
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-lg mb-3"
                style={{ backgroundColor: job.companyColor }}
              >
                {job.company[0]}
              </div>
              <h4 className="font-semibold text-[#172033]">{job.company}</h4>
              <p className="text-sm text-[#667085] mb-4">Leading Employer · Hiring on SkillBridge</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-[#667085]">
                  <MapPinIcon size={14} className="shrink-0" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#667085]">
                  <GlobeIcon size={14} className="shrink-0" />
                  <span className="text-[#2563EB] text-sm">{job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#667085]">
                  <BuildingIcon size={14} className="shrink-0" /> {job.department}
                </div>
              </div>
            </div>

            {/* Posted info */}
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
              <h3 className="text-sm font-semibold text-[#172033] mb-3">Listing details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#667085]">Posted</span>
                  <span className="font-medium text-[#172033]">{job.postedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Deadline</span>
                  <span className="font-medium text-[#172033]">{job.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Applicants</span>
                  <span className="font-medium text-[#172033]">{job.applicants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#667085]">Status</span>
                  <span className="text-[#0F9D8A] font-medium bg-[#E6F7F5] px-2 py-0.5 rounded-full text-xs">{job.status}</span>
                </div>
              </div>
            </div>

            {/* Similar jobs */}
            {otherJobs.length > 0 && (
              <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
                <h3 className="text-sm font-semibold text-[#172033] mb-3">Similar roles</h3>
                <div className="space-y-3">
                  {otherJobs.map(j => (
                    <button
                      key={j.id}
                      onClick={() => navigate('job-details', j.id)}
                      className="w-full flex items-center gap-3 text-left group"
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: j.companyColor }}
                      >
                        {j.company[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#172033] group-hover:text-[#2563EB] transition-colors truncate">{j.title}</p>
                        <p className="text-xs text-[#667085]">{j.company}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-[#E4E7EC]">
              <h2 className="text-lg font-semibold text-[#172033]">Apply to {job.title}</h2>
              <p className="text-sm text-[#667085] mt-0.5">{job.company} · {job.location}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Full name</label>
                <input defaultValue="Alex Chen" className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Email address</label>
                <input defaultValue="alex.chen@stanford.edu" className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Cover letter <span className="text-[#667085] font-normal">(optional)</span></label>
                <textarea rows={4} placeholder="Tell the recruiter why you're a great fit..." className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Resume</label>
                <div className="border-2 border-dashed border-[#E4E7EC] rounded p-4 text-center">
                  <p className="text-sm text-[#667085]">alex-chen-resume-2026.pdf already on file</p>
                  <button className="text-xs text-[#2563EB] mt-1 hover:underline">Upload different file</button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E4E7EC] flex gap-3 justify-end">
              <button onClick={() => setShowApplyModal(false)} className="px-4 py-2 text-sm font-medium text-[#667085] hover:text-[#172033] border border-[#E4E7EC] rounded hover:bg-[#F7F8FA] transition-colors">
                Cancel
              </button>
              <button onClick={handleApply} className="px-5 py-2 text-sm font-semibold bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8] transition-colors">
                Submit application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
