import { useState, useEffect } from 'react'

const MOBILE_BREAKPOINT = 640 // matches Tailwind `sm:`

/**
 * Returns true when the viewport width is below the `sm` breakpoint (640px).
 * Updates reactively on window resize.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)

    // Sync in case the window resized between render and effect mount
    setIsMobile(mql.matches)

    return () => mql.removeEventListener('change', handler)
  }, [])

  return isMobile
}
