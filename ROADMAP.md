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
- [ ] Observe TSS data already received by the browser without extra requests.
- [ ] Identify the minimum relevant OData response fields.
- [ ] Create sanitized response fixtures containing no private student data.
- [ ] Parse and normalize structured TSS data.
- [ ] Add parser tests for missing and unusual values.
- [ ] Connect normalized records to the correct rendered instructor links.

## Phase 3 — Local Test Dataset

- [ ] Define a small, source-aware local dataset schema.
- [ ] Implement exact professor lookup.
- [ ] Add conservative name normalization and known aliases.
- [ ] Represent missing and uncertain matches explicitly.
- [ ] Add course × professor historical lookup.
- [ ] Test ambiguous and unusual instructor names.

## Phase 4 — Real Data Integration

- [ ] Resolve permission, redistribution, and attribution requirements.
- [ ] Integrate an approved RateMyProfessors data source.
- [ ] Integrate an approved historical UCSD grade source.
- [ ] Record source dates, sample sizes, and provenance.
- [ ] Keep historical metrics distinct from current-term information.

## Phase 5 — UI Polish

- [ ] Replace the demo badge with real missing/loading/data states.
- [ ] Add an accessible hover or click detail card.
- [ ] Display rating and historical-grade metrics with clear labels.
- [ ] Add source links and last-updated dates.
- [ ] Verify narrow-screen and keyboard behavior.

## Phase 6 — Reliability

- [ ] Test multiple departments and course layouts.
- [ ] Test TBA, multiple, empty, and unusual instructor values.
- [ ] Test SPA navigation without a full page reload.
- [ ] Confirm TritonLens failures never interrupt TSS behavior.
- [ ] Add regression tests for discovered TSS edge cases.

## Phase 7 — Release

- [ ] Select a project license.
- [ ] Add extension icons and release screenshots.
- [ ] Prepare a privacy policy and permission justification.
- [ ] Complete attribution and data-source documentation.
- [ ] Test the packaged extension from a clean Chrome profile.
- [ ] Prepare the Chrome Web Store listing.
