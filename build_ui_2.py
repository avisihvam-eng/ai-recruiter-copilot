BODY = """
<!-- HEADER -->
<header class="header">
  <div class="header-left">
    <span class="logo">Recruiter Copilot</span>
    <span class="badge">ADK v0.4</span>
  </div>
  <div class="header-right">
    <div class="status-dot"></div>
    <span class="status-text">Gemini 2.5 Flash</span>
  </div>
</header>

<div class="container">

  <!-- INPUT -->
  <div class="input-section">
    <h1 class="page-title">Paste a job description</h1>
    <p class="page-sub">Drop a raw JD and the pipeline returns four structured outputs: clean JD, Boolean strings, outreach copy, and a LinkedIn post.</p>

    <div class="textarea-label">
      <span>Raw job description</span>
      <span id="counter">0 chars</span>
    </div>
    <div class="textarea-wrapper">
      <textarea id="jd-input" rows="8" placeholder="Paste the full JD here — hiring manager draft, careers page, email, whatever you have. The pipeline handles cleanup."></textarea>
    </div>
    <div class="error-bar" id="error-bar"></div>
    <div class="action-row">
      <span class="kbd-hint"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run</span>
      <button class="run-btn" id="run-btn" onclick="runPipeline()">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6V2z"/></svg>
        <span id="btn-label">Run pipeline</span>
      </button>
    </div>
  </div>

  <!-- PIPELINE BAR -->
  <div class="pipeline-bar" id="pipeline-bar">
    <div class="pipeline-steps">
      <div class="pipe-step done" id="ps1">
        <div class="pipe-step-dot"></div>
        <span class="pipe-step-label">Input</span>
      </div>
      <div class="pipe-connector"></div>
      <div class="pipe-step" id="ps2">
        <div class="pipe-step-dot"></div>
        <span class="pipe-step-label">Clean JD</span>
      </div>
      <div class="pipe-connector"></div>
      <div class="pipe-step" id="ps3">
        <div class="pipe-step-dot"></div>
        <span class="pipe-step-label">Boolean</span>
      </div>
      <div class="pipe-connector"></div>
      <div class="pipe-step" id="ps4">
        <div class="pipe-step-dot"></div>
        <span class="pipe-step-label">Outreach</span>
      </div>
      <div class="pipe-connector"></div>
      <div class="pipe-step" id="ps5">
        <div class="pipe-step-dot"></div>
        <span class="pipe-step-label">LinkedIn</span>
      </div>
    </div>
  </div>

  <!-- OUTPUT BLOCKS -->
  <div id="output-section">

    <!-- CLEAN JD -->
    <div class="output-block">
      <div class="output-block-header">
        <span class="output-block-title">Clean Job Description</span>
        <button class="copy-btn" onclick="copyBlock('jd-body', this)">Copy</button>
      </div>
      <div class="output-block-body" id="jd-body">
        <div class="skel w80"></div><div class="skel w60"></div><div class="skel w100"></div>
      </div>
    </div>

    <!-- BOOLEAN -->
    <div class="output-block">
      <div class="output-block-header">
        <span class="output-block-title">Boolean Search Strings</span>
        <button class="copy-btn" onclick="copyBlock('bool-body', this)">Copy</button>
      </div>
      <div class="output-block-body" id="bool-body">
        <div class="skel w100"></div><div class="skel w80"></div><div class="skel w60"></div>
      </div>
    </div>

    <!-- OUTREACH -->
    <div class="output-block">
      <div class="output-block-header">
        <span class="output-block-title">Outreach Messages</span>
        <button class="copy-btn" onclick="copyBlock('outreach-body', this)">Copy</button>
      </div>
      <div class="output-block-body" id="outreach-body">
        <div class="skel w100"></div><div class="skel w80"></div><div class="skel w60"></div>
      </div>
    </div>

    <!-- LINKEDIN -->
    <div class="output-block">
      <div class="output-block-header">
        <span class="output-block-title">LinkedIn Post</span>
        <button class="copy-btn" onclick="copyBlock('linkedin-body', this)">Copy</button>
      </div>
      <div class="output-block-body" id="linkedin-body">
        <div class="skel w100"></div><div class="skel w80"></div><div class="skel w60"></div>
      </div>
    </div>

  </div>

  <!-- FOOTER -->
  <footer class="footer">
    <span>Recruiter Copilot &middot; Google ADK</span>
    <div>
      <a href="https://google.github.io/adk-docs/" target="_blank">Docs</a>
      <a href="#">Changelog</a>
    </div>
  </footer>

</div>
"""

with open("backend/static/index.html", "a", encoding="utf-8") as f:
    f.write(BODY)
print("Part 2 (Body) written:", len(BODY))
