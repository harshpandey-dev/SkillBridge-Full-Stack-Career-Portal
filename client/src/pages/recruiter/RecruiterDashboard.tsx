import { useState, useEffect } from 'react'
import type { NavUser, Job, Applicant } from '../../types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts'
import { BriefcaseIcon, UsersIcon, ChevronRightIcon, PlusIcon, TrendingUpIcon } from '../../components/icons'
import { jobService } from '../../services/job.service'
import { applicationService } from '../../services/application.service'

const TrendingUpIcon2 = TrendingUpIcon

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-[#EFF6FF] text-[#2563EB]',
  'Under Review': 'bg-[#FFFBEB] text-[#D97706]',
  Shortlisted: 'bg-[#E6F7F5] text-[#0F9D8A]',
  Rejected: 'bg-[#FEF2F2] text-[#DC2626]',
  Selected: 'bg-[#ECFDF5] text-[#059669]',
}

interface Props {
  user: NavUser
  navigate: (page: string, id?: string) => void
}

export default function RecruiterDashboard({ user, navigate }: Props) {
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([])
  const [activeJobsCount, setActiveJobsCount] = useState(0)
  const [applicants, setApplicants] = useState<Applicant[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const result = await jobService.getMyJobs({ limit: 10 })
        const jobs = result.jobs
        setRecruiterJobs(jobs.slice(0, 5))
        setActiveJobsCount(jobs.filter(j => j.status === 'Open').length)

        if (jobs.length > 0) {
          const promises = jobs.map(j =>
            applicationService.getJobApplicants(j.id, { limit: 10 }).catch(() => ({ items: [] }))
          )
          const appResults = await Promise.all(promises)
          const allApps = appResults.flatMap((r, i) =>
            r.items.map(a => ({ ...a, jobTitle: jobs[i]?.title || a.jobTitle }))
          )
          setApplicants(allApps)
        }
      } catch {
        // Fallback silently if offline or token refreshing
      }
    }
    loadDashboardData()
  }, [])

  const companyName = user.recruiterProfile?.company?.name || 'Company'
  const position = user.recruiterProfile?.position || 'Recruiter'

  const recentApplicants = applicants.slice(0, 5)

  const pipelineCounts = {
    applied: applicants.filter(a => a.status === 'Applied').length,
    underReview: applicants.filter(a => a.status === 'Under Review').length,
    shortlisted: applicants.filter(a => a.status === 'Shortlisted').length,
    selected: applicants.filter(a => a.status === 'Selected').length,
  }

  const totalAppCount = applicants.length

  const pipeline = [
    { stage: 'Applied', count: pipelineCounts.applied, color: '#2563EB', pct: totalAppCount ? Math.round((pipelineCounts.applied / totalAppCount) * 100) : 0 },
    { stage: 'Under Review', count: pipelineCounts.underReview, color: '#D97706', pct: totalAppCount ? Math.round((pipelineCounts.underReview / totalAppCount) * 100) : 0 },
    { stage: 'Shortlisted', count: pipelineCounts.shortlisted, color: '#0F9D8A', pct: totalAppCount ? Math.round((pipelineCounts.shortlisted / totalAppCount) * 100) : 0 },
    { stage: 'Hired', count: pipelineCounts.selected, color: '#059669', pct: totalAppCount ? Math.round((pipelineCounts.selected / totalAppCount) * 100) : 0 },
  ]

  const stats = [
    { label: 'Active job postings', value: activeJobsCount, icon: BriefcaseIcon, color: 'bg-[#EFF6FF] text-[#2563EB]', change: '+2 this month' },
    { label: 'Total applicants', value: totalAppCount, icon: UsersIcon, color: 'bg-[#E6F7F5] text-[#0F9D8A]', change: `Across ${recruiterJobs.length} jobs` },
    { label: 'Shortlisted candidates', value: pipelineCounts.shortlisted, icon: TrendingUpIcon2, color: 'bg-[#FFFBEB] text-[#D97706]', change: 'In active review' },
    { label: 'Hires made', value: pipelineCounts.selected, icon: TrendingUpIcon2, color: 'bg-[#ECFDF5] text-[#059669]', change: 'Selected candidates' },
  ]

  const jobChartData = recruiterJobs.slice(0, 5).map(job => {
    const jobApps = applicants.filter(a => a.jobId === job.id)
    return {
      name: job.title.length > 14 ? `${job.title.slice(0, 12)}…` : job.title,
      applications: jobApps.length || job.applicants || 0,
      interviews: jobApps.filter(a => a.status === 'Shortlisted' || a.status === 'Under Review').length,
      hires: jobApps.filter(a => a.status === 'Selected').length,
    }
  })

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sb-text">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-sb-text-2 mt-0.5">{companyName} · {position}</p>
        </div>
        <button
          onClick={() => navigate('post-job')}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon size={15} /> Post a job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-sb-surface border border-sb-border rounded-lg p-5">
            <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="text-2xl font-bold text-sb-text">{value}</div>
            <div className="text-sm text-sb-text-2 mt-0.5">{label}</div>
            <div className="text-xs text-sb-text-3 mt-2">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Applications chart */}
        <div className="lg:col-span-3 bg-sb-surface border border-sb-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-sb-text">Applications by job</h2>
              <p className="text-xs text-sb-text-2 mt-0.5">Applications, interviews, and hires</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={jobChartData.length > 0 ? jobChartData : [{ name: 'No jobs yet', applications: 0, interviews: 0, hires: 0 }]}
              margin={{ top: 0, right: 4, bottom: 0, left: -20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #2D3344', borderRadius: '6px', fontSize: '12px', backgroundColor: '#1A1F2E', color: '#F1F5F9' }} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="applications" name="Applications" fill="#2563EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="interviews" name="Interviews" fill="#0F9D8A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="hires" name="Hires" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline summary */}
        <div className="lg:col-span-2 bg-sb-surface border border-sb-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-sb-text mb-4">Pipeline overview</h2>
          {pipeline.map(({ stage, count, color, pct }) => (
            <div key={stage} className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-sb-text-2">{stage}</span>
                <span className="font-semibold text-sb-text">{count}</span>
              </div>
              <div className="h-1.5 bg-sb-surface-2 rounded-full">
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="border-t border-sb-border pt-3 mt-4">
            <p className="text-xs text-sb-text-2">Active review rate</p>
            <p className="text-xl font-bold text-sb-text">
              {totalAppCount > 0 ? ((pipelineCounts.shortlisted + pipelineCounts.underReview + pipelineCounts.selected) / totalAppCount * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-xs text-[#0F9D8A] mt-0.5">Across all active postings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active jobs */}
        <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-sb-border">
            <h2 className="text-base font-semibold text-sb-text">Active jobs</h2>
            <button onClick={() => navigate('my-jobs')} className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline flex items-center gap-1">
              Manage all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recruiterJobs.map((job, i) => (
              <div key={job.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recruiterJobs.length - 1 ? 'border-b border-sb-border' : ''}`}>
                <div className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: job.companyColor }}>
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sb-text truncate">{job.title}</p>
                  <p className="text-xs text-sb-text-2">{job.applicants} applicants · {job.status}</p>
                </div>
                <button onClick={() => navigate('applicants')} className="text-xs text-[#2563EB] dark:text-[#3B82F6] shrink-0 hover:underline">
                  Review
                </button>
              </div>
            ))}
            {recruiterJobs.length === 0 && (
              <div className="p-6 text-center text-sm text-sb-text-2">
                No active jobs posted yet.{' '}
                <button onClick={() => navigate('post-job')} className="text-[#2563EB] dark:text-[#3B82F6] hover:underline">Post a job</button>
              </div>
            )}
          </div>
        </div>

        {/* Recent applicants */}
        <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-sb-border">
            <h2 className="text-base font-semibold text-sb-text">Recent applicants</h2>
            <button onClick={() => navigate('applicants')} className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recentApplicants.length > 0 ? (
              recentApplicants.map((ap, i) => (
                <div key={ap.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recentApplicants.length - 1 ? 'border-b border-sb-border' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-[#163A5F] flex items-center justify-center text-white font-semibold text-xs shrink-0">
                    {ap.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sb-text truncate">{ap.name}</p>
                    <p className="text-xs text-sb-text-2">{ap.university} · {ap.jobTitle}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[ap.status] || STATUS_COLORS.Applied}`}>
                    {ap.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-sb-text-2">
                No applicants yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
