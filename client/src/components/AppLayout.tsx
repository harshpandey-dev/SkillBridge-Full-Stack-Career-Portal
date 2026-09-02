import type { NavUser } from '../types'
import {
  HomeIcon, BriefcaseIcon, BookOpenIcon, UsersIcon, UserIcon,
  BellIcon, LogOutIcon, PlusIcon, EyeIcon, CheckIcon, BookmarkIcon,
} from './icons'

interface Props {
  user: NavUser
  currentPage: string
  navigate: (page: string) => void
  onLogout: () => void
  children: React.ReactNode
}

const STUDENT_NAV = [
  { label: 'Dashboard', page: 'student-dashboard', Icon: HomeIcon },
  { label: 'Opportunities', page: 'opportunities', Icon: BriefcaseIcon },
  { label: 'My Applications', page: 'applications', Icon: CheckIcon },
  { label: 'Saved Jobs', page: 'saved-jobs', Icon: BookmarkIcon },
  { label: 'Learning', page: 'learning', Icon: BookOpenIcon },
  { label: 'My Profile', page: 'student-profile', Icon: UserIcon },
]

const RECRUITER_NAV = [
  { label: 'Dashboard', page: 'recruiter-dashboard', Icon: HomeIcon },
  { label: 'My Jobs', page: 'my-jobs', Icon: BriefcaseIcon },
  { label: 'Post a Job', page: 'post-job', Icon: PlusIcon },
  { label: 'Applicants', page: 'applicants', Icon: UsersIcon },
  { label: 'My Profile', page: 'recruiter-profile', Icon: UserIcon },
]

const ADMIN_NAV = [
  { label: 'Dashboard', page: 'admin-dashboard', Icon: HomeIcon },
  { label: 'User Management', page: 'user-management', Icon: UsersIcon },
  { label: 'Job Management', page: 'job-management', Icon: BriefcaseIcon },
  { label: 'Learning Resources', page: 'admin-learning', Icon: BookOpenIcon },
]

function getRoleNav(role: string) {
  if (role === 'student') return STUDENT_NAV
  if (role === 'recruiter') return RECRUITER_NAV
  return ADMIN_NAV
}

function getRoleLabel(role: string) {
  if (role === 'student') return 'Student'
  if (role === 'recruiter') return 'Recruiter'
  return 'Administrator'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function AppLayout({ user, currentPage, navigate, onLogout, children }: Props) {
  const nav = getRoleNav(user.role)

  return (
    <div className="min-h-full flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#163A5F] flex flex-col shrink-0 fixed top-0 left-0 bottom-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-[rgba(255,255,255,0.08)]">
          <button onClick={() => navigate('landing')} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#2563EB] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">SB</span>
            </div>
            <span className="font-bold text-white text-base tracking-tight">SkillBridge</span>
          </button>
        </div>

        <div className="px-3 pt-2 pb-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[rgba(255,255,255,0.35)] px-2 mb-1">
            {getRoleLabel(user.role)}
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ label, page, Icon }) => {
            const active = currentPage === page
            return (
              <button
                key={label}
                onClick={() => navigate(page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all text-left ${
                  active
                    ? 'bg-[rgba(255,255,255,0.12)] text-white border-l-2 border-[#2563EB] pl-[10px]'
                    : 'text-[rgba(255,255,255,0.65)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-[rgba(255,255,255,0.08)] p-3 space-y-0.5">
          <button
            onClick={() => navigate('landing')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.07)] transition-all"
          >
            <EyeIcon size={16} />
            Public Site
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.07)] transition-all"
          >
            <LogOutIcon size={16} />
            Log out
          </button>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-[rgba(255,255,255,0.45)] truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-[#E4E7EC] sticky top-0 z-20 flex items-center px-6 justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[#667085]">
            {nav.find(n => n.page === currentPage)?.label || 'SkillBridge'}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded hover:bg-[#F7F8FA] text-[#667085] transition-colors">
              <BellIcon size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#2563EB] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#E4E7EC]">
              <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#172033] leading-tight">{user.name}</p>
                <p className="text-xs text-[#667085] leading-tight">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-[#F7F8FA]">{children}</main>
      </div>
    </div>
  )
}
