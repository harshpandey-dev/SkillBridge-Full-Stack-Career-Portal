import { useRef, useEffect, useState, useCallback } from 'react'
import type { NavUser } from '../types'
import {
  HomeIcon, BriefcaseIcon, BookOpenIcon, UsersIcon, UserIcon,
  BellIcon, LogOutIcon, PlusIcon, EyeIcon, CheckIcon, BookmarkIcon,
  TrashIcon, AlertCircleIcon, SunIcon, MoonIcon, MenuIcon, XIcon,
} from './icons'
import { useNotifications } from '../context/NotificationContext'
import { useTheme } from '../context/ThemeContext'

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

function NotificationTypeIcon({ type }: { type: string }) {
  if (type === 'NEW_APPLICATION') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A5F] text-[#2563EB] dark:text-[#3B82F6] flex items-center justify-center shrink-0">
        <UsersIcon size={14} />
      </div>
    )
  }
  if (type === 'APPLICATION_STATUS_UPDATE') {
    return (
      <div className="w-8 h-8 rounded-full bg-[#E6F7F5] dark:bg-[#042F2E] text-[#0F9D8A] flex items-center justify-center shrink-0">
        <CheckIcon size={14} />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-[#FFFBEB] dark:bg-[#2D1B00] text-[#D97706] flex items-center justify-center shrink-0">
      <AlertCircleIcon size={14} />
    </div>
  )
}

export default function AppLayout({ user, currentPage, navigate, onLogout, children }: Props) {
  const nav = getRoleNav(user.role)
  const { resolvedTheme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const {
    notifications,
    unreadCount,
    loading,
    actionLoading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const bellButtonRef = useRef<HTMLButtonElement | null>(null)

  // Click outside listener to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen])

  // Close sidebar on ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleNavClick = useCallback((page: string) => {
    navigate(page)
    setSidebarOpen(false) // auto-close on mobile after nav
  }, [navigate])

  // Sidebar content — shared between desktop fixed and mobile drawer
  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[rgba(255,255,255,0.08)]">
        <button onClick={() => handleNavClick('landing')} className="flex items-center gap-2">
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

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, page, Icon }) => {
          const active = currentPage === page
          return (
            <button
              key={label}
              onClick={() => handleNavClick(page)}
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

      {/* Bottom actions */}
      <div className="border-t border-[rgba(255,255,255,0.08)] p-3 space-y-0.5">
        <button
          onClick={() => handleNavClick('landing')}
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

      {/* User info */}
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
    </>
  )

  return (
    <div className="min-h-full flex">

      {/* ── Desktop Sidebar (lg+) — fixed, always visible ─────────────────── */}
      <aside className="w-60 bg-[#163A5F] flex flex-col shrink-0 fixed top-0 left-0 bottom-0 z-30 hidden lg:flex">
        {SidebarContent}
      </aside>

      {/* ── Mobile Sidebar Drawer (below lg) ────────────────────────────── */}
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-60 bg-[#163A5F] flex flex-col z-50 lg:hidden sidebar-transition ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation sidebar"
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-3 p-1.5 rounded text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.07)] transition-colors"
          aria-label="Close navigation menu"
        >
          <XIcon size={16} />
        </button>
        {SidebarContent}
      </aside>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* Header */}
        <header className="h-16 bg-sb-surface border-b border-sb-border sticky top-0 z-20 flex items-center px-4 sm:px-6 justify-between gap-4">

          {/* Left: Hamburger (mobile) + Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded text-sb-text-2 hover:bg-sb-surface-2 hover:text-sb-text transition-colors"
              aria-label="Open navigation menu"
            >
              <MenuIcon size={20} />
            </button>

            {/* Page breadcrumb */}
            <span className="text-sm text-sb-text-2">
              {nav.find(n => n.page === currentPage)?.label || 'SkillBridge'}
            </span>
          </div>

          {/* Right: Theme toggle + Notifications + User */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {resolvedTheme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
            </button>

            {/* Notification Bell & Dropdown Anchor */}
            <div className="relative">
              <button
                ref={bellButtonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded hover:bg-sb-surface-2 transition-colors ${
                  isOpen ? 'bg-sb-surface-2 text-sb-text' : 'text-sb-text-2'
                }`}
                title="Notifications"
              >
                <BellIcon size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#2563EB] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-sb-surface">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-sb-surface border border-sb-border rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  {/* Panel Header */}
                  <div className="p-3.5 border-b border-sb-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-sb-text">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[11px] bg-sb-brand-bg text-sb-brand font-semibold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={markAllAsRead}
                          className="text-xs font-medium text-[#2563EB] dark:text-[#3B82F6] hover:underline disabled:opacity-50"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <>
                          <span className="text-xs text-sb-text-3">·</span>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={clearAll}
                            className="text-xs font-medium text-sb-text-2 hover:text-[#DC2626] disabled:opacity-50"
                          >
                            Clear all
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Panel Content */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-sb-border">
                    {loading ? (
                      <div className="p-4 space-y-3">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="flex gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-full bg-sb-surface-2 shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-3.5 bg-sb-surface-2 rounded w-3/4" />
                              <div className="h-3 bg-sb-surface-2 rounded w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 mx-auto rounded-full bg-sb-surface-2 text-sb-text-2 flex items-center justify-center mb-2">
                          <BellIcon size={18} />
                        </div>
                        <p className="text-sm font-semibold text-sb-text">No notifications yet</p>
                        <p className="text-xs text-sb-text-2 mt-1">
                          We'll notify you when something important happens.
                        </p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group relative ${
                            !n.isRead
                              ? 'bg-sb-surface-2 hover:bg-sb-surface-3'
                              : 'hover:bg-sb-surface-2'
                          }`}
                        >
                          <NotificationTypeIcon type={n.type} />

                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-xs ${!n.isRead ? 'font-bold text-sb-text' : 'font-medium text-sb-text'}`}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-sb-text-2 mt-0.5 leading-relaxed break-words">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-sb-text-3 mt-1 block">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(n.id)
                            }}
                            className="absolute right-3 top-3 p-1 rounded hover:bg-sb-surface-3 text-sb-text-3 hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete notification"
                          >
                            <TrashIcon size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / User Info */}
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-sb-border">
              <div className="w-8 h-8 rounded-full bg-[#163A5F] dark:bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-sb-text leading-tight">{user.name}</p>
                <p className="text-xs text-sb-text-2 leading-tight">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 bg-sb-bg">{children}</main>
      </div>
    </div>
  )
}
