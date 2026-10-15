# TritonLens Roadmap

This roadmap is intentionally narrow. New features should not expand the V1
scope until the core TSS integration is reliable.

## Phase 0 — Research and Setup

- [x] Review TritonPlan's TSS integration approach.
- [x] Review UCSD Easy-A Radar's public architecture and data shape.
- [x] Review Sahir Sharma WebReg's TSS research.
- [x] Select TypeScript, Manifest V3, plain DOM APIs, and esbuild.
- [x] Create a local build and testing workflow.
- [x] Initialize the Git repository.
- [ ] Complete source-policy and redistribution research before using real data.

## Phase 1 — Mock TSS MVP

- [x] Load TritonLens as an unpacked Chrome extension.
- [x] Detect real instructor links on TSS.
- [x] Inject a mock rating badge.
- [x] Support dynamically rendered TSS content.
- [x] Prevent duplicate badges.
- [x] Handle empty and reused instructor links.
- [x] Add automated DOM tests.

## Phase 2 — Structured TSS Data

- [x] Define normalized course, section, instructor, and term types.
- [x] Identify stable DOM boundaries for course packages and section rows.
- [x] Create sanitized DOM fixtures containing no private student data.
- [x] Parse courses, packages, seat counts, sections, and instructors.
- [x] Add parser tests for online, in-person, mixed, empty, and invalid values.
- [x] Connect normalized records to the correct rendered instructor links.
- [x] Validate the parser against multiple live TSS course layouts.
- [x] Extract academic year and term.
- [x] Confirm passive OData observation is unnecessary for current V1 fields.

## Phase 3 — Local Test Dataset

- [x] Define a small, source-aware local dataset schema.
- [x] Implement exact professor lookup.
- [x] Add conservative name normalization and known aliases.
- [x] Represent missing and uncertain matches explicitly.
- [x] Add course × professor historical lookup.
- [x] Test ambiguous and unusual instructor names.

## Phase 4 — Real Data Integration

- [ ] Resolve permission, redistribution, and attribution requirements.
- [x] Add a fail-closed validation gate for provenance and data integrity.
- [x] Add replaceable provider contracts and a link-only release provider.
- [x] Separate release and development build dependency graphs.
- [x] Integrate the author-approved Easy-A Radar snapshot for local
  noncommercial development.
- [x] Preserve aliases, offering counts, grade distributions, and source dates.
- [ ] Integrate an approved RateMyProfessors data source.
- [ ] Integrate an approved historical UCSD grade source.
- [ ] Record source dates, sample sizes, and provenance.
- [ ] Keep historical metrics distinct from current-term information.

## Phase 5 — UI Polish

- [x] Replace the live demo badge with development-data and missing states.
- [x] Add an accessible click detail card.
- [x] Display demo rating and historical-grade metrics with clear labels.
- [x] Add source labels and last-updated dates.
- [x] Add safe source and professor-profile links.
- [x] Add neutral link-only badge and detail-card states for release builds.
- [x] Improve detail-card behavior at narrow viewport widths.
- [ ] Verify narrow-screen and keyboard behavior.

## Phase 6 — Reliability

- [ ] Test multiple departments and course layouts.
- [ ] Test TBA, multiple, empty, and unusual instructor values.
- [ ] Test SPA navigation without a full page reload.
- [x] Add automated reused-link and replaced-table stale-card regressions.
- [x] Verify scan failures are contained and later scans recover (automated).
- [x] Prevent extension-owned UI changes from causing observer feedback loops.
- [x] Add regression tests for discovered TSS edge cases.
- [x] Verify release/development/release builds do not leak data modes.

## Phase 7 — Release

- [ ] Select a project license.
- [ ] Add extension icons and release screenshots.
- [ ] Prepare a privacy policy and permission justification.
- [ ] Complete attribution and data-source documentation.
- [x] Default release packaging to link-only with no bundled metric snapshot.
- [ ] Test the packaged extension from a clean Chrome profile.
- [ ] Prepare the Chrome Web Store listing.
