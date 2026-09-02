import { useState, useEffect, useCallback, useRef } from 'react'
import {
  EditIcon, MailIcon, PhoneIcon, MapPinIcon,
  UploadIcon, PlusIcon, XIcon, CheckIcon, TrashIcon,
} from '../../components/icons'
import {
  studentProfileService,
  type StudentProfileData,
  type GlobalSkillItem,
} from '../../services/studentProfile.service'
import { uploadService } from '../../services/upload.service'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate?: (page: string) => void
}

const DEFAULT_SUGGESTED_SKILLS = [
  'React', 'TypeScript', 'Python', 'Node.js', 'SQL',
  'Machine Learning', 'Figma', 'Git', 'AWS', 'GraphQL',
  'Java', 'C++', 'Go', 'PostgreSQL', 'MongoDB',
]

export default function StudentProfile({ navigate: _navigate }: Props) {
  const { refreshUser } = useAuth()
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Editing sections: 'personal' | 'edu' | 'bio' | null
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [savingSection, setSavingSection] = useState(false)

  // Personal form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')

  // Education form state
  const [university, setUniversity] = useState('')
  const [major, setMajor] = useState('')
  const [graduationYear, setGraduationYear] = useState<number | ''>('')
  const [gpa, setGpa] = useState<string>('')

  // Bio form state
  const [bio, setBio] = useState('')

  // Skills state
  const [addingSkill, setAddingSkill] = useState(false)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [skillSuggestions, setSkillSuggestions] = useState<GlobalSkillItem[]>([])
  const [searchingSkills, setSearchingSkills] = useState(false)
  const [submittingSkill, setSubmittingSkill] = useState(false)

  // File Upload states
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setPageError(null)
      const data = await studentProfileService.getProfile()
      setProfileData(data)

      // Initialize form fields
      setName(data.user.name || '')
      setPhone(data.user.phone || '')
      setLocation(data.user.location || '')
      setUniversity(data.profile.university || '')
      setMajor(data.profile.major || '')
      setGraduationYear(data.profile.graduationYear || '')
      setGpa(data.profile.gpa !== null && data.profile.gpa !== undefined ? String(data.profile.gpa) : '')
      setBio(data.profile.bio || '')
    } catch (err: unknown) {
      setPageError(getApiErrorMessage(err, 'Failed to load profile details.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Fetch skill suggestions when typing
  useEffect(() => {
    if (!addingSkill || !skillSearchQuery.trim()) {
      setSkillSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchingSkills(true)
        const results = await studentProfileService.searchSkills(skillSearchQuery.trim(), 8)
        setSkillSuggestions(results)
      } catch {
        setSkillSuggestions([])
      } finally {
        setSearchingSkills(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [addingSkill, skillSearchQuery])

  const showSuccessBanner = (message: string) => {
    setSaveSuccess(message)
    setTimeout(() => setSaveSuccess(null), 3000)
  }

  // Save Personal Details
  const handleSavePersonal = async () => {
    if (!name.trim()) {
      setActionError('Name is required.')
      return
    }

    try {
      setSavingSection(true)
      setActionError(null)
      const updated = await studentProfileService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
      })
      setProfileData(updated)
      setEditingSection(null)
      await refreshUser().catch(() => {})
      showSuccessBanner('Personal details updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update personal details.'))
    } finally {
      setSavingSection(false)
    }
  }

  // Save Education Details
  const handleSaveEdu = async () => {
    if (!university.trim()) {
      setActionError('University name is required.')
      return
    }
    if (!major.trim()) {
      setActionError('Major is required.')
      return
    }

    const parsedYear = typeof graduationYear === 'number' ? graduationYear : parseInt(String(graduationYear), 10)
    if (isNaN(parsedYear) || parsedYear < 1980 || parsedYear > 2050) {
      setActionError('Graduation year must be between 1980 and 2050.')
      return
    }

    let parsedGpa: number | null = null
    if (gpa.trim()) {
      parsedGpa = parseFloat(gpa.trim())
      if (isNaN(parsedGpa) || parsedGpa < 0.0 || parsedGpa > 4.0) {
        setActionError('GPA must be a number between 0.0 and 4.0.')
        return
      }
    }

    try {
      setSavingSection(true)
      setActionError(null)
      const updated = await studentProfileService.updateProfile({
        university: university.trim(),
        major: major.trim(),
        graduationYear: parsedYear,
        gpa: parsedGpa,
      })
      setProfileData(updated)
      setEditingSection(null)
      showSuccessBanner('Education details updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update education details.'))
    } finally {
      setSavingSection(false)
    }
  }

  // Save Bio
  const handleSaveBio = async () => {
    try {
      setSavingSection(true)
      setActionError(null)
      const updated = await studentProfileService.updateProfile({
        bio: bio.trim() || null,
      })
      setProfileData(updated)
      setEditingSection(null)
      showSuccessBanner('Bio updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update bio.'))
    } finally {
      setSavingSection(false)
    }
  }

  // Add Skill
  const handleAddSkill = async (skillName: string) => {
    if (!skillName.trim()) return
    const trimmed = skillName.trim()

    // Client duplicate check
    if (profileData?.skills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setActionError(`Skill "${trimmed}" is already added.`)
      return
    }

    try {
      setSubmittingSkill(true)
      setActionError(null)
      const newSkill = await studentProfileService.addSkill(trimmed)
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)

      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          skills: [...prev.skills, newSkill],
          profileCompletion: comp || prev.profileCompletion,
        }
      })
      setSkillSearchQuery('')
      showSuccessBanner(`Added "${trimmed}" to your skills`)
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to add skill.'))
    } finally {
      setSubmittingSkill(false)
    }
  }

  // Remove Skill
  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    const originalData = profileData
    try {
      setActionError(null)
      // Optimistic update
      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          skills: prev.skills.filter(s => s.id !== skillId),
        }
      })

      await studentProfileService.removeSkill(skillId)
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)
      if (comp) {
        setProfileData(prev => prev ? { ...prev, profileCompletion: comp } : prev)
      }
      showSuccessBanner(`Removed "${skillName}"`)
    } catch (err: unknown) {
      setProfileData(originalData)
      setActionError(getApiErrorMessage(err, 'Failed to remove skill.'))
    }
  }

  // Resume Upload
  const handleResumeFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setActionError('Only PDF resume files are accepted.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError('Resume file size must not exceed 5 MB.')
      return
    }

    try {
      setUploadingResume(true)
      setActionError(null)
      const res = await uploadService.uploadResume(file)
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)

      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          profile: {
            ...prev.profile,
            resumeUrl: res.resumeUrl,
            resumePublicId: res.resumePublicId,
          },
          profileCompletion: comp || prev.profileCompletion,
        }
      })
      showSuccessBanner('Resume uploaded successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to upload resume.'))
    } finally {
      setUploadingResume(false)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
    }
  }

  // Resume Delete
  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return

    try {
      setUploadingResume(true)
      setActionError(null)
      await uploadService.deleteResume()
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)

      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          profile: {
            ...prev.profile,
            resumeUrl: null,
            resumePublicId: null,
          },
          profileCompletion: comp || prev.profileCompletion,
        }
      })
      showSuccessBanner('Resume removed successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to remove resume.'))
    } finally {
      setUploadingResume(false)
    }
  }

  // Profile Image Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setActionError('Only JPG, JPEG, PNG, and WEBP image formats are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError('Profile image size must not exceed 5 MB.')
      return
    }

    try {
      setUploadingImage(true)
      setActionError(null)
      const res = await uploadService.uploadProfileImage(file)
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)

      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          user: {
            ...prev.user,
            profileImage: res.profileImage,
          },
          profileCompletion: comp || prev.profileCompletion,
        }
      })
      await refreshUser().catch(() => {})
      showSuccessBanner('Profile photo updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to upload profile image.'))
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  // Profile Image Delete
  const handleDeleteImage = async () => {
    try {
      setUploadingImage(true)
      setActionError(null)
      await uploadService.deleteProfileImage()
      const comp = await studentProfileService.getProfileCompletion().catch(() => null)

      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          user: {
            ...prev.user,
            profileImage: null,
          },
          profileCompletion: comp || prev.profileCompletion,
        }
      })
      await refreshUser().catch(() => {})
      showSuccessBanner('Profile photo removed')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to remove profile photo.'))
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-[960px] animate-pulse">
        <div className="h-8 bg-[#E4E7EC] rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-8 text-center space-y-3">
              <div className="w-20 h-20 bg-[#F2F4F7] rounded-full mx-auto" />
              <div className="h-4 bg-[#F2F4F7] rounded w-3/4 mx-auto" />
              <div className="h-3 bg-[#F2F4F7] rounded w-1/2 mx-auto" />
            </div>
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 h-44" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-48" />
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-48" />
          </div>
        </div>
      </div>
    )
  }

  if (pageError || !profileData) {
    return (
      <div className="space-y-5 max-w-[960px]">
        <h1 className="text-2xl font-bold text-[#172033]">My Profile</h1>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6 text-center">
          <p className="text-sm text-[#DC2626] font-medium">{pageError || 'Unable to load profile data.'}</p>
          <button
            onClick={loadProfile}
            className="mt-4 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { user, profile, skills, profileCompletion } = profileData
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'ST'

  const completionPercentage = profileCompletion.completionPercentage || 0

  const completionItems = [
    { label: 'Basic info', done: profileCompletion.completedFields.includes('name') && profileCompletion.completedFields.includes('phone') },
    { label: 'Education', done: profileCompletion.completedFields.includes('university') && profileCompletion.completedFields.includes('major') },
    { label: 'Skills added', done: profileCompletion.completedFields.includes('skills') },
    { label: 'Bio written', done: profileCompletion.completedFields.includes('bio') },
    { label: 'Resume uploaded', done: profileCompletion.completedFields.includes('resume') },
    { label: 'Profile photo', done: profileCompletion.completedFields.includes('profileImage') },
  ]

  // Suggested skills filtered by already chosen
  const existingSkillNames = skills.map(s => s.name.toLowerCase())
  const filteredPresetSuggestions = DEFAULT_SUGGESTED_SKILLS.filter(
    s => !existingSkillNames.includes(s.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-[960px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">My Profile</h1>
          <p className="text-sm text-[#667085] mt-0.5">Manage your personal details, skills, and resume</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-2 bg-[#E6F7F5] text-[#0F9D8A] px-3 py-2 rounded text-sm font-medium">
            <CheckIcon size={15} /> {saveSuccess}
          </div>
        )}
      </div>

      {actionError && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded p-3 text-sm text-[#DC2626] flex justify-between items-center">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs text-[#DC2626] underline ml-2">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar & identity */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 text-center relative group">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />
            <div className="relative w-20 h-20 mx-auto mb-3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border border-[#E4E7EC]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#163A5F] flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                disabled={uploadingImage}
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
                title="Change profile photo"
              >
                {uploadingImage ? '...' : 'Change'}
              </button>
            </div>

            {user.profileImage && (
              <button
                disabled={uploadingImage}
                onClick={handleDeleteImage}
                className="text-xs text-[#DC2626] hover:underline mb-2 block mx-auto"
              >
                Remove photo
              </button>
            )}

            <h2 className="font-semibold text-[#172033] text-lg">{user.name}</h2>
            <p className="text-sm text-[#667085] mt-0.5">{profile.major}</p>
            <p className="text-sm text-[#667085]">{profile.university}</p>
          </div>

          {/* Profile completion */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#172033]">Profile strength</h3>
              <span className="text-sm font-bold text-[#2563EB]">{completionPercentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#F2F4F7] rounded-full mb-4">
              <div className="h-1.5 bg-[#2563EB] rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
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
              <MailIcon size={14} className="shrink-0" /> {user.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <PhoneIcon size={14} className="shrink-0" /> {user.phone || <span className="text-[#94A3B8] italic">No phone added</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <MapPinIcon size={14} className="shrink-0" /> {user.location || <span className="text-[#94A3B8] italic">No location added</span>}
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
                onClick={() => {
                  setActionError(null)
                  setEditingSection(editingSection === 'personal' ? null : 'personal')
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors"
              >
                <EditIcon size={13} /> {editingSection === 'personal' ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingSection === 'personal' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Full name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Email address</label>
                    <input
                      disabled
                      value={user.email}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm text-[#667085] bg-[#F7F8FA] outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm text-[#172033] outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={savingSection}
                    onClick={handleSavePersonal}
                    className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60 transition-colors"
                  >
                    {savingSection ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Phone', value: user.phone },
                  { label: 'Location', value: user.location },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium text-[#667085] mb-1">{label}</p>
                    <p className="text-sm text-[#172033]">{value || <span className="text-[#94A3B8] italic">Not provided</span>}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Education</h2>
              <button
                onClick={() => {
                  setActionError(null)
                  setEditingSection(editingSection === 'edu' ? null : 'edu')
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors"
              >
                <EditIcon size={13} /> {editingSection === 'edu' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded bg-[#163A5F] flex items-center justify-center text-white font-bold text-xs shrink-0">
                {profile.university.slice(0, 2).toUpperCase() || 'UN'}
              </div>
              <div className="flex-1">
                {editingSection === 'edu' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-[#667085] block mb-1">University *</label>
                      <input
                        type="text"
                        value={university}
                        onChange={e => setUniversity(e.target.value)}
                        className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#667085] block mb-1">Major *</label>
                      <input
                        type="text"
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#667085] block mb-1">Graduation Year *</label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={e => setGraduationYear(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#667085] block mb-1">GPA (0.0 - 4.0)</label>
                        <input
                          type="text"
                          value={gpa}
                          placeholder="e.g. 3.85"
                          onChange={e => setGpa(e.target.value)}
                          className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        disabled={savingSection}
                        onClick={handleSaveEdu}
                        className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                      >
                        {savingSection ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingSection(null)}
                        className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-[#172033]">{profile.university}</p>
                    <p className="text-sm text-[#667085]">{profile.major}</p>
                    <p className="text-sm text-[#667085]">Expected: {profile.graduationYear}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {profile.gpa !== null && profile.gpa !== undefined && (
                        <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded-full font-medium">
                          GPA: {profile.gpa}
                        </span>
                      )}
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
              <button
                onClick={() => {
                  setActionError(null)
                  setEditingSection(editingSection === 'bio' ? null : 'bio')
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB] transition-colors"
              >
                <EditIcon size={13} /> {editingSection === 'bio' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editingSection === 'bio' ? (
              <div>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a brief overview of your background, career interests, and passion projects..."
                  className="w-full border border-[#E4E7EC] rounded px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#2563EB] resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    disabled={savingSection}
                    onClick={handleSaveBio}
                    className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {savingSection ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingSection(null)}
                    className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#667085] leading-relaxed">
                {profile.bio || <span className="text-[#94A3B8] italic">No professional bio added yet. Click edit to share your story with recruiters.</span>}
              </p>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-[#172033]">Skills</h2>
              <button
                onClick={() => setAddingSkill(!addingSkill)}
                className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
              >
                <PlusIcon size={13} /> {addingSkill ? 'Done' : 'Add skill'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-medium group"
                >
                  {s.name}
                  <button
                    onClick={() => handleRemoveSkill(s.id, s.name)}
                    className="text-[#93C5FD] hover:text-[#DC2626] transition-colors"
                    title={`Remove ${s.name}`}
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <p className="text-sm text-[#94A3B8] italic">No skills added yet. Add relevant technical and soft skills to improve job matching.</p>
              )}
            </div>

            {addingSkill && (
              <div className="space-y-3 pt-2 border-t border-[#F2F4F7]">
                {/* Search & Custom input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillSearchQuery}
                    onChange={e => setSkillSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (skillSearchQuery.trim()) handleAddSkill(skillSearchQuery)
                      }
                    }}
                    placeholder="Search or type a new skill..."
                    className="flex-1 border border-[#E4E7EC] rounded px-3 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                  />
                  <button
                    disabled={submittingSkill || !skillSearchQuery.trim()}
                    onClick={() => handleAddSkill(skillSearchQuery)}
                    className="bg-[#2563EB] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Autocomplete suggestions from backend */}
                {skillSuggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-[#667085] mb-1">
                      {searchingSkills ? 'Searching skills…' : 'Matching skills:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {skillSuggestions
                        .filter(s => !existingSkillNames.includes(s.name.toLowerCase()))
                        .map(s => (
                          <button
                            key={s.id}
                            disabled={submittingSkill}
                            onClick={() => handleAddSkill(s.name)}
                            className="text-xs bg-[#F7F8FA] border border-[#E4E7EC] text-[#172033] px-2.5 py-1 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                          >
                            + {s.name}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Suggested skills presets */}
                <div>
                  <p className="text-xs font-medium text-[#667085] mb-2">Suggested skills to add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {filteredPresetSuggestions.slice(0, 10).map(s => (
                      <button
                        key={s}
                        disabled={submittingSkill}
                        onClick={() => handleAddSkill(s)}
                        className="text-xs border border-dashed border-[#E4E7EC] text-[#667085] px-2.5 py-1 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <h2 className="text-base font-semibold text-[#172033] mb-3">Resume</h2>

            <input
              type="file"
              ref={resumeInputRef}
              onChange={handleResumeFileChange}
              accept="application/pdf"
              className="hidden"
            />

            {profile.resumeUrl ? (
              <div className="border border-[#E4E7EC] rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                    📄
                  </div>
                  <div>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#2563EB] hover:underline"
                    >
                      View Student Resume (PDF) ↗
                    </a>
                    <p className="text-xs text-[#0F9D8A] mt-0.5">Attached & visible to recruiters</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={uploadingResume}
                    onClick={() => resumeInputRef.current?.click()}
                    className="text-xs font-medium text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded hover:bg-[#EFF6FF] transition-colors disabled:opacity-50"
                  >
                    {uploadingResume ? 'Uploading…' : 'Replace'}
                  </button>
                  <button
                    disabled={uploadingResume}
                    onClick={handleDeleteResume}
                    className="text-xs font-medium text-[#DC2626] border border-[#FECACA] hover:bg-[#FEF2F2] px-2.5 py-1.5 rounded transition-colors disabled:opacity-50"
                    title="Delete resume"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => resumeInputRef.current?.click()}
                className="border-2 border-dashed border-[#E4E7EC] rounded-lg p-6 text-center hover:border-[#2563EB] transition-colors cursor-pointer"
              >
                <UploadIcon size={24} className="text-[#94A3B8] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#172033]">
                  {uploadingResume ? 'Uploading resume to Cloudinary…' : 'Upload your resume'}
                </p>
                <p className="text-xs text-[#667085] mt-1">PDF format only · max 5 MB</p>
                <button
                  type="button"
                  disabled={uploadingResume}
                  className="mt-3 text-xs font-medium text-[#2563EB] border border-[#2563EB] px-3 py-1.5 rounded hover:bg-[#EFF6FF] transition-colors"
                >
                  {uploadingResume ? 'Uploading…' : 'Choose file'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
