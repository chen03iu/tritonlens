# TritonLens Project Status

Last updated: 2026-09-14

## Current Milestone

Phase 1, Phase 2, and Phase 3 are completed. The current milestone is Phase 4
— source policy, permission, and real-data integration.

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
- Connected structured course-offering extraction to the live content-script
  scan.
- Validated online, in-person, multi-package, and empty-instructor courses in
  an authenticated TSS session.
- Extracted academic year and academic period from semantic TSS filter fields
  and validated them in the live page.
- Added rendered-instructor contexts that associate each DOM link with its
  normalized course, term, package, section, and instructor.
- Added fail-closed matching that rejects stale packages from other courses.
- Added contextual metadata to injected demo badges.
- Validated live badge context for course, instructor, term, package, and
  section values in TSS.
- Added a source-aware local dataset schema with clearly fictional records.
- Added exact, normalized, and known-alias professor matching.
- Added explicit found, not-found, and ambiguous lookup results.
- Added independent course × professor historical-grade lookup.
- Connected local lookup results to found and unavailable badge states.
- Validated both a known exact match and a safe not-found result in the live
  TSS page.
- Added sanitized fixtures and 33 automated tests.

## Current Architecture

- `manifest.json`: Chrome extension configuration.
- `build.mjs`: esbuild build process.
- `src/content.ts`: watches TSS for dynamic DOM changes.
- `src/instructor-badges.ts`: finds instructor links and manages badges.
- `src/domain/types.ts`: stable normalized models independent of SAP/OData.
- `src/tss/dom-parser.ts`: converts the visible TSS DOM into normalized
  course-offering models.
- `src/tss/instructor-context.ts`: links normalized records to their exact
  rendered instructor elements.
- `src/data/types.ts`: source-aware professor rating and historical grade
  record models.
- `src/data/mock-dataset.ts`: fictional development-only records.
- `src/data/lookup.ts`: conservative professor and course lookup.
- `src/content.css`: badge styling.
- `tests/*.test.ts`: badge and TSS DOM parser tests.

## Data Status

All displayed values ending in `demo` come from fictional local test data.

TritonLens currently:

- makes no external network requests;
- collects no student information;
- stores no TSS session information;
- contains no real RateMyProfessors or grade data.

## Known Limitations

- Extraction currently depends on rendered TSS DOM attributes.
- Structured TSS OData observation is deferred unless DOM extraction proves
  insufficient.
- The badge does not yet open a details card.
- The fictional dataset intentionally contains only two instructor records.
- No real rating or historical-grade source is approved for bundling yet.

## Next Milestone

Phase 4 — Resolve real-data permissions and provenance.

Next tasks:

1. Verify current access, caching, and redistribution rules for candidate
   rating and historical-grade sources.
2. Contact the UCSD Easy-A Radar author about permission or collaboration.
3. Select approved source paths before adding any real records.
4. Preserve source dates, sample sizes, and attribution in generated data.

## Blockers

Real ratings and grade data must not be bundled until licensing,
redistribution, attribution, and source-policy questions are resolved.
