import { useState } from 'react'
import type { UserRole, NavUser } from './types'
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

const USER_DATA: Record<string, { name: string; role: UserRole }> = {
  'alex.chen@stanford.edu': { name: 'Alex Chen', role: 'student' },
  'sarah.j@mit.edu': { name: 'Sarah Johnson', role: 'student' },
  'jordan.lee@stripe.com': { name: 'Jordan Lee', role: 'recruiter' },
  'morgan.s@figma.com': { name: 'Morgan Silva', role: 'recruiter' },
  'sam.torres@skillbridge.io': { name: 'Sam Torres', role: 'admin' },
}

const DEFAULT_PAGES: Record<UserRole, string> = {
  student: 'student-dashboard',
  recruiter: 'recruiter-dashboard',
  admin: 'admin-dashboard',
}

const PUBLIC_PAGES = new Set(['landing', 'jobs', 'job-details', 'learning', 'login', 'register'])

export default function App() {
  const [user, setUser] = useState<NavUser | null>(null)
  const [page, setPage] = useState('landing')
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const navigate = (newPage: string, id?: string) => {
    setPage(newPage)
    if (id !== undefined) setSelectedJobId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const login = (email: string, role: UserRole) => {
    const userData = USER_DATA[email] ?? { name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()), role }
    setUser({ name: userData.name, email, role: userData.role ?? role })
    navigate(DEFAULT_PAGES[userData.role ?? role])
  }

  const logout = () => {
    setUser(null)
    navigate('landing')
  }

  const isPublic = !user || PUBLIC_PAGES.has(page)

  if (isPublic) {
    return (
      <PublicLayout user={user} currentPage={page} navigate={navigate} onLogout={logout}>
        {page === 'landing' && <Landing navigate={navigate} />}
        {page === 'jobs' && <Jobs navigate={navigate} />}
        {page === 'job-details' && <JobDetails jobId={selectedJobId} navigate={navigate} />}
        {page === 'learning' && <Learning navigate={navigate} />}
        {page === 'login' && <Login onLogin={login} navigate={navigate} />}
        {page === 'register' && <Register onLogin={login} navigate={navigate} />}
        {!PUBLIC_PAGES.has(page) && user && <Landing navigate={navigate} />}
      </PublicLayout>
    )
  }

  return (
    <AppLayout user={user!} currentPage={page} navigate={navigate} onLogout={logout}>
      {/* Student */}
      {page === 'student-dashboard' && <StudentDashboard user={user!} navigate={navigate} />}
      {page === 'opportunities' && <Opportunities navigate={navigate} />}
      {page === 'applications' && <Applications navigate={navigate} />}
      {page === 'saved-jobs' && <SavedJobs navigate={navigate} />}
      {page === 'student-profile' && <StudentProfile navigate={navigate} />}

      {/* Recruiter */}
      {page === 'recruiter-dashboard' && <RecruiterDashboard user={user!} navigate={navigate} />}
      {page === 'my-jobs' && <MyJobs navigate={navigate} />}
      {page === 'post-job' && <PostJob navigate={navigate} />}
      {page === 'applicants' && <Applicants navigate={navigate} />}
      {page === 'recruiter-profile' && <RecruiterProfile navigate={navigate} />}

      {/* Admin */}
      {page === 'admin-dashboard' && <AdminDashboard user={user!} navigate={navigate} />}
      {page === 'user-management' && <UserManagement navigate={navigate} />}
      {page === 'job-management' && <JobManagement navigate={navigate} />}
      {page === 'admin-learning' && <AdminLearning navigate={navigate} />}

      {/* Cross-role: Job details visible inside app too */}
      {page === 'job-details' && <JobDetails jobId={selectedJobId} navigate={navigate} />}
    </AppLayout>
  )
}
