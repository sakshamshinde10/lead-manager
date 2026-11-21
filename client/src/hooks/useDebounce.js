import { useEffect, useState } from 'react'

// Returns `value`, but only after it has stopped changing for `delay`
// milliseconds. Used on the search box so we ask the server once the user
// pauses typing instead of on every single keystroke.
export function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
