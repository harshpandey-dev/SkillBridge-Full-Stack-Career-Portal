import type { NavUser } from '../types'

interface Props {
  user: NavUser | null
  currentPage: string
  navigate: (page: string) => void
  onLogout: () => void
  children: React.ReactNode
}

const NAV_LINKS = [
  { label: 'Jobs', page: 'jobs' },
  { label: 'Internships', page: 'jobs' },
  { label: 'Learning', page: 'learning' },
]

export default function PublicLayout({ user, currentPage, navigate, onLogout, children }: Props) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-[#E4E7EC] sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 bg-[#163A5F] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">SB</span>
            </div>
            <span className="font-bold text-[#163A5F] text-lg tracking-tight">SkillBridge</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.page)}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                  currentPage === link.page
                    ? 'text-[#2563EB] bg-[#EFF6FF]'
                    : 'text-[#667085] hover:text-[#172033] hover:bg-[#F7F8FA]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <>
                <button
                  onClick={() => navigate(user.role === 'student' ? 'student-dashboard' : user.role === 'recruiter' ? 'recruiter-dashboard' : 'admin-dashboard')}
                  className="text-sm font-medium text-[#163A5F] hover:text-[#2563EB] transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="text-sm text-[#667085] hover:text-[#172033] transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('login')}
                  className="text-sm font-medium text-[#172033] hover:text-[#2563EB] transition-colors px-3 py-2"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate('register')}
                  className="text-sm font-medium bg-[#163A5F] text-white px-4 py-2 rounded hover:bg-[#0F2A45] transition-colors"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#172033] text-white mt-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#2563EB] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SB</span>
                </div>
                <span className="font-bold text-white text-base">SkillBridge</span>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-xs">
                Connecting ambitious students with top employers. Your career journey starts here.
              </p>
              <div className="flex gap-3 mt-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                  <a key={s} href="#" className="text-xs text-[#94A3B8] hover:text-white transition-colors">{s}</a>
                ))}
              </div>
            </div>
            {[
              { heading: 'For Students', links: ['Browse Jobs', 'Internships', 'Career Resources', 'Skill Assessments', 'Resume Builder'] },
              { heading: 'For Recruiters', links: ['Post a Job', 'Search Talent', 'ATS Integration', 'Campus Hiring', 'Pricing'] },
              { heading: 'Company', links: ['About Us', 'Blog', 'Press', 'Careers', 'Contact'] },
            ].map(col => (
              <div key={col.heading}>
                <h4 className="text-sm font-semibold text-white mb-3">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm text-[#94A3B8] hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#2D3A4A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-[#64748B]">© 2026 SkillBridge, Inc. All rights reserved.</p>
            <div className="flex gap-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map(l => (
                <a key={l} href="#" className="text-xs text-[#64748B] hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
