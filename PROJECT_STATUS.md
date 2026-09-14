# TritonLens Project Status

Last updated: 2026-09-14

## Current Milestone

Phase 1, Phase 2, and Phase 3 are completed. Phase 4 real-data integration is
waiting on upstream permissions, so Phase 5 UI work is proceeding with
fictional demo data only.

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
- Recorded direct noncommercial permission from the Easy-A Radar author as
  reported by the user.
- Reviewed current RMP, UCSD website, A.S. grade archive, CAPE, and Campus
  Grades access constraints.
- Added ready-to-send permission requests for RMP and UCSD A.S.
- Added explicit permission status, terms, and attribution metadata to data
  source records.
- Added a fail-closed dataset validation gate for source references,
  production permissions, metric ranges, dates, and duplicate IDs.
- Added an accessible click-triggered instructor detail card.
- Displayed professor-level ratings separately from course × professor
  historical-grade metrics.
- Added explicit demo, missing-data, provenance, update-date, and
  historical-not-prediction labels.
- Added outside-click, repeated-click, close-button, and Escape dismissal,
  including keyboard focus management.
- Validated the detail card in live TSS for both a complete fictional-data
  match and a safe unavailable-data result.
- Confirmed that long instructor names remain complete inside the card and
  that the card stays within the visible browser viewport.
- Expanded the automated suite to 46 tests.

## Current Architecture

- `manifest.json`: Chrome extension configuration.
- `build.mjs`: esbuild build process.
- `src/content.ts`: watches TSS for dynamic DOM changes.
- `src/instructor-badges.ts`: finds instructor links and manages badges.
- `src/professor-detail-card.ts`: renders and positions the accessible
  instructor detail dialog and manages its lifecycle.
- `src/domain/types.ts`: stable normalized models independent of SAP/OData.
- `src/tss/dom-parser.ts`: converts the visible TSS DOM into normalized
  course-offering models.
- `src/tss/instructor-context.ts`: links normalized records to their exact
  rendered instructor elements.
- `src/data/types.ts`: source-aware professor rating and historical grade
  record models.
- `src/data/mock-dataset.ts`: fictional development-only records.
- `src/data/lookup.ts`: conservative professor and course lookup.
- `src/data/validation.ts`: validates provenance and data integrity before a
  dataset can be treated as production-ready.
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
- The detail card is intentionally a non-modal popover and can temporarily
  cover nearby TSS rows until dismissed.
- The fictional dataset intentionally contains only two instructor records.
- No real rating or historical-grade source is approved for bundling yet.
- Easy-A Radar author permission does not by itself resolve the restrictions
  imposed by its underlying RMP and UCSD sources.

## Next Milestone

Phase 4 — Obtain direct upstream permission for redistributed data.

Next tasks:

1. Send the prepared permission request to RateMyProfessors.
2. Send the prepared aggregate-data request to UCSD Associated Students.
3. Preserve the Easy-A Radar permission record outside the public repository.
4. Select an approved source path only after receiving upstream responses.
5. Run any future imported snapshot through `validateLocalDataset()` before
   connecting it to extension lookup.

## Blockers

Real ratings and grade data must not be bundled until licensing,
redistribution, attribution, and source-policy questions are resolved.
