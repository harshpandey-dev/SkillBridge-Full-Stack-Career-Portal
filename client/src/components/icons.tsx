interface IconProps {
  size?: number
  className?: string
}

const icon = (path: string, viewBox = '0 0 24 24') =>
  ({ size = 18, className = '' }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path.split('|').map((d, i) => <path key={i} d={d} />)}
    </svg>
  )

const iconFill = (path: string, viewBox = '0 0 24 24') =>
  ({ size = 18, className = '' }: IconProps) => (
    <svg width={size} height={size} viewBox={viewBox} fill="currentColor" className={className}>
      {path.split('|').map((d, i) => <path key={i} d={d} />)}
    </svg>
  )

export const HomeIcon = icon('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z|M9 22V12h6v10')
export const BriefcaseIcon = icon('M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8|M1 10h22|M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')
export const BookOpenIcon = icon('M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z|M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z')
export const UsersIcon = icon('M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2|M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z|M23 21v-2a4 4 0 0 0-3-3.87|M16 3.13a4 4 0 0 1 0 7.75')
export const UserIcon = icon('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')
export const BarChart2Icon = icon('M18 20V10|M12 20V4|M6 20v-6')
export const SearchIcon = icon('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z|M21 21l-4.35-4.35')
export const BellIcon = icon('M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9|M13.73 21a2 2 0 0 1-3.46 0')
export const ChevronDownIcon = icon('M6 9l6 6 6-6')
export const ChevronRightIcon = icon('M9 18l6-6-6-6')
export const ChevronLeftIcon = icon('M15 18l-6-6 6-6')
export const PlusIcon = icon('M12 5v14|M5 12h14')
export const EditIcon = icon('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7|M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z')
export const TrashIcon = icon('M3 6h18|M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2|M10 11v6|M14 11v6')
export const EyeIcon = icon('M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z|M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')
export const DownloadIcon = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M7 10l5 5 5-5|M12 15V3')
export const XIcon = icon('M18 6L6 18|M6 6l12 12')
export const CheckIcon = icon('M20 6L9 17l-5-5')
export const FilterIcon = icon('M22 3H2l8 9.46V19l4 2v-8.54L22 3z')
export const BookmarkIcon = icon('M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z')
export const BookmarkFilledIcon = iconFill('M5 2a2 2 0 0 0-2 2v18l7-5 7 5V4a2 2 0 0 0-2-2H5z')
export const MapPinIcon = icon('M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z|M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z')
export const ClockIcon = icon('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 6v6l4 2')
export const DollarSignIcon = icon('M12 1v22|M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')
export const BuildingIcon = icon('M3 21h18|M5 21V7l8-4v18|M19 21V11l-6-4|M9 9h1v1H9z|M9 12h1v1H9z|M9 15h1v1H9z|M9 18h1v1H9z')
export const GlobeIcon = icon('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M2 12h20|M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z')
export const MailIcon = icon('M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z|M22 6l-10 7L2 6')
export const PhoneIcon = icon('M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18l3-.01a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.09-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z')
export const LinkedinIcon = icon('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z|M2 9h4v12H2z|M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z')
export const GithubIcon = icon('M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22')
export const StarIcon = icon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z')
export const UploadIcon = icon('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4|M17 8l-5-5-5 5|M12 3v12')
export const LogOutIcon = icon('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4|M16 17l5-5-5-5|M21 12H9')
export const SettingsIcon = icon('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z|M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z')
export const ExternalLinkIcon = icon('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6|M15 3h6v6|M10 14L21 3')
export const TrendingUpIcon = icon('M23 6l-9.5 9.5-5-5L1 18|M17 6h6v6')
export const AlertCircleIcon = icon('M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z|M12 8v4|M12 16h.01')
export const ShieldIcon = icon('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z')
export const AwardIcon = icon('M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z|M8.21 13.89L7 23l5-3 5 3-1.21-9.12')
export const SunIcon = icon('M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z|M12 1v2|M12 21v2|M4.22 4.22l1.42 1.42|M18.36 18.36l1.42 1.42|M1 12h2|M21 12h2|M4.22 19.78l1.42-1.42|M18.36 5.64l1.42-1.42')
export const MoonIcon = icon('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z')
export const MenuIcon = icon('M3 12h18|M3 6h18|M3 18h18')
