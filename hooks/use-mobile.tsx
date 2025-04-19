import * as React from "react"

const MOBILE_BREAKPOINT = 768
const DEBOUNCE_DELAY = 100

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    let timeoutId: NodeJS.Timeout
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }, DEBOUNCE_DELAY)
    }
    
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    mql.addEventListener("change", onChange)
    return () => {
      mql.removeEventListener("change", onChange)
      clearTimeout(timeoutId)
    }
  }, [])

  return isMobile
}
