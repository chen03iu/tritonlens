# TritonLens Project Status

Last updated: 2026-09-14

## Current Milestone

Phase 1 — Mock TSS MVP completed. Phase 2 structured TSS records are now
linked to rendered instructors and awaiting final validation in the live TSS
page.

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
  scan with duplicate console-output suppression.
- Validated online, in-person, multi-package, and empty-instructor courses in
  an authenticated TSS session.
- Extracted academic year and academic period from semantic TSS filter fields
  and validated them in the live page.
- Added rendered-instructor contexts that associate each DOM link with its
  normalized course, term, package, section, and instructor.
- Added fail-closed matching that rejects stale packages from other courses.
- Added contextual metadata to injected demo badges.
- Added sanitized jsdom fixtures and 21 automated tests.

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
- Parsed course offerings are temporarily logged for development validation;
  they are not yet used to select badge data.
- Rendered-instructor context metadata has not yet been inspected in the live
  TSS page.
- Structured TSS OData observation is deferred unless DOM extraction proves
  insufficient.
- The badge does not yet open a details card.
- All named instructors receive the same mock rating.

## Next Milestone

Phase 2 — Live validation of rendered-instructor context mapping.

Next tasks:

1. Validate badge course, package, section, instructor, and term metadata in
   the live TSS page.
2. Mark Phase 2 complete and remove temporary parser console output.
3. Reconsider passive OData observation only if required fields cannot be
   extracted reliably from the DOM.

## Blockers

Real ratings and grade data must not be bundled until licensing,
redistribution, attribution, and source-policy questions are resolved.
