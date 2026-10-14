# Replaceable Data Provider Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the public TritonLens build independent of Easy-A Radar by defaulting to user-clicked source links, while preserving the current Easy-A snapshot as an explicit development-only provider.

**Architecture:** A synchronous `InstructorDataService` composes independent identity, rating, historical-grade, and external-link providers into one UI-facing `InstructorInsight`. Separate release and development entry points inject the appropriate service, so the normal build graph cannot include the Easy-A generated dataset.

**Tech Stack:** TypeScript, Chrome Manifest V3, plain DOM APIs, esbuild, Vitest, jsdom

**Spec:** `docs/superpowers/specs/2026-10-14-data-provider-architecture-design.md`

## Global Constraints

- The default `npm run build` is link-only and contains no Easy-A generated dataset, RMP metric snapshot, or UCSD historical-grade metric snapshot.
- The extension runtime makes no automatic RMP or UCSD grade-source network request.
- The existing TSS parser, MutationObserver behavior, identity precision rules, card dismissal, and accessibility behavior remain intact.
- Development metrics remain explicitly labeled `Development snapshot — not for release`.
- Missing and ambiguous identities fail closed; rating and historical-grade availability remain independent.
- External links must be HTTPS and open only after a user click with `target="_blank"` and `rel="noopener noreferrer"`.
- No RMP GraphQL wrapper, backend, analytics, account, storage, or broader Chrome permission is added.

## Review Focus

- An instructor name containing spaces, accents, apostrophes, or `&` must be encoded once in the RMP search URL and display unchanged in TSS.
- An ambiguous snapshot identity must expose no rating or grade metric while preserving safe generic outbound links.
- A rating source ID that is absent or nonnumeric must never generate a direct RMP profile URL.
- A provider exception must degrade to unavailable data without breaking subsequent TSS scans or retaining a stale card.
- Release and development builds run consecutively without leaking the previously selected data mode into the next output directory.

---

### Task 1: Add Normalized Provider Contracts and Snapshot Adapters

**Files:**
- Create: `src/data/providers/types.ts`
- Create: `src/data/providers/instructor-data-service.ts`
- Create: `src/data/providers/local-dataset-providers.ts`
- Test: `tests/data-providers.test.ts`

**Interfaces:**
- Produces: `ProviderMode`, `ProfessorIdentity`, `IdentityLookupResult`, `SourcedProfessorRating`, `SourcedHistoricalGrades`, `ExternalDataLink`, `InstructorInsight`, and the four provider interfaces in `src/data/providers/types.ts`.
- Produces: `createInstructorDataService(options: InstructorDataServiceOptions): InstructorDataService` in `src/data/providers/instructor-data-service.ts`.
- Produces: `createLocalDatasetProviderSet(dataset: LocalDataset): LocalDatasetProviderSet` in `src/data/providers/local-dataset-providers.ts`.
- Consumes: existing `ProfessorRating`, `HistoricalCourseGradeRecord`, `DataSourceReference`, `LocalDataset`, lookup result behavior, and `RenderedInstructorContext`.

- [ ] **Step 1: Write failing provider tests**

Add tests proving that a service composed from `MOCK_DATASET` returns a normalized found identity, sourced rating, course-specific sourced grades, and exact/alias match method; that grade-only and rating-only records stay independent; that ambiguous identity exposes neither metric; that a missing `sourceId` is converted to unavailable rather than an invented source; and that thrown identity/rating/grade providers are contained as unavailable results.

- [ ] **Step 2: Run the provider tests and verify RED**

Run: `npm.cmd test -- tests/data-providers.test.ts`

Expected: FAIL because `src/data/providers/*` and the provider contracts do not exist.

- [ ] **Step 3: Define the provider result types**

In `src/data/providers/types.ts`, define these exact public contracts:

```ts
export type ProviderMode =
  | 'link-only'
  | 'development-snapshot'
  | 'production-snapshot';

export interface ProfessorIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly matchMethod: ProfessorMatchMethod;
}

export type IdentityLookupResult =
  | { readonly status: 'found'; readonly identity: ProfessorIdentity }
  | { readonly status: 'ambiguous' }
  | { readonly status: 'not-found' };

export interface SourcedProfessorRating {
  readonly rating: ProfessorRating;
  readonly source: DataSourceReference;
}

export interface SourcedHistoricalGrades {
  readonly record: HistoricalCourseGradeRecord;
  readonly source: DataSourceReference;
}

export type ProfessorRatingLookupResult =
  | { readonly status: 'found'; readonly data: SourcedProfessorRating }
  | { readonly status: 'not-found' };

export type HistoricalGradesLookupResult =
  | { readonly status: 'found'; readonly data: SourcedHistoricalGrades }
  | { readonly status: 'ambiguous' }
  | { readonly status: 'not-found' };

export interface ExternalDataLink {
  readonly kind: 'professor-ratings' | 'historical-grades';
  readonly label: string;
  readonly url: string;
}

export interface InstructorInsight {
  readonly mode: ProviderMode;
  readonly identity: IdentityLookupResult;
  readonly professorRating: ProfessorRatingLookupResult;
  readonly historicalGrades: HistoricalGradesLookupResult;
  readonly links: readonly ExternalDataLink[];
}

export interface InstructorDataService {
  readonly mode: ProviderMode;
  getInsight(context: RenderedInstructorContext): InstructorInsight;
}
```

Also define these focused provider methods:

```ts
export interface InstructorIdentityProvider {
  lookup(displayName: string): IdentityLookupResult;
}

export interface ProfessorRatingProvider {
  lookup(identity: ProfessorIdentity): ProfessorRatingLookupResult;
}

export interface HistoricalGradesProvider {
  lookup(
    identity: ProfessorIdentity,
    subjectCode: string,
    catalogNumber: string,
  ): HistoricalGradesLookupResult;
}

export interface ExternalLinkProvider {
  getLinks(
    context: RenderedInstructorContext,
    identity: IdentityLookupResult,
    rating: ProfessorRatingLookupResult,
  ): readonly ExternalDataLink[];
}

export interface InstructorDataServiceOptions {
  readonly mode: ProviderMode;
  readonly identityProvider: InstructorIdentityProvider;
  readonly ratingProvider: ProfessorRatingProvider;
  readonly gradesProvider: HistoricalGradesProvider;
  readonly linkProvider: ExternalLinkProvider;
}

export type LocalDatasetProviderSet = Omit<
  InstructorDataServiceOptions,
  'mode'
>;
```

- [ ] **Step 4: Implement service composition and local-dataset adapters**

Implement `createInstructorDataService()` so each provider call is independently exception-contained and an identity other than `found` prevents metric lookup. An exception maps only the affected result to `not-found`; an ambiguous grade lookup remains `ambiguous`. Implement `createLocalDatasetProviderSet()` by adapting the existing conservative lookup functions, mapping source IDs to `DataSourceReference`, rejecting missing sources, and creating a direct RMP profile link only for a numeric `sourceProfessorId`.

- [ ] **Step 5: Run provider tests and the existing data tests**

Run: `npm.cmd test -- tests/data-providers.test.ts tests/data-lookup.test.ts tests/easy-a-integration.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/data/providers tests/data-providers.test.ts
git commit -m "refactor: add instructor data provider contracts"
```

### Task 2: Add the Network-Free Link-Only Provider

**Files:**
- Create: `src/data/providers/link-only.ts`
- Test: `tests/link-only-provider.test.ts`

**Interfaces:**
- Consumes: `createInstructorDataService()` and provider contracts from Task 1.
- Produces: `createLinkOnlyInstructorDataService(): InstructorDataService`.
- Uses: UCSD RMP school ID `1079` and A.S. grade archive landing page `https://dev-as.ucsd.edu/Home/InstructorGradeArchive`.

- [ ] **Step 1: Write failing link-only tests**

Test that `createLinkOnlyInstructorDataService()` returns mode `link-only`, no identity metrics, no rating, and no grades; returns an RMP search URL of `https://www.ratemyprofessors.com/search/professors/1079?q=<encoded name>` and the grade-archive landing URL; correctly handles accents, apostrophes, spaces, and ampersands; returns only HTTPS links; and never calls a stubbed `fetch`, `XMLHttpRequest`, or `navigator.sendBeacon` while creating insights or rendering their URLs.

- [ ] **Step 2: Run the link-only tests and verify RED**

Run: `npm.cmd test -- tests/link-only-provider.test.ts`

Expected: FAIL because the link-only provider does not exist.

- [ ] **Step 3: Implement the link-only composition**

Implement `createLinkOnlyInstructorDataService()` with no-op identity/rating/grade providers and an external-link provider that uses `URL` plus `searchParams.set('q', displayName)`. Do not import `easy-a-dataset.ts`, generated JSON, or any network library.

- [ ] **Step 4: Run link-only and provider tests**

Run: `npm.cmd test -- tests/link-only-provider.test.ts tests/data-providers.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/data/providers/link-only.ts tests/link-only-provider.test.ts
git commit -m "feat: add link-only instructor data provider"
```

### Task 3: Convert Badges and Detail Cards to Instructor Insights

**Files:**
- Modify: `src/instructor-badges.ts`
- Modify: `src/professor-detail-card.ts`
- Modify: `src/content.css`
- Modify: `tests/instructor-badges.test.ts`
- Test: `tests/link-only-ui.test.ts`

**Interfaces:**
- Consumes: `InstructorDataService` and `InstructorInsight` from Task 1.
- Changes: `enhanceVisibleInstructorLinks(root, contexts, service)` accepts `InstructorDataService` instead of `LocalDataset`.
- Changes: `toggleProfessorDetailCard(trigger, context, insight)` accepts the normalized insight instead of `LocalDataset`.

- [ ] **Step 1: Write failing link-only UI tests**

Add jsdom tests proving that link-only mode renders `View ratings`, stores `tritonlensDatasetKind="link-only"`, opens a card with `Ratings and historical grades are not included in this build.`, renders the two safe external links, renders no numeric score/GPA/grade bars/source date, keeps the complete instructor name, and preserves close button, outside click, repeated click, and Escape focus behavior.

- [ ] **Step 2: Update existing UI tests to express snapshot behavior through a service**

Replace direct `MOCK_DATASET`/`LocalDataset` arguments with a mock snapshot service created from Task 1 adapters. Keep all current assertions for exact, alias, rating-only, grade-only, ambiguous, stale-context, and distribution behavior.

- [ ] **Step 3: Run UI tests and verify RED**

Run: `npm.cmd test -- tests/link-only-ui.test.ts tests/instructor-badges.test.ts`

Expected: FAIL because badges and cards still require `LocalDataset`.

- [ ] **Step 4: Implement insight-driven badge state**

Resolve one `InstructorInsight` per badge state update. In link-only mode set the badge text to `View ratings`, use neutral accessible copy, omit metric dataset attributes, and retain context metadata. In snapshot modes preserve the current demo/development/production metric labels and attributes.

- [ ] **Step 5: Implement insight-driven detail cards**

Render sourced rating and sourced historical-grade sections from the insight. For link-only mode render the neutral no-bundled-data explanation plus the link list. Reuse HTTPS sanitization for all links, preserve grade visualization, and leave card positioning/lifecycle logic unchanged.

- [ ] **Step 6: Run UI and card regression tests**

Run: `npm.cmd test -- tests/link-only-ui.test.ts tests/instructor-badges.test.ts tests/content-observer.test.ts`

Expected: PASS after the observer fixture is still temporarily supplied its development service by the test harness.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/instructor-badges.ts src/professor-detail-card.ts src/content.css tests/instructor-badges.test.ts tests/link-only-ui.test.ts
git commit -m "refactor: render instructor insights in the UI"
```

### Task 4: Separate Release and Development Build Graphs

**Files:**
- Create: `src/content-runtime.ts`
- Create: `src/content-development.ts`
- Modify: `src/content.ts`
- Modify: `build.mjs`
- Modify: `package.json`
- Modify: `tests/content-observer.test.ts`
- Create: `tests/build-data-mode.test.mjs`

**Interfaces:**
- Produces: `startTritonLens(service: InstructorDataService): () => void` in `src/content-runtime.ts`; the returned function disconnects the observer and closes extension UI for tests.
- Release entry: `src/content.ts` calls `startTritonLens(createLinkOnlyInstructorDataService())`.
- Development entry: `src/content-development.ts` adapts `EASY_A_DATASET` and calls the same runtime.
- Build CLI: `node build.mjs` selects release entry; `node build.mjs --development-data` selects development entry; optional `--outdir=<absolute-or-relative-path>` isolates packaging tests.
- Package script: `build:development-data` runs `node build.mjs --development-data`.

- [ ] **Step 1: Write failing build-mode tests**

In a temporary output directory, run the default build and assert that `content.js` contains the link-only copy but not `Development snapshot — not for release`, `easy-a-radar-rmp`, or a representative generated-only identity. Run the development build in a second temporary directory and assert that it contains the development marker and that its size is materially larger than the release bundle. Run release again in a third directory to prove build selection does not leak between invocations.

- [ ] **Step 2: Write the failing release observer expectation**

Update `tests/content-observer.test.ts` so default `src/content` produces `View ratings`; add a development-entry case that still produces `★ 2.7 dev`. Keep failure isolation, mutation filtering, cleanup, and recovery tests against `startTritonLens()` with an injected deterministic service.

- [ ] **Step 3: Run build and observer tests and verify RED**

Run: `npm.cmd test -- tests/build-data-mode.test.mjs tests/content-observer.test.ts`

Expected: FAIL because the entry points and build flags do not exist.

- [ ] **Step 4: Extract the provider-injected content runtime**

Move scan scheduling, observer filtering, failure containment, and cleanup from `src/content.ts` into `startTritonLens(service)`. Keep warnings generic and ensure cleanup returned by the function prevents test observer leakage.

- [ ] **Step 5: Add release and development entry points**

Make `src/content.ts` import only the link-only composition. Make `src/content-development.ts` the only runtime entry that imports `EASY_A_DATASET` and the local snapshot adapters.

- [ ] **Step 6: Add deterministic build selection**

Update `build.mjs` to select one entry based on `--development-data`, always emit it as `content.js`, accept `--outdir=...`, and preserve existing watch/minify/icon behavior. Add `build:development-data` without changing default `build` safety.

- [ ] **Step 7: Run build, observer, icon, typecheck, and complete tests**

Run: `npm.cmd test -- tests/build-data-mode.test.mjs tests/content-observer.test.ts tests/build-icons.test.mjs`

Run: `npm.cmd run typecheck`

Run: `npm.cmd test`

Expected: all commands PASS with no warnings other than intentionally captured failure-isolation warnings.

- [ ] **Step 8: Commit Task 4**

```bash
git add src/content.ts src/content-runtime.ts src/content-development.ts build.mjs package.json tests/content-observer.test.ts tests/build-data-mode.test.mjs
git commit -m "build: default to link-only release data"
```

### Task 5: Update Release and Data-Source Documentation

**Files:**
- Modify: `DATA_SOURCES.md`
- Modify: `PRIVACY.md`
- Modify: `PROJECT_STATUS.md`
- Modify: `ROADMAP.md`
- Modify: `RELEASE_CHECKLIST.md`

**Interfaces:**
- Consumes: verified commands and bundle results from Tasks 1–4.
- Produces: an accurate operator-facing distinction between link-only release builds and development-snapshot builds.

- [ ] **Step 1: Update source and privacy records**

Record that ordinary external links perform no request until clicked; default builds contain no Easy-A/RMP/UCSD grade metric snapshot; development builds remain local and explicitly labeled; and source permission is still required before enabling public metrics.

- [ ] **Step 2: Update status, roadmap, and release checklist**

Record the provider boundary and safe release default as complete. Keep approved RMP and historical-grade integrations incomplete. Add clean-package checks for bundle contents, outbound links, default badge copy, and no automatic network traffic.

- [ ] **Step 3: Run final verification from a clean output**

Run: `npm.cmd run typecheck`

Run: `npm.cmd test`

Run: `npm.cmd run build`

Inspect: default `dist/content.js` passes the automated exclusion assertions and `dist/manifest.json` adds no host permissions beyond TSS.

Expected: typecheck, full tests, and release build PASS.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check`

Run: `git status --short`

Confirm that generated Easy-A JSON is unchanged, no secret file is staged, and only planned source, test, build, and documentation files changed.

- [ ] **Step 5: Commit Task 5**

```bash
git add DATA_SOURCES.md PRIVACY.md PROJECT_STATUS.md ROADMAP.md RELEASE_CHECKLIST.md
git commit -m "docs: document link-only release mode"
```
