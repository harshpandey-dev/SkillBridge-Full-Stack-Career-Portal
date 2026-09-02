import { useState, useEffect } from 'react'
import type { NavUser, Application, Job } from '../../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { BriefcaseIcon, CheckIcon, TrendingUpIcon, EyeIcon, ChevronRightIcon } from '../../components/icons'
import { applicationService } from '../../services/application.service'
import { jobService } from '../../services/job.service'
import { savedJobService } from '../../services/savedJob.service'
import { studentProfileService } from '../../services/studentProfile.service'

const TrendingUpIconLocal = TrendingUpIcon

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-[#EFF6FF] text-[#2563EB]',
  'Under Review': 'bg-[#FFFBEB] text-[#D97706]',
  Shortlisted: 'bg-[#E6F7F5] text-[#0F9D8A]',
  Rejected: 'bg-[#FEF2F2] text-[#DC2626]',
  Selected: 'bg-[#ECFDF5] text-[#059669]',
}

interface Props {
  user: NavUser
  navigate: (page: string, jobId?: string) => void
}

export default function StudentDashboard({ user, navigate }: Props) {
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [savedCount, setSavedCount] = useState(0)
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [appResult, jobResult, savedResult, compResult] = await Promise.all([
          applicationService.getMyApplications({ limit: 20 }),
          jobService.getJobs({ limit: 4 }),
          savedJobService.getMySavedJobs({ limit: 1 }).catch(() => ({ total: 0 })),
          studentProfileService.getProfileCompletion().catch(() => ({ completionPercentage: 0 })),
        ])
        setApplications(appResult.items)
        setJobs(jobResult.jobs)
        setSavedCount(savedResult.total)
        setCompletionPercentage(compResult.completionPercentage || 0)
      } catch {
        // Fallback gracefully
      }
    }
    loadDashboardData()
  }, [])

  const recent = applications.slice(0, 4)
  const latestJobs = jobs.slice(0, 4)

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'Shortlisted').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    underReview: applications.filter(a => a.status === 'Under Review').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    applied: applications.filter(a => a.status === 'Applied').length,
    saved: savedCount,
  }

  const breakdown = [
    { label: 'Applied', count: stats.applied, pct: stats.total ? Math.round((stats.applied / stats.total) * 100) : 0, color: '#2563EB' },
    { label: 'Under Review', count: stats.underReview, pct: stats.total ? Math.round((stats.underReview / stats.total) * 100) : 0, color: '#D97706' },
    { label: 'Shortlisted', count: stats.shortlisted, pct: stats.total ? Math.round((stats.shortlisted / stats.total) * 100) : 0, color: '#0F9D8A' },
    { label: 'Rejected', count: stats.rejected, pct: stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0, color: '#DC2626' },
  ]

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const mName = monthNames[d.getMonth()]
    const monthApps = applications.filter(a => {
      const appDate = new Date(a.appliedDate || Date.now())
      return appDate.getFullYear() === d.getFullYear() && appDate.getMonth() === d.getMonth()
    })
    return {
      month: mName,
      applied: monthApps.length,
      reviews: monthApps.filter(a => a.status === 'Under Review' || a.status === 'Shortlisted' || a.status === 'Selected').length,
    }
  })

  const responseRate = stats.total > 0
    ? (((stats.shortlisted + stats.selected + stats.underReview + stats.rejected) / stats.total) * 100).toFixed(1)
    : '0.0'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'ST'

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Good morning, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-[#667085] mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => navigate('opportunities')}
          className="bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shrink-0"
        >
          Browse jobs
        </button>
      </div>

      {/* Profile completion */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#BFDBFE]" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#163A5F] flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-[#172033]">Complete your profile to increase visibility</p>
            <p className="text-xs text-[#667085] mt-0.5">Recruiters with complete profiles get 3× more views</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-[#2563EB]">{completionPercentage}%</span>
            <div className="w-28 h-1.5 bg-[#BFDBFE] rounded-full mt-1">
              <div
                className="h-1.5 bg-[#2563EB] rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => navigate('student-profile')}
            className="text-xs font-medium text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded hover:bg-[#2563EB] hover:text-white transition-colors"
          >
            Complete profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total applications', value: stats.total, icon: BriefcaseIcon, color: 'bg-[#EFF6FF] text-[#2563EB]', trend: '+3 this week', action: () => navigate('applications') },
          { label: 'Shortlisted', value: stats.shortlisted, icon: CheckIcon, color: 'bg-[#E6F7F5] text-[#0F9D8A]', trend: 'Active', action: () => navigate('applications') },
          { label: 'Offers received', value: stats.selected, icon: TrendingUpIconLocal, color: 'bg-[#ECFDF5] text-[#059669]', trend: 'Congratulations!', action: () => navigate('applications') },
          { label: 'Saved jobs', value: stats.saved, icon: EyeIcon, color: 'bg-[#F2F4F7] text-[#667085]', trend: 'View saved', action: () => navigate('saved-jobs') },
        ].map(({ label, value, icon: Icon, color, trend, action }) => (
          <button
            key={label}
            onClick={action}
            className="bg-white border border-[#E4E7EC] rounded-lg p-5 text-left hover:border-[#2563EB] hover:shadow-sm transition-all"
          >
            <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="text-2xl font-bold text-[#172033]">{value}</div>
            <div className="text-sm text-[#667085] mt-0.5">{label}</div>
            <div className="text-xs text-[#94A3B8] mt-2">{trend}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#172033]">Application activity</h2>
              <p className="text-xs text-[#667085] mt-0.5">Last 6 months</p>
            </div>
            <select className="text-xs text-[#667085] border border-[#E4E7EC] rounded px-2 py-1 bg-white outline-none">
              <option>Last 6 months</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="applied" name="Applied" stroke="#2563EB" strokeWidth={2} fill="url(#colorApplied)" dot={false} />
              <Area type="monotone" dataKey="reviews" name="In review" stroke="#0F9D8A" strokeWidth={2} fill="url(#colorReviews)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[#172033] mb-4">Application breakdown</h2>
          {breakdown.map(({ label, count, pct, color }) => (
            <div key={label} className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[#667085]">{label}</span>
                <span className="font-semibold text-[#172033]">{count}</span>
              </div>
              <div className="h-1.5 bg-[#F2F4F7] rounded-full">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="border-t border-[#F2F4F7] pt-3 mt-4">
            <p className="text-xs text-[#667085]">Response rate</p>
            <p className="text-xl font-bold text-[#172033] mt-0.5">{responseRate}%</p>
            <p className="text-xs text-[#0F9D8A]">↑ Above average for your field</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent applications */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
            <h2 className="text-base font-semibold text-[#172033]">Recent applications</h2>
            <button onClick={() => navigate('applications')} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recent.length > 0 ? (
              recent.map((app, i) => (
                <div key={app.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recent.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}>
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: app.companyColor }}
                  >
                    {app.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#172033] truncate">{app.jobTitle}</p>
                    <p className="text-xs text-[#667085]">{app.company} · {app.appliedDate}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[app.status] || STATUS_COLORS.Applied}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-[#667085]">
                No applications submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Latest jobs */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
            <h2 className="text-base font-semibold text-[#172033]">Jobs for you</h2>
            <button onClick={() => navigate('opportunities')} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {latestJobs.length > 0 ? (
              latestJobs.map((job, i) => (
                <div key={job.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < latestJobs.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}>
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: job.companyColor }}
                  >
                    {job.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#172033] truncate">{job.title}</p>
                    <p className="text-xs text-[#667085]">{job.company} · {job.salary}</p>
                  </div>
                  <button
                    onClick={() => navigate('job-details', job.id)}
                    className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] shrink-0 transition-colors"
                  >
                    View →
                  </button>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-[#667085]">
                No jobs available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
