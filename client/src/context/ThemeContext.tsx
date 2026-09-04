import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'sb-theme'

interface ThemeContextType {
  /** The user's explicit preference: 'light', 'dark', or 'system' */
  theme: Theme
  /** The actual applied theme after resolving 'system' → OS preference */
  resolvedTheme: ResolvedTheme
  /** Toggle between light and dark (sets explicit preference, not 'system') */
  toggleTheme: () => void
  /** Set a specific theme explicitly */
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    // localStorage blocked
  }
  return 'system'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme()
  return theme
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getSavedTheme())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getSavedTheme())
  )

  // Apply theme to DOM and keep resolvedTheme in sync
  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    // Enable smooth transitions after initial mount (prevents flash)
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-ready')
    }, 50)
    return () => clearTimeout(timer)
  }, [theme])

  // Listen for OS preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolved = getSystemTheme()
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // localStorage blocked
    }
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    // Toggle always sets an explicit preference (light or dark), not 'system'
    const next: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }, [resolvedTheme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
