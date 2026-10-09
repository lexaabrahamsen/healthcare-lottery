import { useCallback, useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

const root = document.documentElement
const listeners = new Set<() => void>()

const read = (): Theme => (root.classList.contains('dark') ? 'dark' : 'light')
const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** The current theme and a toggle. The choice is saved in localStorage; the first visit follows the system. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read)
  const toggle = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark'
    root.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Private mode or blocked storage: the theme still changes for this visit.
    }
    listeners.forEach((cb) => cb())
  }, [])
  return { theme, toggle }
}
