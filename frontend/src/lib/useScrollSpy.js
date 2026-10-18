import { useEffect, useState } from 'react'

/**
 * useScrollSpy — tracks which anchored section is currently in view so the
 * sticky workspace nav can highlight it.
 *
 * @param {string[]} ids  element ids to observe, in document order
 * @returns {string|null} the id of the section closest to the top of the viewport
 */
export function useScrollSpy(ids) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!elements.length || typeof IntersectionObserver === 'undefined') return

    const visible = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top)
          else visible.delete(entry.target.id)
        }
        if (!visible.size) return
        // Pick the section whose top edge is nearest above the fold.
        const [nearest] = [...visible.entries()].sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))
        setActiveId(nearest[0])
      },
      // Offset for the sticky header, and bias towards the upper half of the screen.
      { rootMargin: '-88px 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
