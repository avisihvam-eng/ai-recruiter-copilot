import { useEffect, useState } from 'react'

import { pickActive } from './pickActive'

/**
 * useScrollSpy — tracks which anchored section is current so the sticky
 * workspace nav can highlight it.
 *
 * Measured from the scroll event rather than observed with IntersectionObserver.
 * IO only fires on rendered frames: on a backgrounded tab (or any environment
 * without a compositor driving frames) it stops delivering entirely and the nav
 * freezes on whatever was active last. Reading five rectangles is cheap, scroll
 * events are already frame-throttled by the browser, and the result is
 * deterministic and easy to reason about.
 *
 * @param {string[]} ids  element ids to track, in document order
 * @returns {string|null} the id of the section currently being read
 */
export function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(null)

  // Depend on the contents, not the array identity: callers pass a fresh array
  // whenever the kit is rebuilt, and re-subscribing on every render would be
  // pure waste.
  const key = ids.join('|')

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (!list.length) return undefined

    const measure = () => {
      const entries = []
      for (const id of list) {
        const el = document.getElementById(id)
        if (el) entries.push({ id, top: el.getBoundingClientRect().top })
      }
      if (!entries.length) return

      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4

      const next = pickActive(entries, { atBottom })
      // Bail out when nothing changed: this runs on every scroll frame, and
      // re-rendering the whole kit for an unchanged id would be wasteful.
      setActiveId((prev) => (prev === next ? prev : next))
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [key])

  return activeId
}
