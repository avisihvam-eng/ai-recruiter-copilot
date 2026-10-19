/**
 * pickActive — which section the table of contents should highlight.
 *
 * Kept pure and separate from the hook so the decision can be tested without a
 * DOM: the previous implementation leaned on IntersectionObserver, which is
 * only updated on rendered frames and therefore silently freezes on a throttled
 * or occluded tab — and in any browser when the tab is backgrounded.
 *
 * `entries` is [{ id, top }] in document order, where `top` is the heading's
 * distance from the top of the viewport.
 */

// Where the "reading line" sits, in px below the top of the viewport. Roughly
// the sticky header plus a comfortable margin, so a heading counts as current
// once it is level with the reader's eyes rather than the moment it appears.
export const READING_LINE = 120

export function pickActive(entries, { line = READING_LINE, atBottom = false } = {}) {
  if (!entries || !entries.length) return null

  // A short final section can never reach the reading line, so pin the last one
  // at the bottom of the page. Without this the nav goes dead at the end of the
  // document, which reads as a bug.
  if (atBottom) return entries[entries.length - 1].id

  let current = entries[0].id
  for (const entry of entries) {
    if (entry.top - line <= 0) current = entry.id
  }
  return current
}
