/**
 * Icons — a small, inline SVG set.
 *
 * Real vector icons rather than emoji or unicode glyphs: they inherit
 * `currentColor`, align to the text baseline, and can never render as a tofu
 * box on a machine with an unexpected font stack.
 */

const base = {
  width: 13,
  height: 13,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

export function IconCopy(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
      <path d="M10.5 3.6v-.4a1.7 1.7 0 0 0-1.7-1.7H3.2A1.7 1.7 0 0 0 1.5 3.2v5.6a1.7 1.7 0 0 0 1.7 1.7h.4" />
    </svg>
  )
}

export function IconCheck(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8.4 6.2 11.6 13 4.8" />
    </svg>
  )
}


/* Section icons. Used by the nav rail and the empty-state list so the five
   assets are identifiable at a glance rather than by reading. */

export function IconDoc(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.2 1.8H4.4a1 1 0 0 0-1 1v10.4a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1V5.2L9.2 1.8Z" />
      <path d="M9.1 1.9v3.4h3.4" />
    </svg>
  )
}

export function IconSearch(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="7.1" cy="7.1" r="4.3" />
      <path d="m10.3 10.3 3.5 3.5" />
    </svg>
  )
}

export function IconChat(props) {
  return (
    <svg {...base} {...props}>
      <path d="M13.6 7.9c0 2.6-2.5 4.7-5.5 4.7-.6 0-1.2-.1-1.8-.2l-3.6 1.3 1-2.8C2.8 9.9 2.1 9 2.1 7.9c0-2.6 2.5-4.7 5.5-4.7s6 2.1 6 4.7Z" />
    </svg>
  )
}

export function IconShare(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12.4" cy="3.7" r="1.9" />
      <circle cx="3.6" cy="8" r="1.9" />
      <circle cx="12.4" cy="12.3" r="1.9" />
      <path d="m5.3 7.1 5.4-2.5M5.3 8.9l5.4 2.5" />
    </svg>
  )
}

export function IconChecklist(props) {
  return (
    <svg {...base} {...props}>
      <rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2.6" />
      <path d="m5.3 8.2 2 2 3.5-4.3" />
    </svg>
  )
}

export function IconRefresh(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.9 8a5.1 5.1 0 0 1 8.7-3.7l1.7 1.5" />
      <path d="M13.1 2.6v3.3H9.8" />
      <path d="M13.1 8a5.1 5.1 0 0 1-8.7 3.7l-1.7-1.5" />
      <path d="M2.9 13.4v-3.3h3.3" />
    </svg>
  )
}

export function IconExternalLink(props) {
  return (
    <svg {...base} {...props}>
      <path d="M9.4 2.6h4v4" />
      <path d="M13.4 2.6 7.6 8.4" />
      <path d="M12.2 9.4v3.4a1.2 1.2 0 0 1-1.2 1.2H3.8a1.2 1.2 0 0 1-1.2-1.2V5.6a1.2 1.2 0 0 1 1.2-1.2h3.4" />
    </svg>
  )
}

export function IconPencil(props) {
  return (
    <svg {...base} {...props}>
      <path d="M11.1 2.6 13.4 4.9 5.6 12.7 2.6 13.4l.7-3z" />
      <path d="m9.6 4.1 2.3 2.3" />
    </svg>
  )
}
