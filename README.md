# TritonLens

TritonLens is a privacy-focused Chrome extension that adds instructor and
historical course context directly to UC San Diego's Triton Student System
(TSS).

The project is currently an early prototype. Local development builds use a
normalized Easy-A Radar snapshot to validate TSS context extraction,
conservative professor matching, course-specific historical-data lookup, and
inline UI states. The snapshot is approved by the Easy-A Radar author for
noncommercial use but is deliberately marked development-only while upstream
redistribution questions remain under review.

## Current Features

- Runs only on `https://tss.ucsd.edu/*`.
- Detects instructor links in the TSS class-sections table.
- Handles TSS navigation and dynamic rendering with `MutationObserver`.
- Displays local professor ratings and course-specific historical grade data
  when a safe match exists.
- Shows compact historical grade distributions without inventing unavailable
  student sample sizes.
- Displays an explicit unavailable state instead of guessing when no safe
  match exists.
- Removes stale badges when an instructor becomes empty.
- Parses visible course, package, section, schedule, instructor, and seat data
  into normalized TypeScript models.
- Separates professor-level rating records from course × professor historical
  grade records.
- Includes automated tests for DOM behavior, parsing, matching, and lookup.
- Includes an offline batch instructor audit and conservative source-linked
  duplicate consolidation. See [INSTRUCTOR_MATCH_REVIEW.md](INSTRUCTOR_MATCH_REVIEW.md)
  for coverage, unresolved cases, and review decisions.

## Privacy

TritonLens currently performs all work locally in the browser. It makes no
additional network requests, collects no analytics, and does not store or
transmit student data, authentication data, cookies, or TSS session details.

User-clicked source links open external websites under their own privacy
practices. See [PRIVACY.md](PRIVACY.md) for the current privacy documentation.

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
    easy-a-dataset.ts     Validated development snapshot entry point
    easy-a-dataset.generated.json  Generated local snapshot
    lookup.ts             Conservative professor and course lookup
    validation.ts         Provenance and integrity validation
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

Badges ending in `dev` use the Easy-A Radar development snapshot and are not
approved release data. Badges ending in `demo` exist only in automated tests
and use fictional fixtures. Historical grade information is labeled as
historical context, not as a prediction of future outcomes.

No license has been selected for TritonLens yet.

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for release preparation and
the remaining publication gates. The current development bundle is not ready
for public distribution.
