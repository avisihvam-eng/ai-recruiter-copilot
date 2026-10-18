/**
 * SectionCard — one section of the generated kit.
 *
 * Every asset renders through this shell so the number, title, actions and
 * rhythm stay identical across the document. It is deliberately NOT a floating
 * card: sections are separated by hairlines inside a single document panel, so
 * five results read as one artifact rather than five competing boxes.
 */
export default function SectionCard({
  id,
  num,
  title,
  subtitle,
  actions,
  className = '',
  children,
}) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className={`doc-section scroll-margin ${className}`.trim()}
    >
      <header className="doc-head">
        <div className="doc-head-main">
          {num && (
            <span className="doc-num" aria-hidden="true">
              {num}
            </span>
          )}
          <div>
            <h2 id={`${id}-title`} className="doc-title">
              {title}
            </h2>
            {subtitle && <p className="doc-sub">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="doc-actions">{actions}</div>}
      </header>

      <div className="doc-body">{children}</div>
    </section>
  )
}
