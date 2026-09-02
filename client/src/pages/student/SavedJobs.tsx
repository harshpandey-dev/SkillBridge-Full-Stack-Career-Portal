import { useState } from 'react'
import { SAVED_JOBS } from '../../mockData'
import { MapPinIcon, XIcon } from '../../components/icons'

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function SavedJobs({ navigate }: Props) {
  const [saved, setSaved] = useState(SAVED_JOBS.map(j => j.id))
  const [applied, setApplied] = useState<string[]>([])

  const visibleJobs = SAVED_JOBS.filter(j => saved.includes(j.id))

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Saved Jobs</h1>
        <p className="text-sm text-[#667085] mt-0.5">{visibleJobs.length} jobs saved · review and apply when ready</p>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-16 text-center">
          <div className="text-4xl mb-4">🔖</div>
          <h3 className="text-base font-semibold text-[#172033] mb-1">No saved jobs yet</h3>
          <p className="text-sm text-[#667085] mb-4">Save jobs while browsing to review them later.</p>
          <button onClick={() => navigate('opportunities')} className="bg-[#2563EB] text-white px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors">
            Browse opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map(job => (
            <div key={job.id} className="bg-white border border-[#E4E7EC] rounded-lg p-5 flex items-start gap-4">
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
                      className="font-semibold text-[#172033] hover:text-[#2563EB] transition-colors text-[15px]"
                    >
                      {job.title}
                    </button>
                    <p className="text-sm text-[#667085] mt-0.5">{job.company} · {job.department}</p>
                  </div>
                  <button
                    onClick={() => setSaved(prev => prev.filter(id => id !== job.id))}
                    className="text-[#667085] hover:text-[#DC2626] transition-colors p-1 shrink-0"
                    title="Remove from saved"
                  >
                    <XIcon size={15} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                  <span className="flex items-center gap-1 text-xs text-[#667085]"><MapPinIcon size={12} />{job.location}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A]' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>{job.type}</span>
                  {job.remote && <span className="text-xs bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded-full">Remote</span>}
                  <span className="text-sm font-semibold text-[#172033]">{job.salary}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                  {job.skills.slice(0, 5).map(s => (
                    <span key={s} className="text-xs bg-[#F2F4F7] text-[#667085] px-2 py-0.5 rounded">{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F2F4F7]">
                  <div className="text-xs text-[#94A3B8]">
                    Closes {job.deadline} · {job.applicants} applicants
                  </div>
                  <div className="flex gap-2">
                    {applied.includes(job.id) ? (
                      <span className="text-xs font-medium bg-[#E6F7F5] text-[#0F9D8A] px-3 py-1.5 rounded">Applied ✓</span>
                    ) : (
                      <button
                        onClick={() => setApplied(prev => [...prev, job.id])}
                        className="text-xs font-semibold bg-[#2563EB] text-white px-4 py-1.5 rounded hover:bg-[#1D4ED8] transition-colors"
                      >
                        Apply now
                      </button>
                    )}
                    <button
                      onClick={() => navigate('job-details', job.id)}
                      className="text-xs border border-[#E4E7EC] text-[#667085] px-3 py-1.5 rounded hover:border-[#94A3B8] transition-colors"
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
      <div className="bg-[#F7F8FA] border border-[#E4E7EC] rounded-lg p-4 flex items-start gap-3">
        <div className="text-lg">💡</div>
        <div>
          <p className="text-sm font-medium text-[#172033]">Application tip</p>
          <p className="text-xs text-[#667085] mt-0.5">
            Jobs with fewer than 200 applicants typically have 3× higher response rates. Focus on those first.
          </p>
        </div>
      </div>
    </div>
  )
}
