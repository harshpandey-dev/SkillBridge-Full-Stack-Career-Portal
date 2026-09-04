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
          <h1 className="text-2xl font-bold text-sb-text">Learning Resources</h1>
          <p className="text-sm text-sb-text-2 mt-0.5">
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

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total resources', value: statsLoading ? '…' : String(stats?.totalResources ?? total) },
          { label: 'Featured resources', value: statsLoading ? '…' : String(stats?.featuredResources ?? 0) },
          { label: 'Average rating', value: statsLoading ? '…' : `${stats?.averageRating ?? 4.5} ★` },
          { label: 'Categories active', value: statsLoading ? '…' : String(Object.keys(stats?.totalResourcesByCategory ?? {}).length || 8) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-sb-surface border border-sb-border rounded-lg p-4">
            <div className="text-2xl font-bold text-sb-text">{value}</div>
            <div className="text-xs text-sb-text-2 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <div className="bg-sb-surface border border-sb-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-sb-text">
              {editingResourceId ? 'Edit learning resource' : 'Add new learning resource'}
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sb-text-2 hover:text-sb-text"
            >
              <XIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Title *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Course or tutorial name"
                className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Provider *</label>
              <input
                value={provider}
                onChange={e => setProvider(e.target.value)}
                placeholder="Coursera, Udemy, MIT, etc."
                className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Category *</label>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Web Development"
                className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sb-text mb-1.5">Resource URL (Link) *</label>
              <input
                value={resourceUrl}
                onChange={e => setResourceUrl(e.target.value)}
                placeholder="https://coursera.org/learn/..."
                className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sb-text mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full border border-sb-border rounded px-3 py-2 text-sm text-sb-text bg-sb-surface outline-none focus:border-[#2563EB]"
                >
                  {TYPE_OPTIONS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-sb-text mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as BackendDifficulty)}
                  className="w-full border border-sb-border rounded px-3 py-2 text-sm text-sb-text bg-sb-surface outline-none focus:border-[#2563EB]"
                >
                  {DIFFICULTY_OPTIONS.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-sb-text mb-1.5">Duration</label>
                <input
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  placeholder="e.g. 6 hours or 4 weeks"
                  className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sb-text mb-1.5">Rating (0 - 5)</label>
                <input
                  type="text"
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  placeholder="4.8"
                  className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-sb-text mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of skills taught and coursework..."
                className="w-full border border-sb-border bg-sb-surface text-sb-text placeholder-sb-text-3 rounded px-3 py-2 text-sm outline-none focus:border-[#2563EB] resize-none"
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
              <label htmlFor="featured" className="text-sm text-sb-text font-medium cursor-pointer">
                Mark as Featured resource on public catalog
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-sb-border">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="border border-sb-border text-sb-text-2 px-4 py-2 rounded text-sm hover:bg-sb-surface-2 bg-sb-surface"
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
        <div className="flex items-center gap-2 bg-sb-surface border border-sb-border rounded px-3 py-2.5 flex-1 min-w-52 max-w-80">
          <SearchIcon size={15} className="text-sb-text-3" />
          <input
            type="text"
            placeholder="Search resources by title or provider..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 text-sm text-sb-text placeholder-sb-text-3 bg-transparent outline-none"
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
                  ? 'bg-[#163A5F] text-white dark:bg-sb-brand dark:text-white'
                  : 'bg-sb-surface border border-sb-border text-sb-text-2 hover:border-sb-border-2 hover:text-sb-text'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900 text-[#DC2626] dark:text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Resources Table */}
      <div className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-sb-text-2">
            Loading learning resources…
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-sm text-sb-text-2">
            No learning resources match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sb-border bg-sb-surface-2">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Resource</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Difficulty</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Featured</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-sb-text-2 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => {
                  const uiDiff = formatBackendToUIDifficulty(r.difficulty)
                  return (
                    <tr
                      key={r.id}
                      className={`border-b border-sb-border hover:bg-sb-surface-2 transition-colors ${
                        deleteConfirm === r.id ? 'bg-[#FEF2F2] dark:bg-red-950/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <a
                            href={r.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-sb-text max-w-[320px] truncate hover:text-[#2563EB] dark:hover:text-blue-400 block transition-colors"
                          >
                            {r.title}
                          </a>
                          <p className="text-xs text-sb-text-2">
                            {r.provider} · {r.type} · {r.duration || 'Self-paced'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            uiDiff === 'Beginner'
                              ? 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-teal-950/40 dark:text-teal-400'
                              : uiDiff === 'Advanced'
                              ? 'bg-[#FEF2F2] text-[#DC2626] dark:bg-red-950/40 dark:text-red-400'
                              : 'bg-[#FFFBEB] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          {uiDiff}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm font-medium text-sb-text">
                          <StarIcon size={13} className="text-[#D97706] dark:text-amber-400" />
                          {r.rating !== null && r.rating !== undefined ? r.rating.toFixed(1) : '4.5'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(r.id, r.featured)}
                          className={`w-8 h-5 rounded-full transition-all relative ${
                            r.featured ? 'bg-[#2563EB]' : 'bg-[#E4E7EC] dark:bg-slate-700'
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
                            <span className="text-xs text-[#DC2626] dark:text-red-400 font-medium">Delete?</span>
                            <button
                              onClick={() => handleDeleteResource(r.id)}
                              className="text-xs font-medium text-[#DC2626] dark:text-red-400 hover:underline"
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(r)}
                              className="p-1.5 rounded hover:bg-sb-surface-2 text-sb-text-2 hover:text-sb-text transition-colors"
                              title="Edit resource"
                            >
                              <EditIcon size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(r.id)}
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-sb-text-3 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
        <p className="text-xs text-sb-text-3">
          Showing {resources.length} of {total} resources
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
