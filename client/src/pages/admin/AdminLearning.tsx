import { useState } from 'react'
import { LEARNING_RESOURCES } from '../../mockData'
import type { LearningResource } from '../../types'
import { SearchIcon, PlusIcon, EditIcon, TrashIcon, StarIcon, XIcon } from '../../components/icons'

interface Props {
  navigate?: (page: string) => void
}

export default function AdminLearning({ navigate: _navigate }: Props) {
  const [resources, setResources] = useState(LEARNING_RESOURCES)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', provider: '', category: '', type: 'Course', difficulty: 'Beginner' })

  const categories = ['All', ...Array.from(new Set(resources.map(r => r.category)))]

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.provider.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || r.category === catFilter
    return matchSearch && matchCat
  })

  const toggleFeatured = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, featured: !r.featured } : r))
  }

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(r => r.id !== id))
    setDeleteConfirm(null)
  }

  const handleAddResource = () => {
    const newR: LearningResource = {
      id: `l${resources.length + 1}`,
      title: newResource.title || 'New Resource',
      provider: newResource.provider || 'Provider',
      category: newResource.category || 'General',
      type: newResource.type as LearningResource['type'],
      difficulty: newResource.difficulty as LearningResource['difficulty'],
      duration: '— hours',
      rating: 4.5,
      enrolled: 0,
      tags: [],
      featured: false,
      addedDate: new Date().toISOString().split('T')[0],
      image: 'photo-1522071820081-009f0129c71c',
    }
    setResources(prev => [newR, ...prev])
    setShowAddForm(false)
    setNewResource({ title: '', provider: '', category: '', type: 'Course', difficulty: 'Beginner' })
  }

  const stats = {
    total: resources.length,
    featured: resources.filter(r => r.featured).length,
    totalEnrolled: resources.reduce((sum, r) => sum + r.enrolled, 0),
    avgRating: (resources.reduce((sum, r) => sum + r.rating, 0) / resources.length).toFixed(1),
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Learning Resources</h1>
          <p className="text-sm text-[#667085] mt-0.5">{resources.length} resources · curate and manage the learning library</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon size={15} /> Add resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total resources', value: stats.total },
          { label: 'Featured', value: stats.featured },
          { label: 'Total enrollments', value: (stats.totalEnrolled / 1000).toFixed(0) + 'k' },
          { label: 'Avg. rating', value: stats.avgRating },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#172033]">{value}</div>
            <div className="text-xs text-[#667085] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#172033]">Add new resource</h2>
            <button onClick={() => setShowAddForm(false)} className="text-[#667085] hover:text-[#172033]"><XIcon size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Title *</label>
              <input value={newResource.title} onChange={e => setNewResource(p => ({ ...p, title: e.target.value }))} placeholder="Course or tutorial name" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Provider</label>
              <input value={newResource.provider} onChange={e => setNewResource(p => ({ ...p, provider: e.target.value }))} placeholder="Coursera, Udemy, etc." className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Category</label>
              <input value={newResource.category} onChange={e => setNewResource(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Web Development" className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm outline-none focus:border-[#2563EB]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Type</label>
                <select value={newResource.type} onChange={e => setNewResource(p => ({ ...p, type: e.target.value }))} className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB]">
                  <option>Course</option><option>Tutorial</option><option>Workshop</option><option>Certification</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Difficulty</label>
                <select value={newResource.difficulty} onChange={e => setNewResource(p => ({ ...p, difficulty: e.target.value }))} className="w-full border border-[#E4E7EC] rounded px-3 py-2.5 text-sm text-[#172033] outline-none focus:border-[#2563EB]">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowAddForm(false)} className="border border-[#E4E7EC] text-[#667085] px-4 py-2 rounded text-sm hover:bg-[#F7F8FA]">Cancel</button>
            <button onClick={handleAddResource} className="bg-[#2563EB] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8]">Add resource</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                catFilter === cat ? 'bg-[#163A5F] text-white' : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Resource</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Category</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Difficulty</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Rating</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Enrolled</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Featured</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${deleteConfirm === r.id ? 'bg-[#FEF2F2]' : ''}`}>
                <td className="px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#172033] max-w-[280px] truncate">{r.title}</p>
                    <p className="text-xs text-[#667085]">{r.provider} · {r.type} · {r.duration}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full font-medium">{r.category}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.difficulty === 'Beginner' ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
                    r.difficulty === 'Advanced' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                    'bg-[#FFFBEB] text-[#D97706]'
                  }`}>
                    {r.difficulty}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 text-sm font-medium text-[#172033]">
                    <StarIcon size={13} className="text-[#D97706]" />
                    {r.rating}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#667085]">
                  {(r.enrolled / 1000).toFixed(0)}k
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleFeatured(r.id)}
                    className={`w-8 h-5 rounded-full transition-all relative ${r.featured ? 'bg-[#2563EB]' : 'bg-[#E4E7EC]'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${r.featured ? 'left-3.5' : 'left-0.5'}`} />
                  </button>
                </td>
                <td className="px-5 py-4">
                  {deleteConfirm === r.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#DC2626]">Delete?</span>
                      <button onClick={() => deleteResource(r.id)} className="text-xs font-medium text-[#DC2626] hover:underline">Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#667085] hover:underline">No</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"><EditIcon size={13} /></button>
                      <button onClick={() => setDeleteConfirm(r.id)} className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors">
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#94A3B8]">Showing {filtered.length} of {resources.length} resources</p>
    </div>
  )
}
