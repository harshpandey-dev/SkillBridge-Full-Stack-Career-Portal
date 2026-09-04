import { useState, useEffect, useRef } from 'react'
import type { NavUser } from '../types'
import { MenuIcon, XIcon, SunIcon, MoonIcon } from './icons'
import { useTheme } from '../context/ThemeContext'

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
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close menu on nav
  const handleNav = (page: string) => {
    navigate(page)
    setMobileMenuOpen(false)
  }

  // Close mobile menu on ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-sb-surface border-b border-sb-border sticky top-0 z-40" ref={menuRef}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 bg-[#163A5F] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm tracking-tight">SB</span>
            </div>
            <span className="font-bold text-[#163A5F] dark:text-white text-lg tracking-tight">SkillBridge</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => handleNav(link.page)}
                className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                  currentPage === link.page
                    ? 'text-[#2563EB] dark:text-[#3B82F6] bg-sb-brand-bg'
                    : 'text-sb-text-2 hover:text-sb-text hover:bg-sb-surface-2'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded text-sb-text-2 hover:bg-sb-surface-2 hover:text-sb-text transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {resolvedTheme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            {user ? (
              <>
                <button
                  onClick={() => handleNav(
                    user.role === 'student'
                      ? 'student-dashboard'
                      : user.role === 'recruiter'
                        ? 'recruiter-dashboard'
                        : 'admin-dashboard'
                  )}
                  className="text-sm font-medium text-[#163A5F] dark:text-white hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors px-3 py-2"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  className="text-sm text-sb-text-2 hover:text-sb-text transition-colors px-3 py-2"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('login')}
                  className="text-sm font-medium text-sb-text hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors px-3 py-2"
                >
                  Log in
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="text-sm font-medium bg-[#163A5F] text-white px-4 py-2 rounded hover:bg-[#0F2A45] transition-colors"
                >
                  Sign up free
                </button>
              </>
            )}
          </div>

          {/* Mobile: Theme toggle + Hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded text-sb-text-2 hover:bg-sb-surface-2 hover:text-sb-text transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolvedTheme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded text-sb-text-2 hover:bg-sb-surface-2 hover:text-sb-text transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu — slide-down dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sb-border bg-sb-surface">
            <div className="max-w-[1280px] mx-auto px-4 py-3 space-y-1">
              {NAV_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.page)}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    currentPage === link.page
                      ? 'text-[#2563EB] dark:text-[#3B82F6] bg-sb-brand-bg'
                      : 'text-sb-text hover:bg-sb-surface-2'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-2 border-t border-sb-border mt-2 space-y-1">
                {user ? (
                  <>
                    <button
                      onClick={() => handleNav(
                        user.role === 'student'
                          ? 'student-dashboard'
                          : user.role === 'recruiter'
                            ? 'recruiter-dashboard'
                            : 'admin-dashboard'
                      )}
                      className="w-full text-left px-3 py-2.5 rounded text-sm font-medium text-sb-text hover:bg-sb-surface-2 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { onLogout(); setMobileMenuOpen(false) }}
                      className="w-full text-left px-3 py-2.5 rounded text-sm text-sb-text-2 hover:text-sb-text hover:bg-sb-surface-2 transition-colors"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNav('login')}
                      className="w-full text-left px-3 py-2.5 rounded text-sm font-medium text-sb-text hover:bg-sb-surface-2 transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => handleNav('register')}
                      className="w-full text-left px-3 py-2.5 rounded text-sm font-semibold bg-[#163A5F] text-white hover:bg-[#0F2A45] transition-colors"
                    >
                      Sign up free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-[#172033] dark:bg-[#0A0E17] text-white mt-auto">
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
