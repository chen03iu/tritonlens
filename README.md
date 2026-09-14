# TritonLens

TritonLens is a privacy-focused Chrome extension that adds instructor and
historical course context directly to UC San Diego's Triton Student System
(TSS).

The project is currently an early prototype. It uses a tiny fictional local
dataset to validate TSS context extraction, conservative professor matching,
course-specific historical-data lookup, and inline UI states. It does not yet
contain real professor ratings or historical grade data.

## Current Features

- Runs only on `https://tss.ucsd.edu/*`.
- Detects instructor links in the TSS class-sections table.
- Handles TSS navigation and dynamic rendering with `MutationObserver`.
- Displays fictional per-professor demo ratings when a local match exists.
- Displays an explicit unavailable state instead of guessing when no safe
  match exists.
- Removes stale badges when an instructor becomes empty.
- Parses visible course, package, section, schedule, instructor, and seat data
  into normalized TypeScript models.
- Separates professor-level rating records from course × professor historical
  grade records.
- Includes automated tests for DOM behavior, parsing, matching, and lookup.

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
  data/
    types.ts              Source-aware local dataset models
    mock-dataset.ts       Fictional development-only records
    lookup.ts             Conservative professor and course lookup
  tss/
    dom-parser.ts         Visible TSS course-offering extraction
    instructor-context.ts Rendered-link to normalized-record mapping
tests/
  *.test.ts               Badge and parser behavior
build.mjs
manifest.json
```

See [ROADMAP.md](ROADMAP.md) for planned work,
[PROJECT_STATUS.md](PROJECT_STATUS.md) for the current state,
[DATA_SOURCES.md](DATA_SOURCES.md) for data-use decisions, and
[ATTRIBUTION.md](ATTRIBUTION.md) for project provenance.

## Data Disclaimer

Every badge ending in `demo` uses fictional test data. The demo values are not
RateMyProfessors or UCSD grade records. Future historical grade information
must be labeled as historical context, not as a prediction of future outcomes.

No license has been selected for TritonLens yet.
