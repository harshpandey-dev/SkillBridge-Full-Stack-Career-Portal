import { useState } from 'react'
import { ALL_USERS } from '../../mockData'
import type { UserRole, UserStatus } from '../../types'
import { SearchIcon, TrashIcon } from '../../components/icons'

const STATUS_STYLES: Record<UserStatus, string> = {
  Active: 'bg-[#E6F7F5] text-[#0F9D8A]',
  Suspended: 'bg-[#FEF2F2] text-[#DC2626]',
  Pending: 'bg-[#FFFBEB] text-[#D97706]',
}

interface Props {
  navigate?: (page: string) => void
}

export default function UserManagement({ navigate: _navigate }: Props) {
  const [users, setUsers] = useState(ALL_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'All' || u.role === roleFilter
    const matchStatus = statusFilter === 'All' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  const updateStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteConfirm(null)
  }

  const counts = {
    All: users.length,
    student: users.filter(u => u.role === 'student').length,
    recruiter: users.filter(u => u.role === 'recruiter').length,
    admin: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-[#172033]">User Management</h1>
        <p className="text-sm text-[#667085] mt-0.5">{users.length} total users · manage accounts and permissions</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Students', count: counts.student, color: 'text-[#2563EB]' },
          { label: 'Recruiters', count: counts.recruiter, color: 'text-[#0F9D8A]' },
          { label: 'Admins', count: counts.admin, color: 'text-[#163A5F]' },
          { label: 'Pending review', count: users.filter(u => u.status === 'Pending').length, color: 'text-[#D97706]' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-[#667085] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>

        <div className="flex gap-1">
          {(['All', 'student', 'recruiter', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 text-sm font-medium rounded transition-colors capitalize ${
                roleFilter === r ? 'bg-[#163A5F] text-white' : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {r === 'All' ? `All (${counts.All})` : r}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as UserStatus | 'All')}
          className="border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] bg-white outline-none"
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">User</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Role</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Institution</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Joined</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${deleteConfirm === user.id ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#172033]">{user.name}</p>
                      <p className="text-xs text-[#667085]">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                    user.role === 'admin' ? 'bg-[#163A5F] text-white' :
                    user.role === 'recruiter' ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
                    'bg-[#EFF6FF] text-[#2563EB]'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-[#667085]">{user.university ?? user.company ?? '—'}</td>
                <td className="px-5 py-4 text-sm text-[#667085]">{user.joined}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {deleteConfirm === user.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#DC2626]">Delete?</span>
                      <button onClick={() => deleteUser(user.id)} className="text-xs font-medium text-[#DC2626] hover:underline">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#667085] hover:underline">No</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {user.status === 'Active' ? (
                        <button
                          onClick={() => updateStatus(user.id, 'Suspended')}
                          title="Suspend user"
                          className="text-xs px-2 py-1 border border-[#E4E7EC] rounded text-[#667085] hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
                        >
                          Suspend
                        </button>
                      ) : user.status === 'Suspended' ? (
                        <button
                          onClick={() => updateStatus(user.id, 'Active')}
                          title="Restore user"
                          className="text-xs px-2 py-1 border border-[#E4E7EC] rounded text-[#0F9D8A] hover:bg-[#E6F7F5] transition-colors"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(user.id, 'Active')}
                          title="Approve user"
                          className="text-xs px-2 py-1 bg-[#E6F7F5] border border-[#99E6DD] rounded text-[#0F9D8A] hover:bg-[#0F9D8A] hover:text-white transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#667085]">No users match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#94A3B8]">Showing {filtered.length} of {users.length} users</p>
    </div>
  )
}
