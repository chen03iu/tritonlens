# Direct Source Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Use the collected RMP roster and authorized UCSD aggregate export in the locally built extension, retaining reviewed identities and truthful grade semantics.

**Architecture:** Generate a separate validated LocalDataset from the existing corrected dataset plus offline source files. Keep all collection code in the private pipeline. Preserve reviewed IDs and aliases before refreshing metrics. Present actual term distributions, with latest term selected initially, instead of averaging unweighted percentages.

**Tech Stack:** Existing TypeScript, Node ESM, esbuild, Vitest, jsdom; no new dependencies or browser permissions.

**Spec:** Existing provider contracts and project data semantics; the user has authorized using the collected data now. The prior local-sync design's identity-preservation, missing-data, and no-unweighted-aggregation constraints apply. This plan records the implementation decisions delegated to the builder; it does not assert new source permission or full archive coverage.

## Global Constraints

- All product copy, code, documentation, and commits remain English.
- Preserve the legacy baseline and reviewed identity corrections; do not reapply metric fingerprints after refreshing metrics.
- Match RMP profile IDs first. Only unique exact full-name/known-alias matches without conflicting IDs may gain a new profile. Report conflicts without silently choosing.
- Treat the QA export as partial historical coverage; preserve its source URL and dates. Do not claim a complete archive or permission approval.
- Do not average term percentages without student counts. Keep sampleSize null. Treat zero GPA as unavailable when no letter-grade share exists, and all-zero distributions as unavailable.
- Do not rescale percentages, label unexplained remainders, automate source requests, publish, merge, or push.

## Review Focus

- Existing reviewed aliases must survive numeric rating changes and profile conflicts must not acquire another person's metrics.
- Duplicate names/terms must remain ambiguous or stop; an older source must not overwrite newer metrics.
- A term with all-zero shares or pass-only grades must not produce a misleading 0.00 GPA.
- Source gaps and short totals must remain visible without fabricating sample sizes or normalizing shares.
- Invalid inputs or an interrupted import must not replace the last valid snapshot; link-only builds must exclude all metric data.

### Task 1: Offline merge and term model

**Files:** `scripts/direct-source-transform.ts`, `src/data/types.ts`, `src/data/validation.ts`, `tests/direct-source-transform.test.ts`, `tests/data-validation.test.ts`.

**Interfaces:** `transformDirectSources(baseline, rmpSnapshot, browserCandidate)` returns `{dataset: LocalDataset, report}`. Historical records optionally carry `terms` with year, quarter, nullable GPA, and distribution; their summary represents the latest term. Existing aggregate-only records remain supported.

- [x] Write failing tests for ID refresh, preserved aliases, new profiles, conflicting profiles/names, grade association, term ordering, zero/pass-only GPA, no unweighted averaging, raw-cell mismatches, duplicate terms, invalid ranges, and explicit partial coverage.
- [x] Observe RED, implement strict source validation and deterministic transformation, then pass focused tests.
- [x] Commit the independently testable importer and model.

### Task 2: Reproducible import and runtime integration

**Files:** `scripts/import-direct-sources.mjs`, `src/data/direct-dataset.ts`, generated direct dataset, `src/content.ts`, `package.json`, `.gitignore`, CLI/integration/build tests.

**Interfaces:** `npm.cmd run import:direct -- <rmp.json> <browser-candidate.json> --allow-partial-archive` validates bounded offline files, generates a candidate, writes source hashes and diff/review reports locally, validates again, and promotes via same-directory temporary replacement with a rollback copy.

- [x] Test CLI refusal without explicit partial acknowledgment, invalid-file preservation, safe paths, and a successful synthetic import.
- [x] Observe RED, implement CLI, generate the real dataset, inspect counts/conflicts/diffs, and switch the default entry to the validated direct dataset.
- [x] Preserve the legacy development entry and link-only build; update default-build assertions and add real-data identity/provenance checks.
- [x] Commit only normalized data, code, and tests; raw input/report/backup files stay ignored.

### Task 3: Term selection and complete local verification

**Files:** `src/professor-detail-card.ts`, `src/instructor-badges.ts`, `src/content.css`, UI tests, README, source/privacy/status/attribution docs.

**Interfaces:** Card defaults to the latest actual historical term, offers a labeled term selector when multiple exist, displays Term GPA (or Unavailable), raw distribution bars and incomplete/zero notes. Legacy aggregate cards preserve their labels.

- [x] Write and observe failing UI tests for latest/previous-term selection, null GPA, all-zero distribution, short-total notice, accurate percentages, source links and dismissal.
- [x] Implement term rendering and nullable badge GPA, pass focused tests, typecheck, full suite, default and link-only builds.
- [x] Record exact source coverage and refreshed/retained metrics, obtain one whole-branch review, resolve important findings, and commit.
- [x] Produce a local unpacked build and report its path and remaining limitations. No push or publication.
