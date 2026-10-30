# TritonLens Project Status

Last updated: 2026-10-30

## Current Milestone

### Identity-cleanup preview (2026-10-30)

Local branch `fix/direct-identity-duplicates` reconciles 31 internal duplicate
records with validated old-ID redirects. The runtime snapshot has 5,697 retained
identities, 3,321 direct-source ratings and 67 older sourced observations. All
30,146 downloaded UCSD term rows now attach safely to 11,128 course/instructor
histories; none remain ambiguous. Archive coverage itself is still partial.

Thirty-nine incompatible shared legacy profile links were withheld pending
correct identity evidence. They are not used as rating donors. Possible initials,
preferred middle names, prefixes, spelling/token-order variants, and reviewed
aliases are protected from being treated as definitive mismatches. The existing
Natalye Harpin/Pass holdout remains unchanged. Source-name ambiguity still holds
147 roster profiles: 31 shared-profile cases, 100 competing source-name cases,
and 16 conflicting-profile cases. These are profiles, not 147 distinct people.

Jim/James Kadonaga, Nadia/Nadezhda Polikarpova, and Alexander Niema/Niema Moshiri
have profile-scoped primary-source evidence in `scripts/reconcile-direct-identities.ts`;
this is not a generic nickname matching rule. [Niema's own introduction](https://niema.net/)
explicitly connects both names. His seven course histories retain all 36 terms;
same-course records combine only for explicitly verified identities with compatible
source terms. Conflicting same-term values and aggregate-only duplicates are not pooled.
Other unresolved variants do not gain new aliases.

One fresh read-only review found stale identity evidence revoking newer links
and an initials-only exact-name bypass. Both findings were reproduced with
failing tests and fixed. Source freshness gates link revocation, initials need
full-name corroboration, and newer same-profile observations may settle tied
legacy metric rounding without selecting the more favorable value.

Verification: 330/330 tests across 34 files pass. Real repeat import is byte
identical with no further remaps or withheld links. No course keys or earlier
terms were lost. Original legacy generated data is unchanged. Reports and
per-import audit history remain ignored under `reports/data-sync/`; the readable
cleanup report is `direct-source-identity-cleanup.md`.

This cleanup is local to the preview branch; it has not been merged or pushed.
The existing preview `dist` path is retained for extension reload testing.

### Initial direct-source integration (historical counts)

Direct-source integration is implemented on the local `feat/direct-source-data`
branch. The default entry now reads a separately generated, validated direct
snapshot; the legacy Easy-A baseline and all reviewed ID/alias evidence remain
intact. No collection scripts or authentication code were added to this repo.

The 2026-10-29 import refreshed 2,261 existing profile observations and added
1,583 previously absent profiles (including unrated profiles). There are 3,273
direct-source rated identities; 180 earlier observations retain their own source
dates. Another 195 source profiles have ambiguous existing identity links (78),
competing source names (100), or conflicting profile IDs (17) and were held in
the ignored review report.
No conflicting profile is substituted automatically.

Of 30,146 UCSD source rows, 29,994 attach safely to existing corrected identities,
producing 11,084 direct course/instructor histories. The 152 ambiguous term rows
are held; 48 older aggregate histories retain their original source/date. The
result has 11,132 histories total. Direct histories carry actual terms, with the
latest selected initially and older terms available in the card. No unweighted
term percentage/GPA aggregate is invented. The prior 11,159 aggregate entries
remain in the legacy baseline. Student sample sizes remain unavailable.

QA coverage is explicitly partial: 2018/2019, Winter 2015, Fall 2017, Winter 2022,
and summer terms are absent. Latest observed term: Spring 2026. All-zero
distributions (61) display unavailable percentages; 6,958 short totals remain
unscaled with an explanatory note. Zero GPA without letter-grade shares is
unavailable, while an evidenced zero letter-grade GPA remains valid. Permission
status stays pending and source URLs/dates remain visible.

Independent whole-branch review found source-name first-row selection, stale
repeat imports, and course-overlap-only grade disambiguation. Regression tests
were observed failing, then passing after fixes. Later imports now use the
validated current snapshot; source-name collisions are preflighted, older
observations cannot overwrite newer ones (including unrated profiles), previously
collected terms are retained, and exact-name grade ambiguity stays unresolved.
The first corrected dataset was regenerated from the untouched legacy baseline,
not from an earlier experimental import.

The user accepted the local preview on 2026-10-29. Changes are merged into local
`main`; no push, GitHub release, or extension-store upload is included.
The `.worktrees/direct-data/dist` preview and its ignored identity-review report
are retained so an unpacked extension using that directory continues to work.

Local integration verification: 308/308 tests across 33 files pass; typecheck and
the default build pass. Content bundle is 9,819,042 bytes (about 9.4 MiB), reflecting
individual term history rather than only legacy aggregates. Automated default /
link-only / default builds confirm isolation and byte-stable rebuilds. The
manifest still has no API or host permissions beyond its TSS content-script
match. Raw source cells are absent from the bundle. No automated signed-in
Chrome/TSS test was run; the local preview was accepted by the user.
Vitest scopes discovery to the current checkout's `tests/` directory so retained
linked worktrees are not scanned and executed as duplicate suites.

The remainder of this document records earlier milestones. Its former bundle
sizes and snapshot counts describe the legacy build, not the direct import.

### Earlier provider and snapshot milestones

A normalized provider boundary supplies the badge and detail card. The default
build is a network-free, approximately 4.3 MB package that includes the Easy-A
snapshot and labels it `Data snapshot — source permissions pending`. An
explicit link-only entry produces a roughly 16 KB fallback with no snapshot
records. Automated tests build default, link-only, then default again to guard
against mode leakage.

The instructor detail card now renders available historical grade percentages
as a compact, accessible bar chart for A/B/C/D/F/W/P/NP. Bars use the source
percentages directly, omit unavailable categories, and expose exact values on
hover and keyboard focus. The existing GPA, sample, offering, source, and
historical-not-predictive context remains visible.

Second external review batch (2026-09-19): 19 additional guarded short-name
aliases accepted; 13 existing RMP profiles checked, six grade-only records kept
without ratings. Audit: 1,608 matched, 39 ambiguous, 286 needs-evidence,
62 no-candidate. Bernard Brown is held because his source rating points to
Barry Brown (Communication), not the dance instructor. Full evidence and scope:
`reports/short-name-batch-2-review.md`. Earlier counts below are historical.

On 2026-09-19, externally verified Mark Anderson -> Mark Ronald Anderson
was added as a guarded alias. His existing RMP profile 2089978 and MAE 142
history now resolve through the effective dataset. Only his audit status changed:
1,589 matched, 39 ambiguous, 305 needs-evidence, 62 no-candidate.
Evidence is recorded in `src/data/reviewed-short-names.json`; a regression test
covers the rating, MAE 142 history, and rejection of unrelated CSE 142 history.
The first-batch counts below are historical.

On 2026-09-18, the first 25 recommended short names were individually checked
against UCSD sources and their 21 existing RMP profiles, then added as guarded
aliases. Four grade-only records retain unavailable ratings. Audit coverage is
now 1,588 matched, 39 ambiguous, 306 needs-evidence, and 62 no-candidate.
The remaining recommendation queue is 284 recommended and 22 review.
Evidence: `reports/short-name-batch-1-review.md`. Earlier counts below describe
the preceding milestones.

Phase 1, Phase 2, and Phase 3 are completed. Phase 4 has an Easy-A-author-
approved noncommercial snapshot integrated locally; direct upstream RMP and
UCSD redistribution permission remains unresolved and is disclosed in the
public-build UI. Phase 5 UI work uses that labeled snapshot. Phase 6 reliability
work includes automated SPA transition checks and a user-reported live TSS
smoke pass. Broad layout coverage and clean-profile package testing remain.

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
- Added a reproducible Easy-A Radar snapshot transformer and importer.
- Imported 4,864 professor identity records and 11,159 historical course ×
  professor records from the 2026-07-23 snapshot.
- Preserved reviewed aliases and normalized zero-padded TSS catalog numbers.
- Treated missing student counts, zero-rating profiles, and unavailable
  percentage sentinels as unavailable instead of inventing values.
- Connected the validated local snapshot to live badges and detail cards.
- Added compact A/B/C/D/F/W/P/NP historical grade distributions.
- Added safe clickable Easy-A source links and direct RMP profile links when
  a numeric source professor ID is available.
- Added explicit integration coverage for rating-only, grade-only, neither,
  and ambiguous real snapshot states.
- Minified normal builds and reserved source maps for watch-mode development.
- Fixed stale detail cards after instructor, course, or term changes on reused
  DOM links, using value snapshots rather than context object references.
- Fixed orphaned cards when TSS removes the instructor table.
- Verified unchanged scans preserve the existing open card.
- Added scan failure isolation with best-effort stale-UI removal and recovery
  on subsequent TSS mutations. Warnings are generic and contain no DOM,
  error-object, or session data.
- Filtered extension-owned badge/card mutations to prevent self-triggered
  scan loops while preserving mixed batches containing TSS changes.
- Verified repeated failures, cleanup failures, and recovery with the real
  observer/parser/badge pipeline in jsdom.
- Expanded the automated suite to 218 tests across 23 files, including guarded
  current-instructor stub and source-profile consolidation.
- Added an offline batch audit of 1,995 upstream `fa` instructor names, with
  candidate IDs, profile links, historical courses, protected report output,
  and an input fingerprint. It is not a live-TSS capture or full external audit.
- Consolidated 692 redundant identity records under guarded source-profile and
  reviewed current-instructor evidence rules. The latter covers 170 exact
  full-name reversals or shortened names corroborated by the same subject.
  All 11,159 historical rows survive; generated JSON is untouched. Strict
  lookup coverage is now 1,563 upstream names. The remaining audit queues
  contain 39 ambiguous, 331 needs-evidence, and 62 no-candidate
  names.
- Restored Nathan Delson / Nathan J. Delson through independently reviewed
  aliases, preserving the existing rating and MAE 3 history.
- Resolved the 11 priority conflicting-profile cases with exact RMP identity,
  department, and UCSD course/faculty evidence. Remaining queues are recorded
  in `INSTRUCTOR_MATCH_REVIEW.md`; unlinked shortened/accent/hyphen candidates
  are not accepted automatically.
- Added evidence-backed reviewed consolidation for Alyssa Taylor/Taylor-Amos,
  Siavash Mirarab/Mir Arabbaygi, Thomas/Tom Erbe, Timothy/Tim Gentner, and
  Cheryl Anderson. Exact source fingerprints guard every member and preserve
  all historical rows.
- Added the official short-name alias `Keiko Nomura` to the existing
  `Nomura, Keiko K.` MAE identity, restoring RMP 377111 and existing MAE
  historical lookups without changing their source values.
- Added official short-name aliases for Justin Opatkiewicz to the existing
  `Opatkiewicz, Justin Paul` identity, restoring RMP 1802395 and CENG 120
  history without changing snapshot values.
- Kept Mark Young, Elizabeth Miller, and Natalye Harpin/Pass unresolved where
  department-specific histories or missing surname-change evidence make a
  global identity merge unsafe.
- Added a deterministic offline short-name recommendation tool for the 331
  `needs-evidence` audit entries. Its current report marks 309 unique
  middle-name omissions with same-subject support as recommendations and
  leaves 22 compatible names without subject overlap for review. It records
  input hashes, produces byte-stable JSON and Markdown, and never promotes an
  alias or edits source data automatically.
- Added documented Daphne Taylor García accent/hyphen variants and
  consolidated Isabella Maita's exact empty duplicate into the reviewed
  full-name identity. Existing metrics and course histories are unchanged;
  missing AIP 197 history remains unavailable.
- Added reviewed Linnea Wilder / Linnea L. Wilder aliases, restoring the
  existing rating and ANTH 2 history without changing snapshot metrics.
- Recorded a read-only shortened-name audit in `NAME_MATCH_AUDIT.md`: 1,691
  unresolved hypothetical short forms, not confirmed TSS failures. No
  unverified aliases or broader matching rules were added.
- Added documented, exact-identity aliases for Miles Jones and Aaron
  Shalev/Schulman, restoring existing CSE 21 and CSE 29 historical lookups.
- Added Aaron's separately sourced 2026-09-15 RMP observation,
  preserving the Extended Studies profile label and review-count limitation.
  It is included in the pending-permission snapshot and remains unapproved by
  the upstream source.
- Added original navy-and-gold lens icons at 16, 32, 48, and 128 pixels,
  manifest registration, build copies, and a real-build packaging regression.
- Recorded the user's 2026-09-15 live-TSS smoke pass for course switching,
  repeated card use, empty instructors, duplicate prevention, and TSS actions.
- Drafted `PRIVACY.md` and `RELEASE_CHECKLIST.md`, including TSS access
  justification, external-link behavior, and explicit publication gates.
- Added replaceable identity, rating, historical-grade, and external-link
  provider contracts with exception-contained, fail-closed composition.
- Added a link-only provider with user-clicked RMP search and UCSD A.S. archive
  links and no automatic external request.
- Made the Easy-A snapshot the default build while retaining the explicit
  `build:link-only` fallback and a visible pending-permission label.
- Added automated bundle isolation, consecutive-build, runtime cleanup, and
  link-only accessibility regressions.

## Current Architecture

- `manifest.json`: Chrome extension configuration.
- `build.mjs`: esbuild build process.
- `src/content.ts`: default pending-permission snapshot entry.
- `src/content-link-only.ts`: explicit no-snapshot fallback entry.
- `src/content-development.ts`: legacy development-snapshot entry retained for
  local compatibility.
- `src/content-runtime.ts`: provider-injected TSS observer and cleanup runtime.
- `src/data/providers/`: replaceable data contracts and provider compositions.
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
- `src/data/easy-a-dataset.ts`: validates and exposes the imported local
  snapshot.
- `scripts/easy-a-transform.mjs`: converts an Easy-A Radar snapshot into the
  TritonLens schema.
- `scripts/recommend-name-matches.mjs`: converts a prior instructor audit into
  deterministic, review-only short-name recommendation reports.
- `src/data/name-variants.ts`: classifies exact reorder, middle-name,
  initial, accent, hyphen, spacing, and incompatible name relationships.
- `src/data/short-name-recommendations.ts`: combines name relationships with
  unique-candidate and same-subject evidence without changing runtime lookup.
- `src/data/lookup.ts`: conservative professor and course lookup.
- `src/data/validation.ts`: validates provenance and data integrity before a
  dataset can be treated as production-ready.
- `src/content.css`: badge styling.
- `tests/*.test.ts`: badge and TSS DOM parser tests.

## Data Status

The default build shows available ratings and historical grades from the local
snapshot without a `dev` suffix; its detail card discloses that source
permissions are pending. The link-only build shows `View ratings` and contains
no metric snapshot. Values ending in `demo` are fictional test fixtures.

TritonLens currently:

- makes no automatic external network requests (source links navigate only
  when clicked by the user);
- collects no student information;
- stores no TSS session information;
- makes rating and historical-grade lookups against a bundled local snapshot,
  with no live requests to RMP or UCSD data services;
- retains a separate link-only build for user-clicked RMP search and UCSD A.S.
  archive navigation.

## Known Limitations

- Extraction currently depends on rendered TSS DOM attributes.
- Structured TSS OData observation is deferred unless DOM extraction proves
  insufficient.
- The detail card is intentionally a non-modal popover and can temporarily
  cover nearby TSS rows until dismissed.
- Snapshot data can be incomplete or stale and is not a prediction.
- Direct upstream permission for public redistribution remains unresolved.
- Easy-A Radar author permission does not by itself resolve the restrictions
  imposed by its underlying RMP and UCSD sources.

## Next Milestone

Phase 6/7 — Broader reliability checks and public snapshot release preparation.

Next tasks:

1. Expand the user-reported live smoke pass to a recorded multi-department
   matrix; do not treat it as exhaustive layout or clean-profile coverage.
2. Validate known, missing, and alias matches
   across several live TSS departments.
   Review the 309 generated recommendations in batches before promoting any
   alias; keep the 22 no-subject entries and all ambiguous/no-candidate cases
   manual. Record user decisions separately from independent identity
   verification and do not reassign conflicting grade histories from a
   rating-profile choice.
3. Verify grade-distribution layout and keyboard behavior at normal and narrow
   browser widths.
4. Preserve the Easy-A Radar permission record outside the public repository.
5. Keep RMP and UCSD permission requests as release preparation rather than a
   blocker for local development.
6. Run every future imported snapshot through `validateLocalDataset()`.
7. Load both the default and link-only packages in a clean Chrome profile and
   complete the multi-department, narrow-layout, and keyboard release matrix.

## Blockers

The user has chosen to prepare a public snapshot build while direct RMP and
UCSD redistribution permission remains unresolved. The implementation labels
that status truthfully, but the label does not remove the legal or store-review
risk. The link-only build remains the lower-risk fallback.
