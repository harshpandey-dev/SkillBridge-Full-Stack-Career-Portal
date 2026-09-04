import { useState, useEffect } from 'react'
import type { Job } from '../../types'
import {
  SearchIcon, MapPinIcon, ChevronRightIcon, StarIcon, ClockIcon,
} from '../../components/icons'
import { jobService } from '../../services/job.service'
import { learningResourceService, type LearningResourceItem } from '../../services/learningResource.service'

const ArrowRightIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const STATS = [
  { value: '50,000+', label: 'Students registered' },
  { value: '2,800+', label: 'Partner companies' },
  { value: '12,400+', label: 'Active job listings' },
  { value: '8,600+', label: 'Internship opportunities' },
]

const FEATURES = [
  {
    icon: '01',
    title: 'Build your profile',
    desc: 'Add your education, skills, projects, and experience. Our AI matches you to roles before you even start searching.',
  },
  {
    icon: '02',
    title: 'Explore opportunities',
    desc: 'Browse curated full-time roles, internships, and contract work from companies that actively recruit students.',
  },
  {
    icon: '03',
    title: 'Apply and track',
    desc: 'One-click apply, real-time application status, and direct communication with recruiters — all in one place.',
  },
]

const COMPANIES = ['Stripe', 'Google', 'Microsoft', 'Figma', 'OpenAI', 'Shopify', 'Airbnb', 'Netflix']

interface Props {
  navigate: (page: string, jobId?: string) => void
}

export default function Landing({ navigate }: Props) {
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [featuredResources, setFeaturedResources] = useState<LearningResourceItem[]>([])

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [jobsResult, resourcesResult] = await Promise.all([
          jobService.getJobs({ limit: 12, sort: 'newest' }).catch(() => ({ jobs: [], total: 0 })),
          learningResourceService.getFeaturedResources().catch(() => ({ items: [], total: 0 })),
        ])
        setJobs(jobsResult.jobs)
        setFeaturedResources(resourcesResult.items ? resourcesResult.items.slice(0, 3) : [])
      } catch {
        // Fallback silently if offline
      }
    }
    loadLandingData()
  }, [])

  const featuredJobs = jobs.slice(0, 6)
  const internships = jobs.filter(j => j.type === 'Internship')

  const handleSearch = () => {
    navigate('jobs')
  }

  return (
    <div>
      {/* Hero — navy brand section, unchanged in dark/light */}
      <section className="bg-[#163A5F] text-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-14 sm:pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-full px-3 py-1.5 text-xs font-medium text-[rgba(255,255,255,0.75)] mb-6">
              <span className="w-1.5 h-1.5 bg-[#0F9D8A] rounded-full" />
              12,400+ jobs added this month
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Launch your career with the right opportunity
            </h1>
            <p className="text-base sm:text-lg text-[rgba(255,255,255,0.7)] leading-relaxed mb-8">
              SkillBridge connects students and recent graduates with top employers. Find full-time roles, internships, and everything in between.
            </p>

            <div className="bg-white dark:bg-sb-surface rounded-lg p-2 flex flex-col sm:flex-row gap-2 shadow-lg">
              <div className="flex items-center gap-2 flex-1 px-3 py-2">
                <SearchIcon size={16} className="text-[#667085] dark:text-sb-text-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 text-sm text-[#172033] dark:text-sb-text placeholder-[#667085] dark:placeholder-sb-text-3 outline-none bg-transparent"
                />
              </div>
              <div className="w-px bg-[#E4E7EC] dark:bg-sb-border hidden sm:block" />
              <div className="flex items-center gap-2 flex-1 px-3 py-2">
                <MapPinIcon size={16} className="text-[#667085] dark:text-sb-text-2 shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="flex-1 text-sm text-[#172033] dark:text-sb-text placeholder-[#667085] dark:placeholder-sb-text-3 outline-none bg-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="bg-[#2563EB] text-white px-6 py-2.5 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors shrink-0"
              >
                Search Jobs
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['React Developer', 'Data Scientist', 'Product Designer', 'ML Intern', 'DevOps'].map(tag => (
                <button
                  key={tag}
                  onClick={() => navigate('jobs')}
                  className="text-xs text-[rgba(255,255,255,0.6)] border border-[rgba(255,255,255,0.15)] rounded-full px-3 py-1 hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-[rgba(255,255,255,0.08)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-[rgba(255,255,255,0.55)] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Companies */}
      <section className="bg-sb-surface border-b border-sb-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex items-center gap-6 overflow-x-auto">
          <p className="text-xs font-semibold text-sb-text-2 uppercase tracking-wide shrink-0">Hiring from</p>
          <div className="flex items-center gap-8 flex-wrap">
            {COMPANIES.map(co => (
              <span key={co} className="text-sm font-semibold text-sb-text-3 hover:text-[#163A5F] dark:hover:text-sb-text transition-colors cursor-default whitespace-nowrap">
                {co}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-sb-text">Featured opportunities</h2>
              <p className="text-sm text-sb-text-2 mt-1">Hand-picked roles from companies actively recruiting now</p>
            </div>
            <button
              onClick={() => navigate('jobs')}
              className="flex items-center gap-1.5 text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] transition-colors"
            >
              View all jobs <ChevronRightIcon size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map(job => (
              <button
                key={job.id}
                onClick={() => navigate('job-details', job.id)}
                className="bg-sb-surface border border-sb-border rounded-lg p-5 text-left hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: job.companyColor }}
                  >
                    {job.company[0]}
                  </div>
                  {/* Job type badges — preserve semantic colors */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    job.type === 'Internship' ? 'bg-[#E6F7F5] text-[#0F9D8A] dark:bg-[#042F2E] dark:text-[#0F9D8A]' :
                    job.type === 'Full-time' ? 'bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A5F] dark:text-[#3B82F6]' :
                    'bg-sb-surface-2 text-sb-text-2'
                  }`}>
                    {job.type}
                  </span>
                </div>
                <h3 className="font-semibold text-sb-text text-[15px] mb-1 group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-sb-text-2 mb-3">{job.company}</p>
                <div className="flex items-center gap-3 text-xs text-sb-text-2 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPinIcon size={12} />
                    {job.location}
                  </span>
                  {job.remote && (
                    <span className="bg-sb-surface-2 px-1.5 py-0.5 rounded text-sb-text-2">Remote OK</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-sb-border">
                  <span className="text-sm font-semibold text-sb-text">{job.salary}</span>
                  <span className="text-xs text-sb-text-2">{job.applicants} applicants</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-sb-surface border-y border-sb-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-sb-text">How SkillBridge works</h2>
            <p className="text-sm text-sb-text-2 mt-2">From profile to offer in three straightforward steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.icon} className="flex gap-5">
                <div className="text-3xl font-bold text-sb-border shrink-0 w-10 text-right tabular-nums">{f.icon}</div>
                <div>
                  <h3 className="font-semibold text-sb-text mb-2">{f.title}</h3>
                  <p className="text-sm text-sb-text-2 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internships */}
      {internships.length > 0 && (
        <section className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-sb-text">Internship programs</h2>
              <p className="text-sm text-sb-text-2 mt-1">Summer and co-op opportunities at top companies</p>
            </div>
            <button onClick={() => navigate('jobs')} className="text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors">
              View all <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.map(job => (
              <button
                key={job.id}
                onClick={() => navigate('job-details', job.id)}
                className="bg-sb-surface border border-sb-border rounded-lg p-5 flex items-start gap-4 text-left hover:border-[#2563EB] dark:hover:border-[#3B82F6] hover:shadow-sm transition-all group"
              >
                <div
                  className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: job.companyColor }}
                >
                  {job.company[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sb-text group-hover:text-[#2563EB] dark:group-hover:text-[#3B82F6] transition-colors">{job.title}</h3>
                  <p className="text-sm text-sb-text-2 mb-2">{job.company} · {job.location}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-sb-text">{job.salary}</span>
                    <span className="text-xs text-sb-text-2">Deadline: {job.deadline}</span>
                  </div>
                </div>
                {/* Internship badge — semantic green, stays in both modes */}
                <span className="text-xs bg-[#E6F7F5] text-[#0F9D8A] dark:bg-[#042F2E] font-medium px-2 py-0.5 rounded-full shrink-0">Internship</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Learning Resources */}
      <section className="bg-sb-bg border-t border-sb-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-sb-text">Build your skills</h2>
              <p className="text-sm text-sb-text-2 mt-1">Curated courses and resources to accelerate your career</p>
            </div>
            <button onClick={() => navigate('learning')} className="text-sm font-medium text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors">
              All resources <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredResources.map(r => (
              <div key={r.id} className="bg-sb-surface border border-sb-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="h-36 bg-[#163A5F] relative overflow-hidden">
                  <img
                    src={r.imageUrl?.startsWith('http') ? r.imageUrl : r.thumbnail?.startsWith('http') ? r.thumbnail : `https://images.unsplash.com/${r.imageUrl || r.thumbnail || 'photo-1516321318423-f06f85e504b3'}?w=400&h=144&fit=crop&auto=format`}
                    alt={r.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 left-3">
                    {/* Difficulty badges — semantic colors stay */}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      r.difficulty.toLowerCase().includes('begin') ? 'bg-[#E6F7F5] text-[#0F9D8A]' :
                      r.difficulty.toLowerCase().includes('adv') ? 'bg-[#FEF2F2] text-[#DC2626]' :
                      'bg-[#FFFBEB] text-[#D97706]'
                    }`}>
                      {r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-sb-text-2 font-medium">{r.provider}</span>
                    <span className="text-sb-border">·</span>
                    <span className="text-xs text-sb-text-2">{r.type}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-sb-text leading-snug mb-3 line-clamp-2">{r.title}</h3>
                  <div className="flex items-center justify-between text-xs text-sb-text-2">
                    <div className="flex items-center gap-1">
                      <ClockIcon size={12} />
                      {r.duration || 'Self-paced'}
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon size={12} className="text-[#D97706]" />
                      {r.rating || '4.8'} · 120k enrolled
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — navy brand section stays consistent */}
      <section className="bg-[#163A5F]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg p-8">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-white mb-2">For students</h3>
            <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed mb-6">
              Create your profile, discover opportunities that match your skills, and track every application in one place.
            </p>
            <button
              onClick={() => navigate('register')}
              className="inline-flex items-center gap-2 bg-white text-[#163A5F] px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#F7F8FA] transition-colors"
            >
              Get started free <ArrowRightIcon size={16} />
            </button>
          </div>
          <div className="bg-[#2563EB] rounded-lg p-8">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-xl font-bold text-white mb-2">For recruiters</h3>
            <p className="text-[rgba(255,255,255,0.8)] text-sm leading-relaxed mb-6">
              Post jobs, search pre-vetted student profiles, and manage your entire campus recruiting pipeline with ease.
            </p>
            <button
              onClick={() => navigate('register')}
              className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-5 py-2.5 rounded text-sm font-semibold hover:bg-[#EFF6FF] transition-colors"
            >
              Post your first job <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
