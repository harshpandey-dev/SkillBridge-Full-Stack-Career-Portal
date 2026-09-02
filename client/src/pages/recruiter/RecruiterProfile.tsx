import { useState } from 'react'
import { CURRENT_RECRUITER } from '../../mockData'
import { EditIcon, MailIcon, PhoneIcon, BuildingIcon, GlobeIcon, CheckIcon } from '../../components/icons'

interface Props {
  navigate?: (page: string) => void
}

export default function RecruiterProfile({ navigate: _navigate }: Props) {
  const [profile, setProfile] = useState(CURRENT_RECRUITER)
  const [editing, setEditing] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const set = (key: string, value: string) => setProfile(p => ({ ...p, [key]: value }))

  const handleSave = () => {
    setSaved(true)
    setEditing(null)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-[960px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Recruiter Profile</h1>
          <p className="text-sm text-[#667085] mt-0.5">Manage your professional information visible to students</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 bg-[#E6F7F5] text-[#0F9D8A] px-3 py-2 rounded text-sm font-medium">
            <CheckIcon size={15} /> Saved successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 text-center">
            <div
              className="w-20 h-20 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3"
              style={{ backgroundColor: profile.companyColor }}
            >
              {profile.company[0]}
            </div>
            <h2 className="font-bold text-[#172033] text-lg">{profile.name}</h2>
            <p className="text-sm text-[#667085] mt-0.5">{profile.position}</p>
            <p className="text-sm font-medium text-[#163A5F] mt-1">{profile.company}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded-full font-medium">Verified Recruiter</span>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 space-y-2.5">
            <h3 className="text-sm font-semibold text-[#172033]">Contact</h3>
            <div className="flex items-center gap-2 text-sm text-[#667085]"><MailIcon size={14} /> {profile.email}</div>
            <div className="flex items-center gap-2 text-sm text-[#667085]"><PhoneIcon size={14} /> {profile.phone}</div>
            <div className="flex items-center gap-2 text-sm text-[#667085]"><BuildingIcon size={14} /> {profile.department}</div>
            <div className="flex items-center gap-2 text-sm text-[#667085]"><GlobeIcon size={14} /> <a href="#" className="text-[#2563EB] hover:underline">{profile.website}</a></div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#172033] mb-3">Recruiting activity</h3>
            <div className="space-y-3">
              {[
                { label: 'Jobs posted', value: '8' },
                { label: 'Candidates reviewed', value: '342' },
                { label: 'Hires made', value: '12' },
                { label: 'Response rate', value: '94%' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-[#667085]">{label}</span>
                  <span className="text-sm font-semibold text-[#172033]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal details */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Personal information</h2>
              <button onClick={() => setEditing(editing === 'personal' ? null : 'personal')} className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB]">
                <EditIcon size={13} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Full name', value: profile.name, key: 'name' },
                { label: 'Email', value: profile.email, key: 'email' },
                { label: 'Phone', value: profile.phone, key: 'phone' },
                { label: 'Position', value: profile.position, key: 'position' },
                { label: 'Department', value: profile.department, key: 'department' },
              ].map(({ label, value, key }) => (
                <div key={key}>
                  <p className="text-xs text-[#667085] mb-1">{label}</p>
                  {editing === 'personal' ? (
                    <input defaultValue={value} onChange={e => set(key, e.target.value)} className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                  ) : (
                    <p className="text-sm font-medium text-[#172033]">{value}</p>
                  )}
                </div>
              ))}
            </div>
            {editing === 'personal' && (
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8]">Save</button>
                <button onClick={() => setEditing(null)} className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm">Cancel</button>
              </div>
            )}
          </div>

          {/* Company info */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Company information</h2>
              <button onClick={() => setEditing(editing === 'company' ? null : 'company')} className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB]">
                <EditIcon size={13} /> Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Company name', value: profile.company, key: 'company' },
                { label: 'Industry', value: profile.industry, key: 'industry' },
                { label: 'Company size', value: profile.companySize, key: 'companySize' },
                { label: 'Website', value: profile.website, key: 'website' },
              ].map(({ label, value, key }) => (
                <div key={key}>
                  <p className="text-xs text-[#667085] mb-1">{label}</p>
                  {editing === 'company' ? (
                    <input defaultValue={value} onChange={e => set(key, e.target.value)} className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]" />
                  ) : (
                    <p className="text-sm font-medium text-[#172033]">{value}</p>
                  )}
                </div>
              ))}
            </div>
            {editing === 'company' && (
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8]">Save</button>
                <button onClick={() => setEditing(null)} className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm">Cancel</button>
              </div>
            )}
          </div>

          {/* Notification preferences */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <h2 className="text-base font-semibold text-[#172033] mb-4">Notification preferences</h2>
            <div className="space-y-3">
              {[
                { label: 'New application received', desc: 'Get notified when a student applies to your job', default: true },
                { label: 'Application status reminders', desc: 'Reminders to review applications older than 7 days', default: true },
                { label: 'Platform announcements', desc: 'News and feature updates from SkillBridge', default: false },
                { label: 'Candidate match suggestions', desc: 'Receive profiles of students who match your open roles', default: true },
              ].map(({ label, desc, default: checked }) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-[#F2F4F7] last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[#172033]">{label}</p>
                    <p className="text-xs text-[#667085] mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#E4E7EC] rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
