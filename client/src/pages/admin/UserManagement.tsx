import { useState, useEffect, useCallback } from 'react'
import { SearchIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import {
  adminService,
  type AdminUserItem,
  type AdminDashboardStats,
} from '../../services/admin.service'
import { getApiErrorMessage } from '../../lib/api'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400',
  Active: 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400',
  SUSPENDED: 'bg-[#FEF2F2] text-[#DC2626] dark:bg-red-950/40 dark:text-red-400',
  Suspended: 'bg-[#FEF2F2] text-[#DC2626] dark:bg-red-950/40 dark:text-red-400',
  PENDING: 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400',
  Pending: 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400',
}


interface Props {
  navigate?: (page: string) => void
}

export default function UserManagement({ navigate: _navigate }: Props) {
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'All' | 'STUDENT' | 'RECRUITER' | 'ADMIN'>('All')
  const [statusFilter, setStatusFilter] = useState<'All' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const LIMIT = 10

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg)
    setTimeout(() => setSuccessBanner(null), 3000)
  }

  // Load overview stats
  const loadStats = useCallback(async () => {
    try {
      const res = await adminService.getDashboard()
      setStats(res)
    } catch {
      // Fallback
    }
  }, [])

  // Load paginated users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'All' ? roleFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        page,
        limit: LIMIT,
      })
      setUsers(res.items)
      setTotal(res.total)
      setTotalPages(Math.max(1, res.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load users.'))
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING') => {
    try {
      setActionLoadingId(userId)
      setActionError(null)

      // Optimistic update
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, status: newStatus } : u))
      )

      await adminService.updateUserStatus(userId, newStatus)
      showSuccess(`User status updated to ${newStatus}`)
      loadStats()
    } catch (err: unknown) {
      // Rollback on failure
      loadUsers()
      setActionError(getApiErrorMessage(err, 'Unable to update user status.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoadingId(userId)
      setActionError(null)
      await adminService.deleteUser(userId)
      setDeleteConfirm(null)
      showSuccess('User deleted successfully')
      loadUsers()
      loadStats()
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Unable to delete user.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const counts = {
    All: stats?.users.total ?? total,
    student: stats?.users.students ?? 0,
    recruiter: stats?.users.recruiters ?? 0,
    admin: stats?.users.admins ?? 0,
    pending: stats?.users.pending ?? 0,
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-sb-text">User Management</h1>
        <p className="text-sm text-sb-text-2 mt-0.5">
          {total} total users · manage accounts, statuses, and permissions
        </p>
      </div>

      {successBanner && (
        <div className="bg-[#E6F7F5] dark:bg-teal-950/40 border border-[#BFDBFE] dark:border-teal-800 text-[#0F9D8A] dark:text-teal-400 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900 text-[#DC2626] dark:text-red-400 rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Students', count: counts.student, color: 'text-[#2563EB] dark:text-blue-400' },
          { label: 'Recruiters', count: counts.recruiter, color: 'text-[#0F9D8A] dark:text-teal-400' },
          { label: 'Admins', count: counts.admin, color: 'text-[#163A5F] dark:text-sky-300' },
          { label: 'Pending review', count: counts.pending, color: 'text-[#D97706] dark:text-amber-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-sb-surface border border-sb-border rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-sb-text-2 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-sb-surface border border-sb-border rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-sb-text-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 text-sm text-sb-text placeholder-sb-text-3 bg-transparent outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { label: `All (${counts.All})`, val: 'All' as const },
            { label: 'Students', val: 'STUDENT' as const },
            { label: 'Recruiters', val: 'RECRUITER' as const },
            { label: 'Admins', val: 'ADMIN' as const },
          ].map(r => (
            <button
              key={r.val}
              onClick={() => {
                setRoleFilter(r.val)
                setPage(1)
              }}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                roleFilter === r.val
                  ? 'bg-[#163A5F] text-white dark:bg-sb-brand dark:text-white'
                  : 'bg-sb-surface border border-sb-border text-sb-text-2 hover:border-sb-border-2 hover:text-sb-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value as typeof statusFilter)
            setPage(1)
          }}
          className="border border-sb-border rounded px-3 py-2 text-xs text-sb-text bg-sb-surface outline-none"
        >
          <option value="All">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900 text-[#DC2626] dark:text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-sb-text-2">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-sb-text-2">No users match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sb-border bg-sb-surface-2">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Institution / Org</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Joined</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const institution =
                    u.studentProfile?.university ||
                    u.recruiterProfile?.company?.name ||
                    '—'
                  const joinedDate = new Date(u.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  const isProcessing = actionLoadingId === u.id

                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-sb-border hover:bg-sb-surface-2 transition-colors ${
                        deleteConfirm === u.id ? 'bg-[#FEF2F2] dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#163A5F] dark:bg-sb-brand flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sb-text">{u.name}</p>
                            <p className="text-xs text-sb-text-2">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                            u.role === 'ADMIN'
                              ? 'bg-[#163A5F] text-white dark:bg-slate-800 dark:text-slate-200'
                              : u.role === 'RECRUITER'
                              ? 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400'
                              : 'bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400'
                          }`}
                        >
                          {u.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{institution}</td>
                      <td className="px-5 py-4 text-sm text-sb-text-2">{joinedDate}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            STATUS_STYLES[u.status] || STATUS_STYLES.ACTIVE
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {deleteConfirm === u.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#DC2626] dark:text-red-400 font-medium">Delete?</span>
                            <button
                              disabled={isProcessing}
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-xs font-medium text-[#DC2626] dark:text-red-400 hover:underline disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-sb-text-2 hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {u.status === 'ACTIVE' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                                title="Suspend user"
                                className="text-xs px-2 py-1 border border-sb-border rounded text-sb-text-2 hover:border-red-500 hover:text-red-500 bg-sb-surface transition-colors disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            ) : u.status === 'SUSPENDED' ? (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                                title="Restore user"
                                className="text-xs px-2 py-1 border border-sb-border rounded text-[#0F9D8A] dark:text-teal-400 hover:bg-[#E6F7F5] dark:hover:bg-teal-950/40 bg-sb-surface transition-colors disabled:opacity-50"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                disabled={isProcessing}
                                onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                                title="Approve user"
                                className="text-xs px-2 py-1 bg-[#E6F7F5] dark:bg-teal-950/40 border border-[#99E6DD] dark:border-teal-800 rounded text-[#0F9D8A] dark:text-teal-400 hover:bg-[#0F9D8A] hover:text-white transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}

                            {u.role !== 'ADMIN' && (
                              <button
                                onClick={() => setDeleteConfirm(u.id)}
                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-sb-text-3 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                title="Delete user"
                              >
                                <TrashIcon size={13} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-sb-text-3">
          Showing {users.length} of {total} users
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-[#2563EB] text-white border border-[#2563EB]'
                    : 'border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-sb-border bg-sb-surface text-sb-text-2 hover:bg-sb-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
