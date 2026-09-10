# TritonLens Project Status

Last updated: 2026-09-10

## Current Milestone

Phase 1 — Mock TSS MVP completed. Phase 2 structured TSS data work is now in
progress.

## Completed

- Created a TypeScript-based Chrome Manifest V3 extension.
- Restricted the content script to `https://tss.ucsd.edu/*`.
- Verified the extension in an authenticated TSS session.
- Identified instructor links using stable partial SAP attributes.
- Added dynamic-page support with `MutationObserver`.
- Injected a mock rating badge beside instructor names.
- Prevented duplicate badge injection.
- Handled empty instructor links and stale badges.
- Added four Vitest/jsdom DOM tests.
- Initialized Git and created the first project commit.
- Added foundational project documentation.
- Defined normalized `Course`, `Section`, `Instructor`, `Term`, and
  `CourseOffering` domain types.

## Current Architecture

- `manifest.json`: Chrome extension configuration.
- `build.mjs`: esbuild build process.
- `src/content.ts`: watches TSS for dynamic DOM changes.
- `src/instructor-badges.ts`: finds instructor links and manages badges.
- `src/domain/types.ts`: stable normalized models independent of SAP/OData.
- `src/content.css`: badge styling.
- `tests/instructor-badges.test.ts`: DOM behavior tests.

## Data Status

The displayed `★ 4.5 demo` value is hard-coded mock data.

TritonLens currently:

- makes no external network requests;
- collects no student information;
- stores no TSS session information;
- contains no real RateMyProfessors or grade data.

## Known Limitations

- Instructor detection currently depends on rendered TSS DOM attributes.
- Course and section information is not yet extracted.
- Structured TSS OData responses are not yet observed.
- The badge does not yet open a details card.
- All named instructors receive the same mock rating.

## Next Milestone

Phase 2 — Structured TSS data.

Next tasks:

1. Investigate passive observation of TSS OData responses.
2. Capture only course, section, term, and instructor information.
3. Add parser fixtures that contain no private student data.
4. Add parser and normalization tests.

## Blockers

Real ratings and grade data must not be bundled until licensing,
redistribution, attribution, and source-policy questions are resolved.
