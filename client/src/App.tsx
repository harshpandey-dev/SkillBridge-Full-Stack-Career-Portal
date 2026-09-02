import { useState, useEffect } from 'react'
import type { UserRole } from './types'
import { useAuth } from './context/AuthContext'
import PublicLayout from './components/PublicLayout'
import AppLayout from './components/AppLayout'
import Landing from './pages/public/Landing'
import Jobs from './pages/public/Jobs'
import JobDetails from './pages/public/JobDetails'
import Learning from './pages/public/Learning'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import Opportunities from './pages/student/Opportunities'
import Applications from './pages/student/Applications'
import SavedJobs from './pages/student/SavedJobs'
import StudentProfile from './pages/student/StudentProfile'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import MyJobs from './pages/recruiter/MyJobs'
import PostJob from './pages/recruiter/PostJob'
import Applicants from './pages/recruiter/Applicants'
import RecruiterProfile from './pages/recruiter/RecruiterProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import JobManagement from './pages/admin/JobManagement'
import AdminLearning from './pages/admin/AdminLearning'

const DEFAULT_PAGES: Record<UserRole, string> = {
  student: 'student-dashboard',
  recruiter: 'recruiter-dashboard',
  admin: 'admin-dashboard',
}

const PUBLIC_PAGES = new Set(['landing', 'jobs', 'job-details', 'learning', 'login', 'register'])
const STUDENT_PAGES = new Set(['student-dashboard', 'opportunities', 'applications', 'saved-jobs', 'student-profile'])
const RECRUITER_PAGES = new Set(['recruiter-dashboard', 'my-jobs', 'post-job', 'applicants', 'recruiter-profile'])
const ADMIN_PAGES = new Set(['admin-dashboard', 'user-management', 'job-management', 'admin-learning'])

export default function App() {
  const { user, role, isLoading, logout: authLogout } = useAuth()
  const [page, setPage] = useState('landing')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const navigate = (newPage: string, id?: string) => {
    setPage(newPage)
    if (id !== undefined) setSelectedJobId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLoginSuccess = (_email: string, userRole: UserRole) => {
    navigate(DEFAULT_PAGES[userRole] || 'landing')
  }

  const handleLogout = async () => {
    await authLogout()
    navigate('landing')
  }

  // Route protection and redirection checks
  useEffect(() => {
    if (isLoading) return

    // If logged in and on auth pages (login/register), redirect to role dashboard
    if (user && role && (page === 'login' || page === 'register')) {
      setPage(DEFAULT_PAGES[role])
      return
    }

    // If not logged in and attempting to access protected pages, redirect to login
    if (!user) {
      if (STUDENT_PAGES.has(page) || RECRUITER_PAGES.has(page) || ADMIN_PAGES.has(page)) {
        setPage('login')
      }
      return
    }

    // Role-based authorization enforcement
    if (role === 'student' && (RECRUITER_PAGES.has(page) || ADMIN_PAGES.has(page))) {
      setPage('student-dashboard')
    } else if (role === 'recruiter' && (STUDENT_PAGES.has(page) || ADMIN_PAGES.has(page))) {
      setPage('recruiter-dashboard')
    } else if (role === 'admin' && (STUDENT_PAGES.has(page) || RECRUITER_PAGES.has(page))) {
      setPage('admin-dashboard')
    }
  }, [user, role, page, isLoading])

  // Prevent UI flashing before initial authentication resolution
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 bg-[#2563EB] rounded flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <span className="font-bold text-[#163A5F] text-xl tracking-tight">SkillBridge</span>
        </div>
        <div className="w-8 h-8 border-3 border-[#BFDBFE] border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    )
  }

  const isPublic = !user || PUBLIC_PAGES.has(page)

  if (isPublic) {
    return (
      <PublicLayout user={user} currentPage={page} navigate={navigate} onLogout={handleLogout}>
        {page === 'landing' && <Landing navigate={navigate} />}
        {page === 'jobs' && <Jobs navigate={navigate} />}
        {page === 'job-details' && <JobDetails jobId={selectedJobId} navigate={navigate} />}
        {page === 'learning' && <Learning navigate={navigate} />}
        {page === 'login' && <Login onLogin={handleLoginSuccess} navigate={navigate} />}
        {page === 'register' && <Register onLogin={handleLoginSuccess} navigate={navigate} />}
        {!PUBLIC_PAGES.has(page) && user && <Landing navigate={navigate} />}
      </PublicLayout>
    )
  }

  return (
    <AppLayout user={user} currentPage={page} navigate={navigate} onLogout={handleLogout}>
      {/* Student Routes */}
      {role === 'student' && page === 'student-dashboard' && <StudentDashboard user={user} navigate={navigate} />}
      {role === 'student' && page === 'opportunities' && <Opportunities navigate={navigate} />}
      {role === 'student' && page === 'applications' && <Applications navigate={navigate} />}
      {role === 'student' && page === 'saved-jobs' && <SavedJobs navigate={navigate} />}
      {role === 'student' && page === 'student-profile' && <StudentProfile navigate={navigate} />}

      {/* Recruiter Routes */}
      {role === 'recruiter' && page === 'recruiter-dashboard' && <RecruiterDashboard user={user} navigate={navigate} />}
      {role === 'recruiter' && page === 'my-jobs' && <MyJobs navigate={navigate} />}
      {role === 'recruiter' && page === 'post-job' && <PostJob navigate={navigate} />}
      {role === 'recruiter' && page === 'applicants' && <Applicants navigate={navigate} />}
      {role === 'recruiter' && page === 'recruiter-profile' && <RecruiterProfile navigate={navigate} />}

      {/* Admin Routes */}
      {role === 'admin' && page === 'admin-dashboard' && <AdminDashboard user={user} navigate={navigate} />}
      {role === 'admin' && page === 'user-management' && <UserManagement navigate={navigate} />}
      {role === 'admin' && page === 'job-management' && <JobManagement navigate={navigate} />}
      {role === 'admin' && page === 'admin-learning' && <AdminLearning navigate={navigate} />}

      {/* Cross-role: Job details visible inside app too */}
      {page === 'job-details' && <JobDetails jobId={selectedJobId} navigate={navigate} />}
    </AppLayout>
  )
}
