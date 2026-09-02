import { useState } from 'react'
import { CURRENT_STUDENT } from '../../mockData'
import {
  EditIcon, MailIcon, PhoneIcon, MapPinIcon, LinkedinIcon, GithubIcon,
  GlobeIcon, UploadIcon, PlusIcon, XIcon, CheckIcon,
} from '../../components/icons'

interface Props {
  navigate?: (page: string) => void
}

const ALL_SKILLS = ['React', 'TypeScript', 'Python', 'Node.js', 'SQL', 'Machine Learning', 'Figma', 'Git', 'AWS', 'GraphQL', 'Java', 'C++', 'Go', 'PostgreSQL', 'MongoDB']

export default function StudentProfile({ navigate: _navigate }: Props) {
  const [profile, setProfile] = useState(CURRENT_STUDENT)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [addingSkill, setAddingSkill] = useState(false)
  const [saved, setSaved] = useState(false)

  const addSkill = (skill: string) => {
    if (!profile.skills.includes(skill)) {
      setProfile(p => ({ ...p, skills: [...p.skills, skill] }))
    }
  }

  const removeSkill = (skill: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))
  }

  const handleSave = () => {
    setSaved(true)
    setEditingSection(null)
    setTimeout(() => setSaved(false), 2500)
  }

  const completionItems = [
    { label: 'Basic info', done: true },
    { label: 'Education', done: true },
    { label: 'Skills added', done: profile.skills.length > 0 },
    { label: 'Bio written', done: !!profile.bio },
    { label: 'Resume uploaded', done: false },
    { label: 'LinkedIn linked', done: !!profile.linkedin },
  ]
  const completion = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div className="space-y-5 max-w-[960px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">My Profile</h1>
          <p className="text-sm text-[#667085] mt-0.5">Manage your personal details, skills, and resume</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-[#E6F7F5] text-[#0F9D8A] px-3 py-2 rounded text-sm font-medium">
            <CheckIcon size={15} /> Saved successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar & identity */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 text-center">
            <div className="w-20 h-20 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
              AC
            </div>
            <h2 className="font-semibold text-[#172033] text-lg">{profile.name}</h2>
            <p className="text-sm text-[#667085] mt-0.5">{profile.major}</p>
            <p className="text-sm text-[#667085]">{profile.university}</p>
            <div className="mt-3 flex justify-center gap-3">
              {profile.linkedin && (
                <a href="#" className="text-[#667085] hover:text-[#2563EB] transition-colors"><LinkedinIcon size={16} /></a>
              )}
              {profile.github && (
                <a href="#" className="text-[#667085] hover:text-[#172033] transition-colors"><GithubIcon size={16} /></a>
              )}
              {profile.portfolio && (
                <a href="#" className="text-[#667085] hover:text-[#0F9D8A] transition-colors"><GlobeIcon size={16} /></a>
              )}
            </div>
          </div>

          {/* Profile completion */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#172033]">Profile strength</h3>
              <span className="text-sm font-bold text-[#2563EB]">{completion}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F2F4F7] rounded-full mb-4">
              <div className="h-1.5 bg-[#2563EB] rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <div className="space-y-1.5">
              {completionItems.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-[#E6F7F5]' : 'bg-[#F2F4F7]'}`}>
                    {item.done ? <CheckIcon size={10} className="text-[#0F9D8A]" /> : <div className="w-1.5 h-1.5 rounded-full bg-[#E4E7EC]" />}
                  </div>
                  <span className={`text-xs ${item.done ? 'text-[#172033]' : 'text-[#94A3B8]'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#172033]">Contact</h3>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <MailIcon size={14} className="shrink-0" /> {profile.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <PhoneIcon size={14} className="shrink-0" /> {profile.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <MapPinIcon size={14} className="shrink-0" /> {profile.location}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Personal details</h2>
              <button
                onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors"
              >
                <EditIcon size={13} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full name', value: profile.name, key: 'name' },
                { label: 'Email', value: profile.email, key: 'email' },
                { label: 'Phone', value: profile.phone, key: 'phone' },
                { label: 'Location', value: profile.location, key: 'location' },
                { label: 'LinkedIn', value: profile.linkedin, key: 'linkedin' },
                { label: 'Portfolio', value: profile.portfolio, key: 'portfolio' },
              ].map(({ label, value, key }) => (
                <div key={key}>
                  <p className="text-xs font-medium text-[#667085] mb-1">{label}</p>
                  {editingSection === 'personal' ? (
                    <input
                      defaultValue={value}
                      onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                    />
                  ) : (
                    <p className="text-sm text-[#172033]">{value || <span className="text-[#94A3B8] italic">Not provided</span>}</p>
                  )}
                </div>
              ))}
            </div>
            {editingSection === 'personal' && (
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] transition-colors">Save changes</button>
                <button onClick={() => setEditingSection(null)} className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA] transition-colors">Cancel</button>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Education</h2>
              <button onClick={() => setEditingSection(editingSection === 'edu' ? null : 'edu')} className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors">
                <EditIcon size={13} /> Edit
              </button>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-[#163A5F] flex items-center justify-center text-white font-bold text-xs shrink-0">SU</div>
              <div className="flex-1">
                {editingSection === 'edu' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#667085] block mb-1">University</label>
                      <input defaultValue={profile.university} className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#667085] block mb-1">Major</label>
                        <input defaultValue={profile.major} className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                      </div>
                      <div>
                        <label className="text-xs text-[#667085] block mb-1">GPA</label>
                        <input defaultValue={profile.gpa} className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8]">Save</button>
                      <button onClick={() => setEditingSection(null)} className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-[#172033]">{profile.university}</p>
                    <p className="text-sm text-[#667085]">{profile.major}</p>
                    <p className="text-sm text-[#667085]">Expected: {profile.graduationYear}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full font-medium">GPA: {profile.gpa}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#172033]">Professional bio</h2>
              <button onClick={() => setEditingSection(editingSection === 'bio' ? null : 'bio')} className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors">
                <EditIcon size={13} /> Edit
              </button>
            </div>
            {editingSection === 'bio' ? (
              <div>
                <textarea
                  rows={4}
                  defaultValue={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB] resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSave} className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8]">Save</button>
                  <button onClick={() => setEditingSection(null)} className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#667085] leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#172033]">Skills</h2>
              <button onClick={() => setAddingSkill(!addingSkill)} className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                <PlusIcon size={13} /> Add skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map(s => (
                <div key={s} className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium group">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-[#93C5FD] hover:text-[#2563EB] transition-colors opacity-0 group-hover:opacity-100">
                    <XIcon size={12} />
                  </button>
                </div>
              ))}
            </div>
            {addingSkill && (
              <div>
                <p className="text-xs font-medium text-[#667085] mb-2">Suggested skills to add:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SKILLS.filter(s => !profile.skills.includes(s)).map(s => (
                    <button
                      key={s}
                      onClick={() => addSkill(s)}
                      className="text-xs border border-dashed border-[#E4E7EC] text-[#667085] px-2.5 py-1 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <h2 className="text-base font-semibold text-[#172033] mb-3">Resume</h2>
            <div className="border-2 border-dashed border-[#E4E7EC] rounded-lg p-6 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
              <UploadIcon size={24} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm font-medium text-[#172033]">Upload your resume</p>
              <p className="text-xs text-[#667085] mt-1">PDF, DOC, or DOCX · max 5 MB</p>
              <button className="mt-3 text-xs font-medium text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded hover:bg-[#EFF6FF] transition-colors">
                Choose file
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
