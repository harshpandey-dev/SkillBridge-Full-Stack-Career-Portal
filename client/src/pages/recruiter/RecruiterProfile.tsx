import { useState, useEffect, useCallback, useRef } from 'react'
import {
  EditIcon, MailIcon, PhoneIcon, BuildingIcon, GlobeIcon, CheckIcon,
  MapPinIcon, TrashIcon,
} from '../../components/icons'
import {
  recruiterProfileService,
  type RecruiterProfileData,
  type RecruiterStats,
  type RecruiterJobSummary,
  type RecruiterNotificationPreferences,
} from '../../services/recruiterProfile.service'
import { uploadService } from '../../services/upload.service'
import { useAuth } from '../../context/AuthContext'
import { getApiErrorMessage } from '../../lib/api'

interface Props {
  navigate?: (page: string) => void
}

export default function RecruiterProfile({ navigate: _navigate }: Props) {
  const { refreshUser } = useAuth()

  // Profile data & states
  const [profileData, setProfileData] = useState<RecruiterProfileData | null>(null)
  const [stats, setStats] = useState<RecruiterStats | null>(null)
  const [jobSummary, setJobSummary] = useState<RecruiterJobSummary | null>(null)
  const [preferences, setPreferences] = useState<RecruiterNotificationPreferences | null>(null)

  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null)

  // Section editing states: 'personal' | 'company' | null
  const [editing, setEditing] = useState<string | null>(null)
  const [savingSection, setSavingSection] = useState(false)

  // Personal form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [position, setPosition] = useState('')

  // Company form fields
  const [companyName, setCompanyName] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [companyLocation, setCompanyLocation] = useState('')

  // File uploads
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [updatingPrefKey, setUpdatingPrefKey] = useState<string | null>(null)

  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const logoInputRef = useRef<HTMLInputElement | null>(null)

  const showSuccessBanner = (message: string) => {
    setSavedSuccess(message)
    setTimeout(() => setSavedSuccess(null), 3000)
  }

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true)
      setPageError(null)
      const [profileRes, statsRes, summaryRes, prefsRes] = await Promise.all([
        recruiterProfileService.getProfile(),
        recruiterProfileService.getRecruiterStats().catch(() => ({
          activeJobs: 0,
          totalApplicants: 0,
          shortlistedCandidates: 0,
          selectedCandidates: 0,
        })),
        recruiterProfileService.getJobSummary().catch(() => ({
          openJobs: 0,
          closedJobs: 0,
          draftJobs: 0,
          totalJobs: 0,
          totalApplications: 0,
        })),
        recruiterProfileService.getNotificationPreferences().catch(() => ({
          newApplications: true,
          applicationUpdates: true,
          jobPerformanceUpdates: true,
          platformAnnouncements: false,
        })),
      ])

      setProfileData(profileRes)
      setStats(statsRes)
      setJobSummary(summaryRes)
      setPreferences(prefsRes)

      // Initialize form fields
      setName(profileRes.user.name || '')
      setPhone(profileRes.user.phone || '')
      setLocation(profileRes.user.location || '')
      setPosition(profileRes.recruiterProfile.position || '')

      setCompanyName(profileRes.company?.name || '')
      setCompanyWebsite(profileRes.company?.website || '')
      setCompanyDescription(profileRes.company?.description || '')
      setCompanySize(profileRes.company?.size || '')
      setCompanyLocation(profileRes.company?.location || '')
    } catch (err: unknown) {
      setPageError(getApiErrorMessage(err, 'Failed to load recruiter profile details.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Save Personal Details
  const handleSavePersonal = async () => {
    if (!name.trim()) {
      setActionError('Full name is required.')
      return
    }

    try {
      setSavingSection(true)
      setActionError(null)
      const updated = await recruiterProfileService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        position: position.trim() || null,
      })
      setProfileData(updated)
      setEditing(null)
      await refreshUser().catch(() => {})
      showSuccessBanner('Personal details updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update personal details.'))
    } finally {
      setSavingSection(false)
    }
  }

  // Save Company Details
  const handleSaveCompany = async () => {
    if (!companyName.trim()) {
      setActionError('Company name is required.')
      return
    }

    try {
      setSavingSection(true)
      setActionError(null)
      const updated = await recruiterProfileService.updateProfile({
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim() || null,
        companyDescription: companyDescription.trim() || null,
        companySize: companySize.trim() || null,
        companyLocation: companyLocation.trim() || null,
      })
      setProfileData(updated)
      setEditing(null)
      await refreshUser().catch(() => {})
      showSuccessBanner('Company information updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update company information.'))
    } finally {
      setSavingSection(false)
    }
  }

  // Profile Image Upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          user: {
            ...prev.user,
            profileImage: res.profileImage,
          },
        }
      })
      await refreshUser().catch(() => {})
      showSuccessBanner('Profile photo updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to upload profile photo.'))
    } finally {
      setUploadingImage(false)
      if (imageInputRef.current) imageInputRef.current.value = ''
    }
  }

  // Profile Image Delete
  const handleDeleteProfileImage = async () => {
    try {
      setUploadingImage(true)
      setActionError(null)
      await uploadService.deleteProfileImage()
      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          user: {
            ...prev.user,
            profileImage: null,
          },
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

  // Company Logo Upload
  const handleCompanyLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setActionError('Only JPG, JPEG, PNG, and WEBP image formats are supported.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setActionError('Company logo size must not exceed 5 MB.')
      return
    }

    try {
      setUploadingLogo(true)
      setActionError(null)
      const res = await uploadService.uploadCompanyLogo(file)
      setProfileData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          company: prev.company
            ? { ...prev.company, logo: res.logo }
            : {
                id: '',
                name: companyName || 'Company',
                logo: res.logo,
              },
        }
      })
      await refreshUser().catch(() => {})
      showSuccessBanner('Company logo updated successfully')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to upload company logo.'))
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  // Company Logo Delete
  const handleDeleteCompanyLogo = async () => {
    try {
      setUploadingLogo(true)
      setActionError(null)
      await uploadService.deleteCompanyLogo()
      setProfileData(prev => {
        if (!prev || !prev.company) return prev
        return {
          ...prev,
          company: {
            ...prev.company,
            logo: null,
          },
        }
      })
      await refreshUser().catch(() => {})
      showSuccessBanner('Company logo removed')
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to remove company logo.'))
    } finally {
      setUploadingLogo(false)
    }
  }

  // Notification Preferences Toggle (Optimistic Update with safe rollback)
  const handleTogglePreference = async (key: keyof RecruiterNotificationPreferences) => {
    if (!preferences || updatingPrefKey) return
    const originalValue = preferences[key]
    const newValue = !originalValue

    setPreferences(prev => (prev ? { ...prev, [key]: newValue } : prev))
    setUpdatingPrefKey(key)

    try {
      setActionError(null)
      const updated = await recruiterProfileService.updateNotificationPreferences({
        [key]: newValue,
      })
      setPreferences(updated)
    } catch (err: unknown) {
      // Rollback on failure
      setPreferences(prev => (prev ? { ...prev, [key]: originalValue } : prev))
      setActionError(getApiErrorMessage(err, 'Failed to update notification preference.'))
    } finally {
      setUpdatingPrefKey(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5 max-w-[960px] animate-pulse">
        <div className="h-8 bg-[#E4E7EC] rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-56" />
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 h-40" />
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-4 h-48" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-48" />
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-48" />
            <div className="bg-white border border-[#E4E7EC] rounded-lg p-6 h-56" />
          </div>
        </div>
      </div>
    )
  }

  if (pageError || !profileData) {
    return (
      <div className="space-y-5 max-w-[960px]">
        <h1 className="text-2xl font-bold text-[#172033]">Recruiter Profile</h1>
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-6 text-center">
          <p className="text-sm text-[#DC2626] font-medium">{pageError || 'Unable to load profile data.'}</p>
          <button
            onClick={loadAllData}
            className="mt-4 bg-[#2563EB] text-white px-4 py-2 rounded text-sm font-semibold hover:bg-[#1D4ED8] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { user, recruiterProfile, company } = profileData
  const companyInitials = company?.name ? company.name[0].toUpperCase() : 'C'
  const userInitials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('') || 'RC'

  return (
    <div className="space-y-5 max-w-[960px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172033]">Recruiter Profile</h1>
          <p className="text-sm text-[#667085] mt-0.5">Manage your professional information visible to students</p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 bg-[#E6F7F5] text-[#0F9D8A] px-3 py-2 rounded text-sm font-medium">
            <CheckIcon size={15} /> {savedSuccess}
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
        {/* Left Column */}
        <div className="space-y-4">
          {/* Identity card */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5 text-center relative group">
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleProfileImageChange}
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
                  {userInitials}
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
                onClick={handleDeleteProfileImage}
                className="text-xs text-[#DC2626] hover:underline mb-2 block mx-auto"
              >
                Remove photo
              </button>
            )}

            <h2 className="font-bold text-[#172033] text-lg">{user.name}</h2>
            <p className="text-sm text-[#667085] mt-0.5">{recruiterProfile.position || 'Recruiter'}</p>
            <p className="text-sm font-medium text-[#163A5F] mt-1">{company?.name || 'SkillBridge Partner'}</p>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="text-xs bg-[#EFF6FF] text-[#2563EB] px-2.5 py-1 rounded-full font-medium">
                Verified Recruiter
              </span>
            </div>
          </div>

          {/* Contact card */}
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
            <div className="flex items-center gap-2 text-sm text-[#667085]">
              <BuildingIcon size={14} className="shrink-0" /> {company?.name || 'Company not set'}
            </div>
            {company?.website && (
              <div className="flex items-center gap-2 text-sm text-[#667085]">
                <GlobeIcon size={14} className="shrink-0" />{' '}
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline truncate"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>

          {/* Recruiting activity card (Real metrics) */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[#172033] mb-3">Recruiting activity</h3>
            <div className="space-y-3">
              {[
                { label: 'Active jobs', value: String(stats?.activeJobs ?? 0) },
                { label: 'Total jobs posted', value: String(jobSummary?.totalJobs ?? 0) },
                { label: 'Candidates reviewed', value: String(stats?.totalApplicants ?? 0) },
                { label: 'Shortlisted candidates', value: String(stats?.shortlistedCandidates ?? 0) },
                { label: 'Offers / Selected', value: String(stats?.selectedCandidates ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-[#667085]">{label}</span>
                  <span className="text-sm font-semibold text-[#172033]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal information */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Personal information</h2>
              <button
                onClick={() => {
                  setActionError(null)
                  setEditing(editing === 'personal' ? null : 'personal')
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB]"
              >
                <EditIcon size={13} /> {editing === 'personal' ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing === 'personal' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Full name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
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
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Position / Title</label>
                    <input
                      type="text"
                      value={position}
                      onChange={e => setPosition(e.target.value)}
                      placeholder="e.g. Lead Talent Acquisition"
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#667085] block mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={savingSection}
                    onClick={handleSavePersonal}
                    className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {savingSection ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA]"
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
                  { label: 'Position', value: recruiterProfile.position },
                  { label: 'Location', value: user.location },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#667085] mb-1">{label}</p>
                    <p className="text-sm font-medium text-[#172033]">{value || <span className="text-[#94A3B8] italic">Not provided</span>}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company info */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#172033]">Company information</h2>
              <button
                onClick={() => {
                  setActionError(null)
                  setEditing(editing === 'company' ? null : 'company')
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#2563EB]"
              >
                <EditIcon size={13} /> {editing === 'company' ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {/* Company Logo Section */}
            <div className="mb-4 pb-4 border-b border-[#F2F4F7] flex items-center gap-4">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleCompanyLogoChange}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <div className="relative w-14 h-14 rounded-lg bg-[#163A5F] flex items-center justify-center text-white font-bold text-xl overflow-hidden border border-[#E4E7EC] shrink-0">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  companyInitials
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#172033]">{company?.name || 'Company Logo'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs font-medium text-[#2563EB] hover:underline disabled:opacity-50"
                  >
                    {uploadingLogo ? 'Uploading logo…' : company?.logo ? 'Replace logo' : 'Upload logo'}
                  </button>
                  {company?.logo && (
                    <>
                      <span className="text-xs text-[#CBD5E1]">·</span>
                      <button
                        type="button"
                        disabled={uploadingLogo}
                        onClick={handleDeleteCompanyLogo}
                        className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 disabled:opacity-50"
                      >
                        <TrashIcon size={11} /> Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {editing === 'company' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Company name *</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Website</label>
                    <input
                      type="text"
                      value={companyWebsite}
                      placeholder="https://example.com"
                      onChange={e => setCompanyWebsite(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Company size</label>
                    <input
                      type="text"
                      value={companySize}
                      placeholder="e.g. 50-200 employees"
                      onChange={e => setCompanySize(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#667085] block mb-1">Headquarters Location</label>
                    <input
                      type="text"
                      value={companyLocation}
                      placeholder="e.g. San Francisco, CA"
                      onChange={e => setCompanyLocation(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#667085] block mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={companyDescription}
                      placeholder="Brief overview of your company mission and culture..."
                      onChange={e => setCompanyDescription(e.target.value)}
                      className="w-full border border-[#E4E7EC] rounded px-2.5 py-1.5 text-sm outline-none focus:border-[#2563EB] resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    disabled={savingSection}
                    onClick={handleSaveCompany}
                    className="bg-[#2563EB] text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-60"
                  >
                    {savingSection ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="border border-[#E4E7EC] text-[#667085] px-4 py-1.5 rounded text-sm hover:bg-[#F7F8FA]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company name', value: company?.name },
                  { label: 'Website', value: company?.website },
                  { label: 'Company size', value: company?.size },
                  { label: 'Location', value: company?.location },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#667085] mb-1">{label}</p>
                    <p className="text-sm font-medium text-[#172033]">{value || <span className="text-[#94A3B8] italic">Not provided</span>}</p>
                  </div>
                ))}
                {company?.description && (
                  <div className="col-span-2 mt-1">
                    <p className="text-xs text-[#667085] mb-1">About company</p>
                    <p className="text-sm text-[#667085] leading-relaxed">{company.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notification preferences */}
          <div className="bg-white border border-[#E4E7EC] rounded-lg p-5">
            <h2 className="text-base font-semibold text-[#172033] mb-4">Notification preferences</h2>
            <div className="space-y-3">
              {[
                {
                  key: 'newApplications' as const,
                  label: 'New application received',
                  desc: 'Get notified when a student applies to your job',
                  checked: preferences?.newApplications ?? true,
                },
                {
                  key: 'applicationUpdates' as const,
                  label: 'Application status updates',
                  desc: 'Reminders and updates on candidate application stages',
                  checked: preferences?.applicationUpdates ?? true,
                },
                {
                  key: 'jobPerformanceUpdates' as const,
                  label: 'Job performance updates',
                  desc: 'Analytics and applicant volume reports for your listings',
                  checked: preferences?.jobPerformanceUpdates ?? true,
                },
                {
                  key: 'platformAnnouncements' as const,
                  label: 'Platform announcements',
                  desc: 'News and feature updates from SkillBridge',
                  checked: preferences?.platformAnnouncements ?? false,
                },
              ].map(({ key, label, desc, checked }) => (
                <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-[#F2F4F7] last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-[#172033]">{label}</p>
                    <p className="text-xs text-[#667085] mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={updatingPrefKey === key}
                      onChange={() => handleTogglePreference(key)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E4E7EC] rounded-full peer peer-checked:bg-[#2563EB] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
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
