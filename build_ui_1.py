import textwrap

CSS = textwrap.dedent("""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recruiter Copilot</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #ffffff;
  --bg-secondary: #fafafa;
  --bg-hover: #f5f5f5;
  --text-primary: #111111;
  --text-secondary: #555555;
  --text-tertiary: #888888;
  --border: #e5e5e5;
  --border-strong: #d0d0d0;
  --accent: #111111;
  --accent-light: #f0f0f0;
  --green: #22863a;
  --blue: #0969da;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  --radius: 8px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  background: var(--bg);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── HEADER ── */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.badge {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  padding: 3px 8px;
  background: var(--accent-light);
  color: var(--text-secondary);
  border-radius: 4px;
  letter-spacing: 0.02em;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.status-dot {
  width: 7px;
  height: 7px;
  background: var(--green);
  border-radius: 50%;
  animation: pulse 2.5s infinite;
}
@keyframes pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.status-text {
  font-size: 12px;
  color: var(--text-tertiary);
  font-weight: 500;
}

/* ── MAIN LAYOUT ── */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px 80px;
}

/* ── INPUT SECTION ── */
.input-section {
  max-width: 720px;
  margin: 0 auto 48px;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin-bottom: 8px;
  color: var(--text-primary);
}
.page-sub {
  font-size: 15px;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-bottom: 32px;
  font-weight: 400;
}

.textarea-wrapper {
  position: relative;
  margin-bottom: 16px;
}
.textarea-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.textarea-label span {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
textarea {
  width: 100%;
  min-height: 180px;
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
textarea::placeholder {
  color: var(--text-tertiary);
  font-style: normal;
}
textarea:focus {
  border-color: var(--text-primary);
  box-shadow: 0 0 0 3px rgba(17,17,17,0.06);
}

.action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kbd-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}
kbd {
  display: inline-block;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-secondary);
}
.run-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--text-primary);
  color: white;
  border: none;
  padding: 10px 24px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
}
.run-btn:hover { background: #333; }
.run-btn:active { transform: scale(0.98); }
.run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.run-btn svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.error-bar {
  display: none;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 12px 16px;
  font-size: 13px;
  color: #991b1b;
  border-radius: var(--radius);
  margin-top: 12px;
}

/* ── PIPELINE STATUS ── */
.pipeline-bar {
  display: none;
  max-width: 720px;
  margin: 0 auto 40px;
  padding: 20px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.pipeline-bar.visible { display: block; }
.pipeline-steps {
  display: flex;
  align-items: center;
  gap: 0;
}
.pipe-step {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.3;
  transition: opacity 0.4s ease;
}
.pipe-step.done { opacity: 1; }
.pipe-step-dot {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s, border-color 0.3s;
  flex-shrink: 0;
}
.pipe-step.done .pipe-step-dot {
  background: var(--text-primary);
  border-color: var(--text-primary);
}
.pipe-step.done .pipe-step-dot::after {
  content: "";
  display: block;
  width: 5px;
  height: 8px;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  transform: rotate(40deg) translate(-1px, -1px);
}
.pipe-step-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}
.pipe-connector {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin: 0 6px;
  min-width: 20px;
}
.pipe-step.done + .pipe-connector { background: var(--text-primary); }

/* ── OUTPUT SECTION ── */
#output-section {
  display: none;
  max-width: 720px;
  margin: 0 auto;
}
#output-section.visible { display: block; }

.output-block {
  margin-bottom: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg);
}
.output-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}
.output-block-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.output-block-title .icon {
  width: 16px;
  height: 16px;
  opacity: 0.5;
}
.copy-btn {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 500;
  padding: 4px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.15s;
}
.copy-btn:hover { color: var(--text-primary); border-color: var(--border-strong); }
.copy-btn.copied { color: var(--green); border-color: var(--green); }

.output-block-body {
  padding: 24px;
}

/* ── JD OUTPUT STYLING ── */
.jd-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}
.jd-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.jd-meta-item {
  font-size: 13px;
  color: var(--text-secondary);
}
.jd-meta-item strong {
  font-weight: 600;
  color: var(--text-primary);
}
.jd-summary {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.jd-section {
  margin-bottom: 24px;
}
.jd-section:last-child { margin-bottom: 0; }
.jd-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.jd-section-title::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}
.jd-list {
  list-style: none;
  padding: 0;
}
.jd-list li {
  position: relative;
  padding-left: 16px;
  padding-bottom: 8px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
}
.jd-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 9px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-tertiary);
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.skill-tag {
  display: inline-block;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-primary);
}
.skill-tag.preferred {
  background: transparent;
  border-style: dashed;
  color: var(--text-secondary);
}

/* ── BOOLEAN STYLING ── */
.bool-group {
  margin-bottom: 20px;
}
.bool-group:last-child { margin-bottom: 0; }
.bool-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}
.bool-string {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 14px 16px;
  border-radius: 6px;
  border: 1px solid var(--border);
  word-break: break-word;
}

/* ── OUTREACH STYLING ── */
.outreach-section {
  margin-bottom: 28px;
}
.outreach-section:last-child { margin-bottom: 0; }
.outreach-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.outreach-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

/* ── LINKEDIN STYLING ── */
.linkedin-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

/* ── SKELETON ── */
.skel {
  height: 12px;
  background: var(--bg-secondary);
  border-radius: 4px;
  margin-bottom: 10px;
  animation: skPulse 1.2s ease-in-out infinite alternate;
}
@keyframes skPulse { from { opacity: 0.4; } to { opacity: 1; } }
.skel.w100 { width: 100%; }
.skel.w80 { width: 80%; }
.skel.w60 { width: 60%; }
.skel.w40 { width: 40%; }

/* ── FOOTER ── */
.footer {
  max-width: 720px;
  margin: 60px auto 0;
  padding: 20px 0;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
}
.footer a {
  color: var(--text-tertiary);
  text-decoration: none;
  margin-left: 20px;
}
.footer a:hover { color: var(--text-primary); }
</style>
</head>
<body>
""")

with open("backend/static/index.html", "w", encoding="utf-8") as f:
    f.write(CSS)
print("Part 1 (CSS) written:", len(CSS))
