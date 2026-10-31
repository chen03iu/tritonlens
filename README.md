# TritonLens

TritonLens is a privacy-focused Chrome extension that adds instructor and
historical course context directly to UC San Diego's Triton Student System
(TSS).

The project is currently an early prototype. Its default build uses a
normalized direct-source snapshot for conservative professor matching,
course-specific historical-data lookup, and inline UI states. Reviewed names
and the migration baseline come from the earlier Easy-A Radar snapshot. The user reports
noncommercial permission from the Easy-A Radar author; direct upstream RMP and
UCSD redistribution permission remains unresolved, so the UI labels the
snapshot permissions as pending.

## Current Features

- Runs only on `https://tss.ucsd.edu/*`.
- Detects instructor links in the TSS class-sections table.
- Handles TSS navigation and dynamic rendering with `MutationObserver`.
- Displays local professor ratings and course-specific historical grade data
  when a safe match exists.
- Expands `Other RMP profiles` for explicitly reviewed same-person profiles.
  Each keeps its own rating, count, school, source date, and profile link;
  scores and review counts are never combined.
- Shows compact historical grade distributions without inventing unavailable
  student sample sizes.
- Lets you select individual historical terms, initially showing the latest
  available term. GPA and percentages describe that term, not a pooled average.
- Marks all-zero distributions unavailable and explains short percentage totals
  without filling or rescaling the missing share.
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

Build the no-snapshot fallback instead:

```powershell
npm.cmd run build:link-only
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

## Offline Source Refresh

Source collection runs separately in the private data pipeline. This repository
imports only aggregate JSON files; it has no crawler or credential handling.

```powershell
npm.cmd run import:direct -- <rmp.json> <browser-candidate.json> --allow-partial-archive
```

The first import starts from the corrected legacy snapshot so reviewed IDs and
aliases survive numeric updates. Later imports use the current validated direct
snapshot, preserving newer observations and previously collected terms. It
validates source fields and original cell conversions,
generates `src/data/direct-source-dataset.generated.json`, and saves a local
hash/diff/identity-review report under `reports/data-sync/`. The previous generated
file is retained in ignored `.cache/` before same-directory replacement.
An optional `--outdir=<directory>` stages a candidate without replacing the runtime
file. Raw inputs, reports, backups, and collection scripts are excluded from builds.

For an incremental candidate, first copy the current generated direct snapshot
into the candidate directory under the same filename. An empty candidate
directory starts from the legacy baseline and does not inherit later curated
identity decisions. Compare retained aliases, ratings and histories before
replacing the runtime snapshot.

The import reconciles compatible internal duplicates before refreshing metrics.
Retired IDs retain validated redirects; aliases and course history are preserved.
Incompatible reused profile links are withheld rather than used as rating donors.
Source evidence older than an existing observation cannot revoke that link.
Readable cleanup details are saved to `reports/data-sync/direct-source-identity-cleanup.md`,
and per-import JSON audits persist in `reports/data-sync/history/`.

The source file contains 30,146 term records, through Spring 2026. All now have
safe identity links after internal duplicate reconciliation; the former 152-row
grade-identity queue is resolved. The QA archive
has known gaps, including 2018 and 2019; the import flag acknowledges that partial
coverage rather than declaring it complete. RMP metrics were retrieved on
2026-10-29. Profiles that cannot safely refresh retain their own earlier source
dates and appear in the local identity-review report. A readable review queue is
written to `reports/data-sync/direct-source-identity-review.md`. Source permission remains
pending. Building or importing does not publish a GitHub release.

## Offline Runtime Matching Audit

After a data refresh, check the saved roster with the same local providers and
insight service used by the extension's pending-permission snapshot build:

```powershell
npm.cmd run audit:runtime -- reports/instructor-audit.json
```

The deterministic report is written to ignored
`reports/data-sync/runtime-instructor-audit.json`. It checks each distinct
instructor/course pair and separately reports identity, rating and course-history
results. It records the original roster date/hash, input report hash and bundled
dataset hash. A found history does not imply a numeric GPA or usable percentages.

The supplied roster is the July 2026 Easy-A snapshot, not a live TSS capture.
This command makes no network requests and changes no aliases or source metrics;
it does not approve source permissions or validate a link-only/release build.
The [runtime audit review](docs/runtime-lookup-audit-2026-10-31.md) records the
first full run and the three reviewed duplicate-record fixes it exposed.

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
    easy-a-dataset.ts     Validated local snapshot entry point
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

The default detail card labels the Easy-A-derived snapshot as
`Data snapshot — source permissions pending`. Badges ending in `demo` exist
only in automated tests and use fictional fixtures. Historical grade
information is labeled as context, not as a prediction of future outcomes.

No license has been selected for TritonLens yet.

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for release preparation and
the remaining permission and publication checks.
