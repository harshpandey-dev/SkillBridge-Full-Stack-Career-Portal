import { useState } from 'react'
import { LEARNING_RESOURCES } from '../../mockData'
import { SearchIcon, StarIcon, ClockIcon } from '../../components/icons'
import type { Difficulty } from '../../types'

const CATEGORIES = ['All', 'Web Development', 'Data Science', 'Machine Learning', 'Design', 'Cloud & DevOps', 'Product Management', 'Career Prep']
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']
const TYPES = ['Course', 'Tutorial', 'Workshop', 'Certification']

interface Props {
  navigate?: (page: string) => void
}

export default function Learning({ navigate: _navigate }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All')
  const [type, setType] = useState('All')

  const filtered = LEARNING_RESOURCES.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.provider.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || r.category === category
    const matchDiff = difficulty === 'All' || r.difficulty === difficulty
    const matchType = type === 'All' || r.type === type
    return matchSearch && matchCat && matchDiff && matchType
  })

  const featured = LEARNING_RESOURCES.filter(r => r.featured)

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
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm text-[#172033] placeholder-[#667085] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Featured */}
        {!search && category === 'All' && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-[#172033] mb-5">Featured resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.slice(0, 3).map(r => (
                <ResourceCard key={r.id} resource={r} featured />
              ))}
            </div>
          </section>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
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
          {/* Filters */}
          <aside className="w-52 shrink-0 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#172033] mb-2.5">Difficulty</h3>
              {(['All', ...DIFFICULTIES] as const).map(d => (
                <label key={d} className="flex items-center gap-2.5 mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={difficulty === d}
                    onChange={() => setDifficulty(d as typeof difficulty)}
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
                    onChange={() => setType(t)}
                    className="accent-[#2563EB]"
                  />
                  <span className="text-sm text-[#667085] hover:text-[#172033] transition-colors">{t}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#667085]">
                <span className="font-semibold text-[#172033]">{filtered.length}</span> resources found
              </p>
              <select className="text-sm text-[#667085] border border-[#E4E7EC] rounded px-2 py-1.5 bg-white outline-none">
                <option>Most popular</option>
                <option>Highest rated</option>
                <option>Newest</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(r => <ResourceCard key={r.id} resource={r} />)}
              {filtered.length === 0 && (
                <div className="col-span-3 bg-white border border-[#E4E7EC] rounded-lg p-12 text-center">
                  <p className="text-[#667085] text-sm">No resources match your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResourceCard({ resource: r, featured = false }: { resource: typeof LEARNING_RESOURCES[0]; featured?: boolean }) {
  const diffColors: Record<string, string> = {
    Beginner: 'bg-[#E6F7F5] text-[#0F9D8A]',
    Intermediate: 'bg-[#FFFBEB] text-[#D97706]',
    Advanced: 'bg-[#FEF2F2] text-[#DC2626]',
  }

  return (
    <div className={`bg-white border border-[#E4E7EC] rounded-lg overflow-hidden hover:shadow-md transition-shadow ${featured ? 'ring-1 ring-[#163A5F]/10' : ''}`}>
      <div className="h-36 bg-[#163A5F] relative overflow-hidden">
        <img
          src={`https://images.unsplash.com/${r.image}?w=400&h=144&fit=crop&auto=format`}
          alt={r.title}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diffColors[r.difficulty]}`}>
            {r.difficulty}
          </span>
          {r.featured && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-[#163A5F]">Featured</span>
          )}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="text-xs bg-[rgba(0,0,0,0.5)] text-white px-2 py-0.5 rounded">{r.type}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">{r.category}</span>
          <span className="text-xs text-[#667085]">{r.provider}</span>
        </div>
        <h3 className="text-sm font-semibold text-[#172033] leading-snug mb-3 line-clamp-2">{r.title}</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {r.tags.slice(0, 3).map(t => (
            <span key={t} className="text-xs bg-[#F2F4F7] text-[#667085] px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-[#667085] pt-3 border-t border-[#F2F4F7]">
          <div className="flex items-center gap-1">
            <StarIcon size={12} className="text-[#D97706]" />
            <span className="font-medium text-[#172033]">{r.rating}</span>
            <span className="text-[#94A3B8]">({(r.enrolled / 1000).toFixed(0)}k)</span>
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon size={12} />
            {r.duration}
          </div>
        </div>
      </div>
    </div>
  )
}
