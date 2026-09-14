# TritonLens Project Status

Last updated: 2026-09-14

## Current Milestone

Phase 1 — Mock TSS MVP completed. Phase 2 DOM-based structured TSS parsing is
implemented and awaiting validation in the live TSS page.

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
- Added normalized package, enrollment availability, schedule, location, and
  delivery-mode fields.
- Added DOM parsers for TSS course offerings, packages, sections, instructors,
  and current seat counts.
- Added sanitized jsdom fixtures and 15 automated tests.

## Current Architecture

- `manifest.json`: Chrome extension configuration.
- `build.mjs`: esbuild build process.
- `src/content.ts`: watches TSS for dynamic DOM changes.
- `src/instructor-badges.ts`: finds instructor links and manages badges.
- `src/domain/types.ts`: stable normalized models independent of SAP/OData.
- `src/tss/dom-parser.ts`: converts the visible TSS DOM into normalized
  course-offering models.
- `src/content.css`: badge styling.
- `tests/*.test.ts`: badge and TSS DOM parser tests.

## Data Status

The displayed `★ 4.5 demo` value is hard-coded mock data.

TritonLens currently:

- makes no external network requests;
- collects no student information;
- stores no TSS session information;
- contains no real RateMyProfessors or grade data.

## Known Limitations

- Extraction currently depends on rendered TSS DOM attributes.
- The parser is not yet connected to the live content-script scan.
- The academic term is not yet extracted, so `term` remains `null`.
- Structured TSS OData observation is deferred unless DOM extraction proves
  insufficient.
- The badge does not yet open a details card.
- All named instructors receive the same mock rating.

## Next Milestone

Phase 2 — Live validation of structured DOM extraction.

Next tasks:

1. Connect `extractCourseOffering()` to the content-script scan.
2. Validate online, in-person, multi-package, and empty-instructor courses in
   TSS.
3. Extract academic year and term from a stable visible source.
4. Add regression fixtures for any live-page differences.
5. Reconsider passive OData observation only if required fields cannot be
   extracted reliably from the DOM.

## Blockers

Real ratings and grade data must not be bundled until licensing,
redistribution, attribution, and source-policy questions are resolved.
