import { useState, useEffect, useCallback } from 'react'
import {
  SearchIcon, PlusIcon, EditIcon, TrashIcon, StarIcon, XIcon,
  ChevronLeftIcon, ChevronRightIcon,
} from '../../components/icons'
import {
  learningResourceService,
  type LearningResourceItem,
  type LearningResourceStats,
  type BackendDifficulty,
  formatBackendToUIDifficulty,
} from '../../services/learningResource.service'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate?: (page: string) => void
}

const CATEGORY_OPTIONS = [
  'All',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Cloud & DevOps',
  'Product Management',
  'Career Prep',
]

const TYPE_OPTIONS = ['Course', 'Tutorial', 'Workshop', 'Certification', 'Video', 'Article']
const DIFFICULTY_OPTIONS: { label: string; value: BackendDifficulty }[] = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
]

export default function AdminLearning({ navigate: _navigate }: Props) {
  const [resources, setResources] = useState<LearningResourceItem[]>([])
  const [stats, setStats] = useState<LearningResourceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [successBanner, setSuccessBanner] = useState<string | null>(null)

  // Filters & Pagination
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 10

  // Form & Modals state
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Form inputs
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [category, setCategory] = useState('Web Development')
  const [type, setType] = useState('Course')
  const [difficulty, setDifficulty] = useState<BackendDifficulty>('BEGINNER')
  const [duration, setDuration] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState<string>('4.5')
  const [featured, setFeatured] = useState(false)

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg)
    setTimeout(() => setSuccessBanner(null), 3000)
  }

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const res = await learningResourceService.getResourceStats()
      setStats(res)
    } catch {
      // Fallback gracefully
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Load paginated resources
  const loadResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await learningResourceService.getResources({
        search: search.trim() || undefined,
        category: catFilter !== 'All' ? catFilter : undefined,
        page,
        limit: LIMIT,
      })
      setResources(res.items)
      setTotal(res.total)
      setTotalPages(Math.max(1, res.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load resources.'))
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [search, catFilter, page])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadResources()
  }, [loadResources])

  const handleOpenCreateModal = () => {
    setEditingResourceId(null)
    setTitle('')
    setProvider('')
    setCategory('Web Development')
    setType('Course')
    setDifficulty('BEGINNER')
    setDuration('')
    setResourceUrl('')
    setDescription('')
    setRating('4.5')
    setFeatured(false)
    setActionError(null)
    setShowAddForm(true)
  }

  const handleOpenEditModal = (r: LearningResourceItem) => {
    setEditingResourceId(r.id)
    setTitle(r.title)
    setProvider(r.provider)
    setCategory(r.category)
    setType(r.type)
    setDifficulty(
      r.difficulty.toUpperCase() === 'INTERMEDIATE'
        ? 'INTERMEDIATE'
        : r.difficulty.toUpperCase() === 'ADVANCED'
        ? 'ADVANCED'
        : 'BEGINNER'
    )
    setDuration(r.duration || '')
    setResourceUrl(r.resourceUrl)
    setDescription(r.description || '')
    setRating(r.rating !== null && r.rating !== undefined ? String(r.rating) : '4.5')
    setFeatured(r.featured)
    setActionError(null)
    setShowAddForm(true)
  }

  const handleSaveResource = async () => {
    if (!title.trim()) {
      setActionError('Title is required.')
      return
    }
    if (!provider.trim()) {
      setActionError('Provider name is required.')
      return
    }
    if (!resourceUrl.trim() || !resourceUrl.startsWith('http')) {
      setActionError('A valid URL starting with http:// or https:// is required.')
      return
    }

    let parsedRating: number | undefined = undefined
    if (rating.trim()) {
      const num = parseFloat(rating.trim())
      if (!isNaN(num) && num >= 0 && num <= 5) {
        parsedRating = num
      }
    }

    try {
      setFormSubmitting(true)
      setActionError(null)

      if (editingResourceId) {
        await learningResourceService.updateResource(editingResourceId, {
          title: title.trim(),
          provider: provider.trim(),
          category: category.trim(),
          type: type.trim(),
          difficulty,
          duration: duration.trim() || null,
          resourceUrl: resourceUrl.trim(),
          description: description.trim() || null,
          rating: parsedRating,
          featured,
        })
        showSuccess('Resource updated successfully')
      } else {
        await learningResourceService.createResource({
          title: title.trim(),
          provider: provider.trim(),
          category: category.trim(),
          type: type.trim(),
          difficulty,
          duration: duration.trim() || null,
          resourceUrl: resourceUrl.trim(),
          description: description.trim() || null,
          rating: parsedRating,
          featured,
        })
        showSuccess('Resource created successfully')
      }

      setShowAddForm(false)
      loadResources()
      loadStats()
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to save resource.'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    // Optimistic toggle
    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, featured: !currentStatus } : r))
    )

    try {
      await learningResourceService.toggleFeatured(id, !currentStatus)
      loadStats()
    } catch (err: unknown) {
      // Rollback on failure
      setResources(prev =>
        prev.map(r => (r.id === id ? { ...r, featured: currentStatus } : r))
      )
      setActionError(getApiErrorMessage(err, 'Failed to toggle featured status.'))
    }
  }

  const handleDeleteResource = async (id: string) => {
    try {
      setActionError(null)
      await learningResourceService.deleteResource(id)
      setDeleteConfirm(null)
      showSuccess('Resource deleted successfully')
      loadResources()
      loadStats()
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to delete resource.'))
    }
  }

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Learning Resources</h1>
          <p className="text-sm text-[#667085] mt-0.5">
            {total} {total === 1 ? 'resource' : 'resources'} · curate and manage the learning library
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
        >
          <PlusIcon size={15} /> Add resource
        </button>
      </div>

      {successBanner && (
        <div className="bg-[#E6F7F5] border border-[#BFDBFE] text-[#0F9D8A] rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {actionError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg p-3 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total resources', value: statsLoading ? '…' : String(stats?.totalResources ?? total) },
          { label: 'Featured resources', value: statsLoading ? '…' : String(stats?.featuredResources ?? 0) },
          { label: 'Average rating', value: statsLoading ? '…' : `${stats?.averageRating ?? 4.5} ★` },
          { label: 'Categories active', value: statsLoading ? '…' : String(Object.keys(stats?.totalResourcesByCategory ?? {}).length || 8) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#172033]">{value}</div>
            <div className="text-xs text-[#667085] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#172033]">
              {editingResourceId ? 'Edit learning resource' : 'Add new learning resource'}
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-[#667085] hover:text-[#172033]"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Course or tutorial name"
                className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Provider *</label>
              <input
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="Coursera, Udemy, MIT, etc."
                className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Category *</label>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
                className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Resource URL (Link) *</label>
              <input
                value={resourceUrl}
                onChange={e => setResourceUrl(e.target.value)}
                placeholder="https://coursera.org/learn/..."
                className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB]"
                >
                  {TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as BackendDifficulty)}
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB]"
                >
                  {DIFFICULTY_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Duration</label>
                <input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 6 hours or 4 weeks"
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#172033] mb-1.5">Rating (0 - 5)</label>
                <input
                  type="text"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  placeholder="4.8"
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#172033] mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of skills taught and coursework..."
                className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-[#2563EB]"
              />
              <label htmlFor="featured" className="text-sm text-[#172033] font-medium cursor-pointer">
                Mark as Featured resource on public catalog
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-[#F2F4F7]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="border border-[#E4E7EC] text-[#667085] px-4 py-2 rounded text-sm hover:bg-[#F7F8FA]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={formSubmitting}
              onClick={handleSaveResource}
              className="bg-[#2563EB] text-white px-5 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {formSubmitting ? 'Saving…' : editingResourceId ? 'Update resource' : 'Add resource'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E4E7EC] rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-[#667085]" />
          <input
            type="text"
            placeholder="Search resources by title or provider..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 text-sm text-[#172033] placeholder-[#94A3B8] outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setCatFilter(cat)
                setPage(1)
              }}
              className={`px-3 py-2 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                catFilter === cat
                  ? 'bg-[#163A5F] text-white'
                  : 'bg-white border border-[#E4E7EC] text-[#667085] hover:border-[#94A3B8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#667085]">
            Loading learning resources…
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#667085]">
            No learning resources match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F2F4F7] bg-[#F7F8FA]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Resource</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Difficulty</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Featured</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-[#667085] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => {
                  const uiDiff = formatBackendToUIDifficulty(r.difficulty)
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-[#F2F4F7] hover:bg-[#FAFBFC] transition-colors ${
                        deleteConfirm === r.id ? 'bg-[#FEF2F2]' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <a
                            href={r.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-[#172033] max-w-[320px] truncate hover:text-[#2563EB] block transition-colors"
                          >
                            {r.title}
                          </a>
                          <p className="text-xs text-[#667085]">
                            {r.provider} · {r.type} · {r.duration || 'Self-paced'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full font-medium">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            uiDiff === 'Beginner'
                              ? 'bg-[#E6F7F5] text-[#0F9D8A]'
                              : uiDiff === 'Advanced'
                              ? 'bg-[#FEF2F2] text-[#DC2626]'
                              : 'bg-[#FFFBEB] text-[#D97706]'
                          }`}
                        >
                          {uiDiff}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-[#172033]">
                          <StarIcon size={13} className="text-[#D97706]" />
                          {r.rating !== null && r.rating !== undefined ? r.rating.toFixed(1) : '4.5'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(r.id, r.featured)}
                          className={`w-8 h-5 rounded-full transition-all relative ${
                            r.featured ? 'bg-[#2563EB]' : 'bg-[#E4E7EC]'
                          }`}
                          title={r.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              r.featured ? 'left-3.5' : 'left-0.5'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        {deleteConfirm === r.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#DC2626] font-medium">Delete?</span>
                            <button
                              onClick={() => handleDeleteResource(r.id)}
                              className="text-xs font-medium text-[#DC2626] hover:underline"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-[#667085] hover:underline"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              className="p-1.5 rounded hover:bg-[#F2F4F7] text-[#667085] hover:text-[#172033] transition-colors"
                              title="Edit resource"
                            >
                              <EditIcon size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(r.id)}
                              className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                              title="Delete resource"
                            >
                              <TrashIcon size={13} />
                            </button>
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
        <p className="text-xs text-[#94A3B8]">
          Showing {resources.length} of {total} resources
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                    : 'border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA]'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded border border-[#E4E7EC] bg-white text-[#667085] hover:bg-[#F7F8FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
