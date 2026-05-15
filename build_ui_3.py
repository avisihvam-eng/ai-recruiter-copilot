JS = """
<script>
const API = '/api/generate';

// ── Character counter ──
document.getElementById('jd-input').addEventListener('input', function() {
  document.getElementById('counter').textContent = this.value.length + ' chars';
});

// ── Ctrl+Enter ──
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'Enter') runPipeline();
});

// ── Copy ──
function copyBlock(id, btn) {
  var el = document.getElementById(id);
  navigator.clipboard.writeText(el.innerText).then(function() {
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    setTimeout(function() { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1400);
  });
}

// ── Skeleton HTML ──
function skel() {
  return '<div class="skel w100"></div><div class="skel w80"></div><div class="skel w60"></div><div class="skel w100" style="margin-top:16px"></div><div class="skel w80"></div>';
}

// ── Light up pipeline step ──
function lightStep(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('done');
}

// ── FORMAT: Clean JD (rich HTML) ──
function renderCleanJD(jd) {
  if (!jd || typeof jd !== 'object') return '<p style="color:var(--text-secondary)">' + String(jd || '') + '</p>';
  var h = '';

  // Title + meta
  if (jd.title) h += '<div class="jd-title">' + esc(jd.title) + '</div>';
  h += '<div class="jd-meta">';
  if (jd.location) h += '<span class="jd-meta-item"><strong>Location:</strong> ' + esc(jd.location) + '</span>';
  if (jd.experience) h += '<span class="jd-meta-item"><strong>Experience:</strong> ' + esc(jd.experience) + '</span>';
  h += '</div>';

  // Summary
  if (jd.summary) h += '<div class="jd-summary">' + esc(jd.summary) + '</div>';

  // Responsibilities
  var resp = jd.responsibilities || jd.duties || [];
  if (resp.length) {
    h += '<div class="jd-section">';
    h += '<div class="jd-section-title">Job Responsibilities</div>';
    h += '<ul class="jd-list">';
    resp.forEach(function(r) { h += '<li>' + esc(r) + '</li>'; });
    h += '</ul></div>';
  }

  // Required Skills
  if (jd.required_skills && jd.required_skills.length) {
    h += '<div class="jd-section">';
    h += '<div class="jd-section-title">Required Skills</div>';
    h += '<div class="skill-tags">';
    jd.required_skills.forEach(function(s) { h += '<span class="skill-tag">' + esc(s) + '</span>'; });
    h += '</div></div>';
  }

  // Preferred Skills
  if (jd.preferred_skills && jd.preferred_skills.length) {
    h += '<div class="jd-section">';
    h += '<div class="jd-section-title">Preferred Skills</div>';
    h += '<div class="skill-tags">';
    jd.preferred_skills.forEach(function(s) { h += '<span class="skill-tag preferred">' + esc(s) + '</span>'; });
    h += '</div></div>';
  }

  // Certs
  if (jd.certifications && jd.certifications.length) {
    h += '<div class="jd-section">';
    h += '<div class="jd-section-title">Certifications</div>';
    h += '<div class="skill-tags">';
    jd.certifications.forEach(function(s) { h += '<span class="skill-tag">' + esc(s) + '</span>'; });
    h += '</div></div>';
  }

  // Tools
  if (jd.tools && jd.tools.length) {
    h += '<div class="jd-section">';
    h += '<div class="jd-section-title">Tools &amp; Technologies</div>';
    h += '<div class="skill-tags">';
    jd.tools.forEach(function(s) { h += '<span class="skill-tag">' + esc(s) + '</span>'; });
    h += '</div></div>';
  }

  return h;
}

// ── FORMAT: Booleans (rich HTML) ──
function renderBooleans(b) {
  if (!b) return '';
  var h = '';
  if (b.strict) {
    h += '<div class="bool-group"><div class="bool-label">Strict</div>';
    h += '<div class="bool-string">' + esc(b.strict) + '</div></div>';
  }
  if (b.balanced) {
    h += '<div class="bool-group"><div class="bool-label">Balanced</div>';
    h += '<div class="bool-string">' + esc(b.balanced) + '</div></div>';
  }
  if (b.broad) {
    h += '<div class="bool-group"><div class="bool-label">Broad</div>';
    h += '<div class="bool-string">' + esc(b.broad) + '</div></div>';
  }
  return h;
}

// ── FORMAT: Outreach (rich HTML) ──
function renderOutreach(o) {
  if (!o) return '';
  var h = '';
  if (o.short) {
    h += '<div class="outreach-section">';
    h += '<div class="outreach-label">Short Outreach</div>';
    h += '<div class="outreach-text">' + esc(o.short) + '</div>';
    h += '</div>';
  }
  if (o.detailed) {
    h += '<div class="outreach-section">';
    h += '<div class="outreach-label">Detailed Outreach</div>';
    h += '<div class="outreach-text">' + esc(o.detailed) + '</div>';
    h += '</div>';
  }
  return h;
}

// ── FORMAT: LinkedIn (rich HTML) ──
function renderLinkedIn(text) {
  if (!text) return '';
  return '<div class="linkedin-text">' + esc(text) + '</div>';
}

// ── Escape HTML ──
function esc(s) {
  if (!s) return '';
  var d = document.createElement('div');
  d.textContent = String(s);
  return d.innerHTML;
}

// ── MAIN: Run pipeline ──
async function runPipeline() {
  var jd = document.getElementById('jd-input').value.trim();
  var errBar = document.getElementById('error-bar');
  errBar.style.display = 'none';

  if (jd.length < 50) {
    errBar.textContent = 'Paste a real job description (at least 50 characters).';
    errBar.style.display = 'block';
    return;
  }

  // Button state
  var btn = document.getElementById('run-btn');
  var label = document.getElementById('btn-label');
  btn.disabled = true;
  label.textContent = 'Running...';

  // Show pipeline bar
  var pBar = document.getElementById('pipeline-bar');
  pBar.classList.add('visible');
  ['ps2','ps3','ps4','ps5'].forEach(function(id) {
    document.getElementById(id).classList.remove('done');
  });

  // Show output with skeletons
  var outSection = document.getElementById('output-section');
  outSection.classList.add('visible');
  ['jd-body','bool-body','outreach-body','linkedin-body'].forEach(function(id) {
    document.getElementById(id).innerHTML = skel();
  });

  // Smooth scroll to pipeline bar
  pBar.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animate steps during API call
  var timers = [
    setTimeout(function() { lightStep('ps2'); }, 500),
    setTimeout(function() { lightStep('ps3'); }, 1200),
    setTimeout(function() { lightStep('ps4'); }, 2000),
    setTimeout(function() { lightStep('ps5'); }, 3000),
  ];

  try {
    var resp = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_jd: jd })
    });

    if (!resp.ok) {
      var err = await resp.json();
      throw new Error(err.detail || 'Server error ' + resp.status);
    }

    var data = await resp.json();

    // Complete all steps
    timers.forEach(clearTimeout);
    ['ps2','ps3','ps4','ps5'].forEach(lightStep);

    // Render rich HTML output
    document.getElementById('jd-body').innerHTML = renderCleanJD(data.clean_jd);
    document.getElementById('bool-body').innerHTML = renderBooleans(data.booleans);
    document.getElementById('outreach-body').innerHTML = renderOutreach(data.outreach);
    document.getElementById('linkedin-body').innerHTML = renderLinkedIn(data.linkedin_post);

    // Scroll to first output block
    document.querySelector('.output-block').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch(e) {
    timers.forEach(clearTimeout);
    errBar.textContent = 'Error: ' + e.message;
    errBar.style.display = 'block';
    ['jd-body','bool-body','outreach-body','linkedin-body'].forEach(function(id) {
      document.getElementById(id).innerHTML = '<p style="color:#991b1b">Pipeline error. See the error above.</p>';
    });
  }

  // Reset button
  btn.disabled = false;
  label.textContent = 'Run pipeline';
}
</script>
</body>
</html>
"""

with open("backend/static/index.html", "a", encoding="utf-8") as f:
    f.write(JS)

# Verify total
with open("backend/static/index.html", "r", encoding="utf-8") as f:
    total = len(f.read())
print("Part 3 (JS) written:", len(JS))
print("Total file size:", total)
