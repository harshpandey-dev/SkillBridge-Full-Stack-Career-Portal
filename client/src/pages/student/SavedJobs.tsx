import { useState, useEffect, useCallback } from 'react'
import type { Job } from '../../types'
import { MapPinIcon, XIcon } from '../../components/icons'
import { savedJobService } from '../../services/savedJob.service'
import { applicationService } from '../../services/application.service'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function SavedJobs({ navigate }: Props) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState<string[]>([])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadSavedJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [savedRes, appsRes] = await Promise.all([
        savedJobService.getMySavedJobs({ limit: 50 }),
        applicationService.getMyApplications({ limit: 50 }).catch(() => ({ items: [] })),
      ])
      setJobs(savedRes.jobs)
      setApplied(appsRes.items.map(a => a.jobId))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load saved jobs.'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSavedJobs()
  }, [loadSavedJobs])

  const handleRemove = async (jobId: string) => {
    const originalJobs = [...jobs]
    try {
      setRemovingId(jobId)
      setActionError(null)
      // Optimistic update
      setJobs(prev => prev.filter(j => j.id !== jobId))
      await savedJobService.removeSavedJob(jobId)
    } catch (err: unknown) {
      // Rollback on failure
      setJobs(originalJobs)
      setActionError(getApiErrorMessage(err, 'Failed to remove saved job.'))
    } finally {
      setRemovingId(null)
    }
  }

  const handleApply = async (jobId: string) => {
    try {
      setApplyingId(jobId)
      setActionError(null)
      await applicationService.applyForJob(jobId)
      setApplied(prev => (prev.includes(jobId) ? prev : [...prev, jobId]))
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to apply for job.'))
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">Saved Jobs</h1>
        <p className="text-sm text-sb-text-2 mt-0.5">
          {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} saved · review and apply when ready
        </p>
      </div>

      {actionError && (
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-3 text-sm text-[#DC2626] dark:text-[#F87171] flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs text-[#DC2626] dark:text-[#F87171] underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded p-4 text-sm text-[#DC2626] dark:text-[#F87171]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-sb-surface border border-sb-border rounded-lg p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-sb-surface-2 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-sb-surface-2 rounded w-1/3" />
                  <div className="h-3 bg-sb-surface-2 rounded w-1/4" />
                  <div className="h-3 bg-sb-surface-2 rounded w-1/2 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-sb-surface border border-sb-border rounded-lg p-16 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h3 className="text-base font-semibold text-sb-text mb-1">No saved jobs yet</h3>
          <p className="text-sm text-sb-text-2 mb-4">Save jobs while browsing to review them later.</p>
          <button
            onClick={() => navigate('opportunities')}
            className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Browse opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-sb-surface border border-sb-border rounded-lg p-5 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded flex items-center justify-center text-white font-bold text-base shrink-0"
                style={{ backgroundColor: job.companyColor }}
              >
                {job.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      onClick={() => navigate('job-details', job.id)}
                      className="font-semibold text-sb-text hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors text-[15px] text-left"
                    >
                      {job.title}
                    </button>
                    <p className="text-sm text-sb-text-2 mt-0.5">{job.company} · {job.department}</p>
                  </div>
                  <button
                    disabled={removingId === job.id}
                    onClick={() => handleRemove(job.id)}
                    className="text-sb-text-2 hover:text-[#DC2626] transition-colors p-1 shrink-0 disabled:opacity-40"
                    title="Remove from saved"
                  >
                    <XIcon size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                  <span className="flex items-center gap-1 text-xs text-sb-text-2"><MapPinIcon size={12} />{job.location}</span>
                  {/* Job type badge — semantic colors preserved */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-[#042F2E]' : 'bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A5F] dark:text-[#3B82F6]'}`}>{job.type}</span>
                  {job.remote && <span className="text-xs bg-sb-surface-2 text-sb-text-2 px-2 py-0.5 rounded-full">Remote</span>}
                  <span className="text-sm font-semibold text-sb-text">{job.salary}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                  {job.skills.slice(0, 5).map(s => (
                    <span key={s} className="text-xs bg-sb-surface-2 text-sb-text-2 px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-sb-border">
                  <div className="text-xs text-sb-text-3">
                    Closes {job.deadline} · {job.applicants} applicants
                  </div>
                  <div className="flex gap-2">
                    {applied.includes(job.id) ? (
                      <span className="text-xs font-medium bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A] px-3 py-1.5 rounded">Applied ✓</span>
                    ) : (
                      <button
                        disabled={applyingId === job.id}
                        onClick={() => handleApply(job.id)}
                        className="text-xs font-semibold bg-[#2563EB] text-white px-4 py-1.5 rounded hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors"
                      >
                        {applyingId === job.id ? 'Applying…' : 'Apply now'}
                      </button>
                    )}
                    <button
                      onClick={() => navigate('job-details', job.id)}
                      className="text-xs border border-sb-border text-sb-text-2 px-3 py-1.5 rounded hover:border-sb-border-2 transition-colors"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tip */}
      <div className="bg-sb-surface-2 border border-sb-border rounded-lg p-4 flex items-start gap-3">
        <div className="text-lg">💡</div>
        <div>
          <p className="text-sm font-medium text-sb-text">Application tip</p>
          <p className="text-xs text-sb-text-2 mt-0.5">
            Jobs with fewer than 200 applicants typically have 3× higher response rates. Focus on those first.
          </p>
        </div>
      </div>
    </div>
  )
}
