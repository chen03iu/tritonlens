# TritonLens Data Provider Architecture Design

## Purpose

TritonLens must no longer require the Easy-A Radar snapshot to build or run.
The public-release configuration must work without redistributing RMP ratings
or UCSD historical-grade data, while local development may continue using the
existing explicitly labeled development snapshot.

The change must preserve the current TSS parser, conservative instructor-name
matching behavior, badge lifecycle, detail-card accessibility, and fail-safe
rule that TritonLens never breaks TSS.

## Goals

- Remove the direct `content.ts` dependency on `EASY_A_DATASET`.
- Make professor identity, professor ratings, historical grades, and outbound
  source links independently replaceable.
- Make a link-only configuration the safe release default.
- Keep the Easy-A development snapshot available through an explicit
  development-only configuration.
- Allow a future approved RMP or UCSD source to be added without rewriting the
  TSS integration or UI.
- Keep all lookups synchronous and local in the extension runtime for V1.
- Add no background service, account, analytics, or automatic external network
  request.

## Non-goals

- Implementing live RMP GraphQL access.
- Installing either third-party RMP wrapper package.
- Building a backend or scheduled synchronization service.
- Publishing RMP metrics or UCSD historical grades before source approval.
- Replacing the existing instructor-name review and evidence workflow.
- Changing the TSS DOM parser or MutationObserver architecture.

## Approaches Considered

### 1. Swap Easy-A for an RMP GraphQL wrapper

This removes one upstream dependency but introduces direct reliance on an
unofficial RMP endpoint. It does not supply UCSD grades, does not resolve RMP
permission, creates runtime reliability and browser-permission concerns, and
makes every installed browser an external-data client. This approach is not
selected.

### 2. Keep `LocalDataset` and select a different dataset at build time

This is a small change, but it leaves identity, ratings, grades, and source
links coupled inside one object. A future source change would continue to
affect UI code and could accidentally ship development data. This approach is
not selected as the long-term boundary.

### 3. Introduce independent local providers and compose them

This preserves the extension's local-first runtime while separating the four
responsibilities. A link-only release configuration and a snapshot-backed
development configuration can use the same UI-facing service. Approved
sources can later be added as offline-generated providers. This is the
selected approach.

## Architecture

The existing TSS parser continues to produce `RenderedInstructorContext`.
Instead of passing a `LocalDataset` directly into badge and card rendering,
the content script passes a composed `InstructorDataService`.

The service has four responsibilities:

1. Resolve an instructor identity conservatively when an approved local
   identity index is available.
2. Look up professor-level rating data from the selected local provider.
3. Look up course-by-professor historical grades from the selected local
   provider.
4. Produce safe HTTPS links for user-initiated navigation to source pages.

The UI consumes a single normalized result and does not know whether a value
came from a development snapshot, a future approved snapshot, or no metric
provider at all.

```text
TSS DOM
  -> RenderedInstructorContext
  -> InstructorDataService
       -> IdentityProvider
       -> ProfessorRatingProvider
       -> HistoricalGradesProvider
       -> ExternalLinkProvider
  -> normalized InstructorInsight
  -> badge and detail card
```

## Provider Contracts

Provider contracts live under `src/data/providers/` and are synchronous. They
must not fetch, write storage, or inspect TSS DOM.

`IdentityProvider` accepts the displayed instructor name and returns the
existing explicit `found`, `ambiguous`, or `not-found` result shape. Precision
remains more important than recall.

`ProfessorRatingProvider` accepts a resolved professor identity and returns a
rating or an explicit unavailable result. A provider must retain provenance,
update date, permission state, and source professor ID where applicable.

`HistoricalGradesProvider` accepts a resolved identity plus subject and
catalog number and returns an existing found, ambiguous, or unavailable grade
result. Historical values remain course-specific and are never described as a
prediction.

`ExternalLinkProvider` accepts the displayed instructor context and optional
resolved identity. It returns zero or more labeled HTTPS links. Link creation
does not perform a request. Unsafe or malformed URLs are discarded.

`InstructorDataService` composes those providers and returns an
`InstructorInsight` containing identity status, optional rating, optional
historical grades, links, and provider mode. The UI must render unavailable
states without treating them as errors.

## Configurations

### Release link-only configuration

The release configuration contains no Easy-A generated dataset and no RMP or
UCSD metric snapshot. It provides:

- the displayed TSS instructor and course context;
- a user-clicked RMP search or approved direct-profile link;
- a user-clicked historical-grade source link when a stable public landing
  page is appropriate;
- explicit unavailable text for rating and historical-grade metrics.

It performs no automatic request to either destination. The UI must not imply
that TritonLens, RMP, or UCSD supplied a score.

### Development snapshot configuration

The development configuration adapts the existing validated
`EASY_A_DATASET` into the provider contracts. It preserves current metrics,
aliases, reviewed corrections, source links, and the “Development snapshot —
not for release” label.

Selecting this configuration must require an explicit development build
choice. A normal release build must not import the generated Easy-A JSON into
its dependency graph or output bundle.

### Future approved-source configuration

An approved source will be transformed offline into the normalized local
provider format, validated, dated, and bundled. The extension runtime remains
network-free. Direct RMP GraphQL access is not part of this design.

## Build Selection and Safety

The build owns provider selection; page content and runtime storage cannot
enable a restricted provider. The default `npm run build` behavior is
link-only. A separate clearly named development command builds the Easy-A
snapshot configuration.

The release build must have an automated packaging test proving that the
generated Easy-A dataset and representative development-only source labels do
not appear in `dist/content.js`.

Dataset validation remains mandatory for any snapshot-backed configuration.
No source marked `pending` or `prohibited` may be accepted by a production
provider.

## UI Behavior

In link-only mode, the inline control uses neutral language such as
`View ratings` instead of `Rating unavailable`; the latter would imply a
failed lookup rather than an intentionally link-only product. Opening the
detail card shows:

- the instructor name;
- that ratings and historical-grade metrics are not included in this build;
- labeled external links that open only after a user click;
- no numeric score, grade distribution, or misleading source/update date.

In development snapshot mode, current badge and detail-card behavior remains
unchanged except that it receives normalized provider results rather than a
raw `LocalDataset`.

All external links continue to use HTTPS, `_blank`, and
`rel="noopener noreferrer"`. Badge/card close behavior and keyboard focus
behavior remain unchanged.

## Error Handling

- A missing or ambiguous identity produces no metric match.
- A provider exception is contained and converted to an unavailable result;
  it must not stop TSS scanning or leave stale extension UI.
- A malformed external URL is omitted.
- Missing rating and missing grades remain independent states.
- Development data can never silently fall back into a release build.

## Migration

1. Add provider contracts and an `InstructorInsight` result model.
2. Add a link-only provider composition and make it the release default.
3. Wrap the current `LocalDataset` lookup functions in snapshot adapters.
4. Change badges and cards to consume `InstructorDataService` results.
5. Add explicit release and development-snapshot build commands.
6. Add bundle-content, provider-behavior, UI, and regression tests.
7. Update source, privacy, status, roadmap, and release documentation.

The existing `LocalDataset`, importer, generated file, and reviewed identity
workflow remain in the repository for local development. They are not deleted
as part of this migration.

## Testing

Tests must cover:

- link-only mode emits no metrics and performs no network request;
- link-only badges and cards use neutral copy and safe external links;
- malformed and non-HTTPS links are omitted;
- development adapters preserve exact, alias, ambiguous, missing-rating,
  missing-grade, and grade-only behavior;
- current card dismissal, stale-context, and MutationObserver protections
  continue to pass;
- the normal release bundle excludes the Easy-A generated snapshot;
- the explicit development build continues to include and validate it;
- production providers reject pending or prohibited source records.

## Documentation and Provenance

`DATA_SOURCES.md` must describe link-only navigation separately from copying,
caching, or redistributing source metrics. `PRIVACY.md` must state that the
release build makes no automatic RMP or UCSD grade request. `PROJECT_STATUS.md`
and `ROADMAP.md` must record that the provider boundary is complete while real
metric integrations remain blocked pending source approval.

This architecture reduces technical and release coupling. It does not declare
that any particular source use is legally permitted; source approval remains
a separate release decision.
