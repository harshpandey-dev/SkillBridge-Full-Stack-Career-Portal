import { JOBS, APPLICANTS, CHART_DATA, CURRENT_RECRUITER } from '../../mockData'
import type { NavUser } from '../../types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts'
import { BriefcaseIcon, UsersIcon, ChevronRightIcon, PlusIcon, TrendingUpIcon } from '../../components/icons'

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
  const recruiterJobs = JOBS.filter(j => j.recruiterId === 'r1').slice(0, 5)
  const recentApplicants = APPLICANTS.slice(0, 5)

  const stats = [
    { label: 'Active job postings', value: recruiterJobs.length, icon: BriefcaseIcon, color: 'bg-[#EFF6FF] text-[#2563EB]', change: '+2 this month' },
    { label: 'Total applicants', value: APPLICANTS.length, icon: UsersIcon, color: 'bg-[#E6F7F5] text-[#0F9D8A]', change: '+34 this week' },
    { label: 'Interviews scheduled', value: 8, icon: TrendingUpIcon2, color: 'bg-[#FFFBEB] text-[#D97706]', change: '3 this week' },
    { label: 'Hires made', value: 2, icon: TrendingUpIcon2, color: 'bg-[#ECFDF5] text-[#059669]', change: 'This quarter' },
  ]

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-[#667085] mt-0.5">{CURRENT_RECRUITER.company} · {CURRENT_RECRUITER.position}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Applications chart */}
        <div className="lg:col-span-3 bg-white border border-[#E4E7EC] rounded-lg p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-[#172033]">Applications by job</h2>
              <p className="text-xs text-[#667085] mt-0.5">Applications, interviews, and hires</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={CHART_DATA.recruiterApplications} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #E4E7EC', borderRadius: '6px', fontSize: '12px' }} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="applications" name="Applications" fill="#2563EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="interviews" name="Interviews" fill="#0F9D8A" radius={[2, 2, 0, 0]} />
              <Bar dataKey="hires" name="Hires" fill="#163A5F" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline summary */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-lg p-5">
          <h2 className="text-base font-semibold text-[#172033] mb-4">Pipeline overview</h2>
          {[
            { stage: 'Applied', count: 12, color: '#2563EB', pct: 100 },
            { stage: 'Under Review', count: 8, color: '#D97706', pct: 67 },
            { stage: 'Shortlisted', count: 5, color: '#0F9D8A', pct: 42 },
            { stage: 'Interviewed', count: 3, color: '#163A5F', pct: 25 },
            { stage: 'Hired', count: 2, color: '#059669', pct: 17 },
          ].map(({ stage, count, color, pct }) => (
            <div key={stage} className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-[#667085]">{stage}</span>
                <span className="font-semibold text-[#172033]">{count}</span>
              </div>
              <div className="h-1.5 bg-[#F2F4F7] rounded-full">
                <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="border-t border-[#F2F4F7] pt-3 mt-4">
            <p className="text-xs text-[#667085]">Conversion rate</p>
            <p className="text-xl font-bold text-[#172033]">16.7%</p>
            <p className="text-xs text-[#0F9D8A] mt-0.5">↑ +2.3% vs. last quarter</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active jobs */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
            <h2 className="text-base font-semibold text-[#172033]">Active jobs</h2>
            <button onClick={() => navigate('my-jobs')} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
              Manage all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recruiterJobs.map((job, i) => (
              <div key={job.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recruiterJobs.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}>
                <div className="w-9 h-9 rounded flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ backgroundColor: job.companyColor }}>
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#172033] truncate">{job.title}</p>
                  <p className="text-xs text-[#667085]">{job.applicants} applicants · {job.status}</p>
                </div>
                <button onClick={() => navigate('applicants')} className="text-xs text-[#2563EB] shrink-0 hover:underline">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applicants */}
        <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F2F4F7]">
            <h2 className="text-base font-semibold text-[#172033]">Recent applicants</h2>
            <button onClick={() => navigate('applicants')} className="text-xs text-[#2563EB] hover:underline flex items-center gap-1">
              View all <ChevronRightIcon size={13} />
            </button>
          </div>
          <div>
            {recentApplicants.map((ap, i) => (
              <div key={ap.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < recentApplicants.length - 1 ? 'border-b border-[#F2F4F7]' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-[#163A5F] flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  {ap.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#172033] truncate">{ap.name}</p>
                  <p className="text-xs text-[#667085]">{ap.university} · {ap.jobTitle}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[ap.status]}`}>
                  {ap.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
