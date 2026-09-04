import { useState, useEffect, useCallback } from 'react'
import type { NavUser } from '../../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  UsersIcon, BriefcaseIcon, TrendingUpIcon, ChevronRightIcon, AlertCircleIcon,
} from '../../components/icons'
import {
  adminService,
  type AdminDashboardStats,
  type PlatformAnalytics,
  type GrowthDataPoint,
} from '../../services/admin.service'
import { getApiErrorMessage } from '../../lib/api'

const TrendingIcon = TrendingUpIcon

const STATUS_CONFIG: Record<string, string> = {
  ACTIVE: 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]',
  Active: 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]',
  SUSPENDED: 'bg-[#FEF2F2] dark:bg-[#3B0A0A] text-[#DC2626] dark:text-[#F87171]',
  Suspended: 'bg-[#FEF2F2] dark:bg-[#3B0A0A] text-[#DC2626] dark:text-[#F87171]',
  PENDING: 'bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706]',
  Pending: 'bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706]',
}

interface Props {
  user: NavUser
  navigate: (page: string) => void
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSec < 60) return 'Just now'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return 'Recently'
  }
}

export default function AdminDashboard({ user: _user, navigate }: Props) {
  const [dashboard, setDashboard] = useState<AdminDashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([])
  const [growthDays, setGrowthDays] = useState<number>(30)

  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [statsRes, analyticsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAnalytics().catch(() => null),
      ])
      setDashboard(statsRes)
      setAnalytics(analyticsRes)
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Unable to load dashboard data.'))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadGrowth = useCallback(async (days: number) => {
    try {
      setChartLoading(true)
      const res = await adminService.getGrowthAnalytics(days)
      setGrowthData(res.data)
    } catch {
      // Keep previous data on transient error
    } finally {
      setChartLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    loadGrowth(growthDays)
  }, [growthDays, loadGrowth])

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1200px] animate-pulse">
        <div className="h-8 bg-sb-surface-2 rounded w-52" />
        <div className="h-14 bg-sb-surface-2 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-sb-surface border border-sb-border rounded-lg p-5 h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-sb-surface border border-sb-border rounded-lg h-72" />
          <div className="bg-sb-surface border border-sb-border rounded-lg h-72" />
        </div>
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6 max-w-[1200px]">
        <div>
          <h1 className="text-2xl font-bold text-sb-text">Admin Dashboard</h1>
          <p className="text-sm text-sb-text-2 mt-0.5">Platform overview and management</p>
        </div>
        <div className="bg-[#FEF2F2] dark:bg-[#3B0A0A] border border-[#FECACA] dark:border-[#7F1D1D] rounded-lg p-6 text-center">
          <p className="text-sm text-[#DC2626] dark:text-[#F87171] font-medium">{error || 'Failed to load dashboard metrics.'}</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { users, jobs, applications } = dashboard

  const stats = [
    {
      label: 'Total students',
      value: users.students.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-sb-brand-bg text-[#2563EB] dark:text-[#3B82F6]',
      change: `${users.active} active platform users`,
    },
    {
      label: 'Active recruiters',
      value: users.recruiters.toLocaleString(),
      icon: BriefcaseIcon,
      color: 'bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A]',
      change: `${users.pending} pending verification`,
    },
    {
      label: 'Open jobs',
      value: jobs.open.toLocaleString(),
      icon: BriefcaseIcon,
      color: 'bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706]',
      change: `${jobs.total} total listings`,
    },
    {
      label: 'Total applications',
      value: applications.total.toLocaleString(),
      icon: TrendingIcon,
      color: 'bg-[#ECFDF5] dark:bg-[#052E16] text-[#059669]',
      change: `${applications.underReview + applications.shortlisted} under review / shortlisted`,
    },
  ]

  const recentUsers = analytics?.recentActivity?.recentUsers || []
  const recentApplications = analytics?.recentActivity?.recentApplications || []
  const recentJobs = analytics?.recentActivity?.recentJobs || []

  // Combine real recent events for activity feed
  const combinedActivity = [
    ...recentApplications.map(a => ({
      time: formatRelativeTime(a.appliedAt),
      event: `${a.student.user.name} applied to ${a.job.title} at ${a.job.company.name}`,
      type: 'application',
      timestamp: new Date(a.appliedAt).getTime(),
    })),
    ...recentJobs.map(j => ({
      time: formatRelativeTime(j.createdAt),
      event: `New job posted: ${j.title} (${j.jobType}) at ${j.company.name}`,
      type: 'job',
      timestamp: new Date(j.createdAt).getTime(),
    })),
    ...recentUsers.map(u => ({
      time: formatRelativeTime(u.createdAt),
      event: `New ${u.role.toLowerCase()} registered: ${u.name}`,
      type: 'user',
      timestamp: new Date(u.createdAt).getTime(),
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 6)

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">Admin Dashboard</h1>
        <p className="text-sm text-sb-text-2 mt-0.5">Platform overview and management</p>
      </div>

      {/* Alert */}
      {users.pending > 0 && (
        <div className="bg-[#FFFBEB] dark:bg-[#2D1B00] border border-[#FDE68A] dark:border-[#78350F] rounded-lg p-3 flex items-center gap-3">
          <AlertCircleIcon size={16} className="text-[#D97706] shrink-0" />
          <p className="text-sm text-[#D97706]">
            <span className="font-semibold">{users.pending} users pending review</span> — recruiter accounts awaiting verification.{' '}
            <button onClick={() => navigate('user-management')} className="underline font-medium">Review now</button>
          </p>
        </div>
      )}

      {/* Stats Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Growth chart */}
        <div className="lg:col-span-2 bg-sb-surface border border-sb-border rounded-lg p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-sb-text">Platform growth</h2>
              <p className="text-xs text-sb-text-2 mt-0.5">Daily activity and onboarding registrations</p>
            </div>
            <div className="flex items-center gap-1 bg-sb-surface-2 p-1 rounded border border-sb-border">
              {[7, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setGrowthDays(days)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    growthDays === days
                      ? 'bg-sb-surface text-[#2563EB] dark:text-[#3B82F6] shadow-xs'
                      : 'text-sb-text-2 hover:text-sb-text'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          <div className="h-56 relative">
            {chartLoading && (
              <div className="absolute inset-0 bg-sb-surface/60 flex items-center justify-center z-10 text-xs text-sb-text-2">
                Updating chart…
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 0, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: '1px solid #2D3344', borderRadius: '6px', fontSize: '12px', backgroundColor: '#1A1F2E', color: '#F1F5F9' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="newUsers" name="New Users" stroke="#2563EB" strokeWidth={2} fill="url(#colorUsers)" dot={false} />
                <Area type="monotone" dataKey="newApplications" name="Applications" stroke="#0F9D8A" strokeWidth={2} fill="url(#colorApplications)" dot={false} />
                <Area type="monotone" dataKey="newJobs" name="Jobs" stroke="#D97706" strokeWidth={2} fill="url(#colorJobs)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-sb-surface border border-sb-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-sb-text mb-4">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Review pending users', count: users.pending, page: 'user-management', urgent: users.pending > 0 },
              { label: 'Moderate draft jobs', count: jobs.draft, page: 'job-management', urgent: jobs.draft > 0 },
              { label: 'Manage learning catalog', count: dashboard.resources.total, page: 'admin-learning', urgent: false },
              { label: 'View all students', count: users.students, page: 'user-management', urgent: false },
              { label: 'View all recruiters', count: users.recruiters, page: 'user-management', urgent: false },
            ].map(({ label, count, page, urgent }) => (
              <button
                key={label}
                onClick={() => navigate(page)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded border border-sb-border hover:bg-sb-surface-2 hover:border-sb-border-2 transition-all text-left"
              >
                <span className={`text-sm font-medium ${urgent ? 'text-[#D97706]' : 'text-sb-text'}`}>{label}</span>
                {count !== null && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgent ? 'bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706]' : 'bg-sb-surface-2 text-sb-text-2'}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent registrations */}
        <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-sb-border">
            <h2 className="text-base font-semibold text-sb-text">Recent registrations</h2>
            <button onClick={() => navigate('user-management')} className="text-xs text-[#2563EB] dark:text-[#3B82F6] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-sb-text-2">No users registered yet</div>
            ) : (
              recentUsers.slice(0, 5).map((u, i) => (
                <div key={u.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < Math.min(recentUsers.length, 5) - 1 ? 'border-b border-sb-border' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sb-text truncate">{u.name}</p>
                    <p className="text-xs text-sb-text-2">{u.email} · {formatRelativeTime(u.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sb-surface-2 text-sb-text-2 lowercase">
                      {u.role}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[u.status] || STATUS_CONFIG.Active}`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-sb-surface border border-sb-border rounded-lg p-5">
          <h2 className="text-base font-semibold text-sb-text mb-4">Recent activity</h2>
          <div className="space-y-3">
            {combinedActivity.length === 0 ? (
              <p className="text-xs text-sb-text-2 py-4 text-center">No recent platform activity recorded</p>
            ) : (
              combinedActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.type === 'application' ? 'bg-[#2563EB]' : a.type === 'job' ? 'bg-[#0F9D8A]' : a.type === 'user' ? 'bg-[#D97706]' : 'bg-[#94A3B8]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-sb-text leading-snug">{a.event}</p>
                    <p className="text-xs text-sb-text-3 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
