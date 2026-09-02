import { useState, useEffect, useCallback } from 'react'
import { SearchIcon, StarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '../../components/icons'
import {
  learningResourceService,
  type LearningResourceItem,
  formatUIToBackendDifficulty,
  formatBackendToUIDifficulty,
} from '../../services/learningResource.service'
import { getApiErrorMessage } from '../../lib/api'

const CATEGORIES = [
  'All',
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Design',
  'Cloud & DevOps',
  'Product Management',
  'Career Prep',
]

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const
const TYPES = ['Course', 'Tutorial', 'Workshop', 'Certification'] as const

interface Props {
  navigate?: (page: string) => void
}

export default function Learning({ navigate: _navigate }: Props) {
  const [resources, setResources] = useState<LearningResourceItem[]>([])
  const [featuredResources, setFeaturedResources] = useState<LearningResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters & Pagination state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState<string>('All')
  const [type, setType] = useState('All')
  const [sort, setSort] = useState<'newest' | 'rating_desc' | 'rating_asc' | 'duration_asc' | 'duration_desc'>('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 6

  // Fetch featured resources once on mount
  useEffect(() => {
    async function loadFeatured() {
      try {
        setFeaturedLoading(true)
        const res = await learningResourceService.getFeaturedResources(3)
        setFeaturedResources(res.items)
      } catch {
        // Fallback silently if none found
        setFeaturedResources([])
      } finally {
        setFeaturedLoading(false)
      }
    }
    loadFeatured()
  }, [])

  // Fetch paginated resources whenever filters change
  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await learningResourceService.getResources({
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        difficulty: formatUIToBackendDifficulty(difficulty),
        type: type !== 'All' ? type : undefined,
        sort,
        page,
        limit: LIMIT,
      })
      setResources(res.items)
      setTotal(res.total)
      setTotalPages(Math.max(1, res.totalPages))
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load learning resources.'))
      setResources([])
    } finally {
      setLoading(false)
    }
  }, [search, category, difficulty, type, sort, page])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleCategorySelect = (cat: string) => {
    setCategory(cat)
    setPage(1)
  }

  const handleDifficultySelect = (diff: string) => {
    setDifficulty(diff)
    setPage(1)
  }

  const handleTypeSelect = (selectedType: string) => {
    setType(selectedType)
    setPage(1)
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <div className="bg-[#163A5F] py-10">
        <div className="max-w-[1280px] mx-auto px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Learning Resources</h1>
          <p className="text-[rgba(255,255,255,0.65)] text-base mb-6">
            Curated courses, workshops, and certifications to build the skills employers want.
          </p>
          <div className="flex items-center gap-2 bg-white rounded px-3 py-2.5 max-w-lg">
            <SearchIcon size={16} className="text-[#667085]" />
            <input
              type="text"
              placeholder="Search courses, topics, or providers..."
              value={search}
              onChange={handleSearchChange}
              className="flex-1 text-sm text-[#172033] placeholder-[#667085] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Featured Section */}
        {!search && category === 'All' && (featuredLoading || featuredResources.length > 0) && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#172033] mb-5">Featured resources</h2>
            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white border border-[#E4E7EC] rounded-lg h-72 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featuredResources.map(r => (
                  <ResourceCard key={r.id} resource={r} featured />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`text-sm font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-[#163A5F] text-white'
                  : 'bg-white border border-[#E4E7EC] text-[#667085] hover:text-[#172033] hover:border-[#172033]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-52 shrink-0 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#172033] mb-2.5">Difficulty</h3>
              {(['All', ...DIFFICULTIES] as const).map(d => (
                <label key={d} className="flex items-center gap-2.5 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === d}
                    onChange={() => handleDifficultySelect(d)}
                    className="accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{d}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-[#E4E7EC] pt-4">
              <h3 className="text-sm font-semibold text-[#172033] mb-2.5">Format</h3>
              {(['All', ...TYPES] as const).map(t => (
                <label key={t} className="flex items-center gap-2.5 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === t}
                    onChange={() => handleTypeSelect(t)}
                    className="accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{t}</span>
                </label>
              ))}
            </div>

            {(category !== 'All' || difficulty !== 'All' || type !== 'All' || search) && (
              <div className="border-t border-[#E4E7EC] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCategory('All')
                    setDifficulty('All')
                    setType('All')
                    setSearch('')
                    setPage(1)
                  }}
                  className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </aside>

          {/* Grid & Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#667085]">
                Showing <span className="font-semibold text-[#172033]">{resources.length}</span> of <span className="font-semibold text-[#172033]">{total}</span> resources
              </p>
              <select
                value={sort}
                onChange={e => {
                  setSort(e.target.value as typeof sort)
                  setPage(1)
                }}
                className="text-sm text-[#667085] border border-[#E4E7EC] rounded px-2 py-1.5 bg-white outline-none focus:border-[#2563EB]"
              >
                <option value="newest">Newest first</option>
                <option value="rating_desc">Highest rated</option>
                <option value="duration_asc">Shortest duration</option>
                <option value="duration_desc">Longest duration</option>
              </select>
            </div>

            {error && (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4 text-sm text-[#DC2626] mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="bg-white border border-[#E4E7EC] rounded-lg h-72 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {resources.map(r => (
                    <ResourceCard key={r.id} resource={r} />
                  ))}
                  {resources.length === 0 && (
                    <div className="col-span-3 bg-white border border-[#E4E7EC] rounded-lg p-12 text-center">
                      <div className="text-3xl mb-2">📚</div>
                      <p className="text-base font-semibold text-[#172033] mb-1">No resources found</p>
                      <p className="text-[#667085] text-sm mb-4">Try clearing or adjusting your search filters.</p>
                      <button
                        onClick={() => {
                          setCategory('All')
                          setDifficulty('All')
                          setType('All')
                          setSearch('')
                          setPage(1)
                        }}
                        className="bg-[#2563EB] text-white px-4 py-2 rounded text-xs font-semibold hover:bg-[#1D4ED8]"
                      >
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E4E7EC]">
                    <p className="text-sm text-[#667085]">
                      Page {page} of {totalPages}
                    </p>
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
                          className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourceCard({
  resource: r,
  featured = false,
}: {
  resource: LearningResourceItem
  featured?: boolean
}) {
  const uiDifficulty = formatBackendToUIDifficulty(r.difficulty)

  const diffColors: Record<string, string> = {
    Beginner: 'bg-[#E6F7F5] text-[#0F9D8A]',
    Intermediate: 'bg-[#FFFBEB] text-[#D97706]',
    Advanced: 'bg-[#FEF2F2] text-[#DC2626]',
  }

  // Cover image support: use imageUrl/thumbnail if available, else Unsplash fallback
  const coverImage = r.imageUrl || r.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=144&fit=crop&auto=format'

  return (
    <div className={`bg-white border border-[#E4E7EC] rounded-lg overflow-hidden hover:shadow-md transition-all flex flex-col group ${featured ? 'ring-1 ring-[#163A5F]/10' : ''}`}>
      <div className="h-36 bg-[#163A5F] relative overflow-hidden shrink-0">
        <img
          src={coverImage}
          alt={r.title}
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColors[uiDifficulty] || diffColors.Beginner}`}>
            {uiDifficulty}
          </span>
          {r.featured && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-[#163A5F]">Featured</span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs bg-[rgba(0,0,0,0.6)] text-white px-2 py-0.5 rounded backdrop-blur-xs font-medium">{r.type}</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">{r.category}</span>
          <span className="text-xs text-[#667085] font-medium">{r.provider}</span>
        </div>

        <a
          href={r.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[#172033] leading-snug mb-2 line-clamp-2 hover:text-[#2563EB] transition-colors"
          title={r.title}
        >
          {r.title}
        </a>

        {r.description && (
          <p className="text-xs text-[#667085] line-clamp-2 mb-3 leading-relaxed">
            {r.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
          {r.tags && r.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-[#F2F4F7] text-[#667085] px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[#667085] pt-3 border-t border-[#F2F4F7]">
          <div className="flex items-center gap-1">
            <StarIcon size={12} className="text-[#D97706]" />
            <span className="font-medium text-[#172033]">{r.rating !== null && r.rating !== undefined ? r.rating.toFixed(1) : '4.5'}</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={12} />
            {r.duration || 'Self-paced'}
          </div>
          <a
            href={r.resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            Start learning ↗
          </a>
        </div>
      </div>
    </div>
  )
}
