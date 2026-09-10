# TritonLens

TritonLens is a privacy-focused Chrome extension that adds instructor and
historical course context directly to UC San Diego's Triton Student System
(TSS).

The project is currently an early prototype. It displays a hard-coded demo
rating beside instructor names to validate TSS detection, dynamic page
handling, and inline UI injection. It does not yet contain real professor
ratings or historical grade data.

## Current Features

- Runs only on `https://tss.ucsd.edu/*`.
- Detects instructor links in the TSS class-sections table.
- Handles TSS navigation and dynamic rendering with `MutationObserver`.
- Adds one mock rating badge per named instructor link.
- Removes stale badges when an instructor becomes empty.
- Includes automated DOM tests for the badge behavior.

## Privacy

TritonLens currently performs all work locally in the browser. It makes no
additional network requests, collects no analytics, and does not store or
transmit student data, authentication data, cookies, or TSS session details.

The extension must never automate enrollment or perform TSS actions on a
student's behalf.

## Local Development

Requirements:

- Node.js 20 or newer
- npm
- Google Chrome

Install dependencies:

```powershell
npm.cmd install
```

Build the extension:

```powershell
npm.cmd run build
```

Load the generated extension:

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Select **Load unpacked**.
4. Choose the generated `dist` directory.
5. Reload the extension and the TSS page after each new build.

For automatic rebuilds during development:

```powershell
npm.cmd run watch
```

## Quality Checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
```

## Project Structure

```text
src/
  content.ts              TSS dynamic-page observer
  instructor-badges.ts    Instructor detection and badge injection
  content.css             Injected badge styles
  domain/
    types.ts              Normalized course and instructor models
tests/
  instructor-badges.test.ts
build.mjs
manifest.json
```

See [ROADMAP.md](ROADMAP.md) for planned work,
[PROJECT_STATUS.md](PROJECT_STATUS.md) for the current state,
[DATA_SOURCES.md](DATA_SOURCES.md) for data-use decisions, and
[ATTRIBUTION.md](ATTRIBUTION.md) for project provenance.

## Data Disclaimer

The current `★ 4.5 demo` badge is fictional test data. Future historical grade
information must be labeled as historical context, not as a prediction of
future outcomes.

No license has been selected for TritonLens yet.
