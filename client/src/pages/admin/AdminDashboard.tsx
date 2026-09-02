import { ALL_USERS, JOBS, MY_APPLICATIONS, CHART_DATA } from '../../mockData'
import type { NavUser } from '../../types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { UsersIcon, BriefcaseIcon, TrendingUpIcon, ChevronRightIcon, AlertCircleIcon } from '../../components/icons'

const TrendingIcon = TrendingUpIcon

const STATUS_CONFIG: Record<string, string> = {
  Active: 'bg-[#E6F7F5] text-[#0F9D8A]',
  Suspended: 'bg-[#FEF2F2] text-[#DC2626]',
  Pending: 'bg-[#FFFBEB] text-[#D97706]',
}

interface Props {
  user: NavUser
  navigate: (page: string) => void
}

export default function AdminDashboard({ user: _user, navigate }: Props) {
  const students = ALL_USERS.filter(u => u.role === 'student')
  const recruiters = ALL_USERS.filter(u => u.role === 'recruiter')
  const activeJobs = JOBS.filter(j => j.status === 'Open')
  const totalApplications = MY_APPLICATIONS.length + 285

  const stats = [
    { label: 'Total students', value: students.length.toLocaleString(), icon: UsersIcon, color: 'bg-[#EFF6FF] text-[#2563EB]', change: '+128 this month' },
    { label: 'Active recruiters', value: recruiters.length.toLocaleString(), icon: BriefcaseIcon, color: 'bg-[#E6F7F5] text-[#0F9D8A]', change: '+8 this month' },
    { label: 'Open jobs', value: activeJobs.length.toLocaleString(), icon: BriefcaseIcon, color: 'bg-[#FFFBEB] text-[#D97706]', change: '4 added today' },
    { label: 'Total applications', value: totalApplications.toLocaleString(), icon: TrendingIcon, color: 'bg-[#ECFDF5] text-[#059669]', change: '+491 this week' },
  ]

  const recentUsers = ALL_USERS.slice(0, 5)

  const ACTIVITY = [
    { time: '2 min ago', event: 'Sarah Johnson applied to Product Designer at Figma', type: 'application' },
    { time: '8 min ago', event: 'Riley Brown (Microsoft) posted a new internship listing', type: 'job' },
    { time: '15 min ago', event: 'New recruiter registered: Casey Taylor from Google', type: 'user' },
    { time: '24 min ago', event: 'Emma Davis profile marked complete (85%)', type: 'profile' },
    { time: '1 hr ago', event: 'Priya Patel shortlisted for ML Engineer at OpenAI', type: 'status' },
    { time: '2 hrs ago', event: 'Learning resource "Deep Learning Specialization" reached 400k enrollees', type: 'resource' },
  ]

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">Admin Dashboard</h1>
        <p className="text-sm text-[#667085] mt-0.5">Platform overview and management</p>
      </div>

      {/* Alert */}
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3 flex items-center gap-3">
        <AlertCircleIcon size={16} className="text-[#D97706] shrink-0" />
        <p className="text-sm text-[#D97706]">
          <span className="font-semibold">4 users pending review</span> — new recruiter accounts awaiting verification.{' '}
          <button onClick={() => navigate('user-management')} className="underline font-medium">Review now</button>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className={`w-9 h-9 rounded flex items-center justify-center mb-3 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="text-2xl font-bold text-[#172033]">{value}</div>
            <div className="text-sm text-[#667085] mt-0.5">{label}</div>
            <div className="text-xs text-[#94A3B8] mt-2">{change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Growth chart */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#172033]">Platform growth</h2>
              <p className="text-xs text-[#667085] mt-0.5">Student and recruiter registrations, last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={CHART_DATA.adminGrowth} margin={{ top: 0, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRecruiters" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D8A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F9D8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="students" name="Students" stroke="#2563EB" strokeWidth={2} fill="url(#colorStudents)" dot={false} />
              <Area type="monotone" dataKey="recruiters" name="Recruiters" stroke="#0F9D8A" strokeWidth={2} fill="url(#colorRecruiters)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[#172033] mb-4">Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Review pending users', count: 4, page: 'user-management', urgent: true },
              { label: 'Moderate flagged jobs', count: 2, page: 'job-management', urgent: true },
              { label: 'Add learning resource', count: null, page: 'admin-learning', urgent: false },
              { label: 'View all students', count: students.length, page: 'user-management', urgent: false },
              { label: 'View all recruiters', count: recruiters.length, page: 'user-management', urgent: false },
            ].map(({ label, count, page, urgent }) => (
              <button
                key={label}
                onClick={() => navigate(page)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded border border-[#E4E7EC] hover:bg-[#F7F8FA] hover:border-[#94A3B8] transition-all text-left"
              >
                <span className={`text-sm font-medium ${urgent ? 'text-[#D97706]' : 'text-[#172033]'}`}>{label}</span>
                {count !== null && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgent ? 'bg-[#FFFBEB] text-[#D97706]' : 'bg-[#F2F4F7] text-[#667085]'}`}>
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
        <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
            <h2 className="text-base font-semibold text-[#172033]">Recent registrations</h2>
            <button onClick={() => navigate('user-management')} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recentUsers.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recentUsers.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                  {u.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#172033] truncate">{u.name}</p>
                  <p className="text-xs text-[#667085]">{u.university ?? u.company ?? 'SkillBridge'} · {u.joined}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F2F4F7] text-[#667085] capitalize">{u.role}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[u.status]}`}>{u.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[#172033] mb-4">Recent activity</h2>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.type === 'application' ? 'bg-[#2563EB]' : a.type === 'job' ? 'bg-[#0F9D8A]' : a.type === 'user' ? 'bg-[#D97706]' : 'bg-[#94A3B8]'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#172033] leading-snug">{a.event}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
