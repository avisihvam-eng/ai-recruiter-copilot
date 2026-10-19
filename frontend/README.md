# MyHiringKit — frontend

React 19 + Vite front end for MyHiringKit. See the [root README](../README.md) for the full picture.

```bash
npm install
npm run dev     # http://localhost:5173 — expects the API on http://localhost:8000
```

For a production-like run, build into `../public` and let FastAPI serve both the API and the UI from one origin:

```bash
npm run build   # outputs to ../public (committed — this is what Vercel serves)
cd .. && uvicorn backend.main:app --port 8000
```

`npm run build` empties `../public`, so the built asset filenames are rehashed on every build and the committed output must be regenerated and committed together.

## Layout

```
src/
  App.jsx          run orchestration: streaming, regenerate, history
  components/      UI
  lib/api.js       API client, NDJSON stream reader, plain-endpoint fallback
  lib/booleans.js  per-platform Boolean dialects + character budgets
  lib/kit.js       kit → Markdown export, download helpers
  lib/outlook.js   clipboard HTML for pasting into Outlook
  lib/validateJd.js  pre-flight JD checks
  lib/sections.js  section metadata (labels, progress copy, anchors)
  data/sample.js   demo-mode fixtures
```

`npx eslint .` is expected to pass clean.
