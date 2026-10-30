# Direct Identity Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically reconcile demonstrable internal duplicates, recover safely assignable term records, and withhold conflicting legacy profile links without guessing between distinct RMP IDs.

**Architecture:** An offline reconciliation pass precedes direct-source refresh. Same-profile records form compatible name clusters, not one indiscriminate profile-ID group. A unique history-bearing full-name identity may absorb its declared empty stub; a conflicting profile does not donate ratings. Persist validated old-ID redirects and an evidence report. The legacy baseline remains unchanged.

**Tech Stack:** Existing TypeScript, Node ESM, esbuild, Vitest/jsdom; no dependencies, requests, or browser permissions added.

**Spec:** User approved automatic internal duplicate cleanup and reserving genuinely ambiguous cases for review. Existing precision-first matching, reviewed aliases, held rename cases, term semantics, and source provenance remain binding.

## Global Constraints

- Do not merge different known profile IDs or unrelated names solely because they share an upstream ID.
- Exact reordered/accent/hyphen forms may cluster; middle/initial forms require compatible full-name/source evidence and a unique compatible cluster. Never merge by transitive short-name bridging.
- Keep profile 2321551 (Natalye Harpin/Pass) held for existing review.
- Distinct history-bearing identities with incompatible subjects or conflicting same-course observations remain separate.
- If a shared profile uniquely corroborates another full-name identity, withhold an incompatible legacy rating rather than transfer it. Initials, possible prefixes, and reviewed aliases stay unresolved rather than being treated as proof of a mismatch.
- Preserve every history row and previously collected term; record/validate redirects for retired duplicate IDs. Do not infer weights, counts, or missing percentages.
- No merge, push, publication, or external messages in this task.

## Review Focus

- Short-name bridges between different full middle names or first initials must remain ambiguous.
- A shared wrong RMP ID must not import another person's rating during stub consolidation.
- Keeper selection must preserve history identities, aliases, redirects, and newer observations independent of input order.
- All removed IDs/course keys must resolve to preserved records with explicit reconciliation evidence.
- Repeat imports must be idempotent and retain corrected unresolved/no-rating states.

### Task 1: Reconciliation and compatibility tests

**Files:** `scripts/reconcile-direct-identities.ts`, `tests/direct-identity-reconciliation.test.ts`, `src/data/types.ts`, `src/data/validation.ts`, `src/data/lookup.ts`.

**Interface:** `reconcileDirectIdentities(dataset, profiles)` returns `{dataset, remaps, withheldRatings}`. Profile evidence is `{id,displayName}` from the validated RMP roster.

- [x] Write and observe failing tests for exact compatible subclusters, source-backed initials, ambiguous bridges, unrelated/shared IDs, wrong-rating stubs, rename holdout, history conflicts, purity/idempotency and redirect validation/lookup.
- [x] Implement minimal guarded reconciliation and pass focused tests/typecheck.

### Task 2: Import integration and real evidence

**Files:** `scripts/direct-source-transform.ts`, `scripts/import-direct-sources.mjs`, generated direct JSON, import/dataset tests, status/source docs.

**Interfaces:** Transform reports include reconciliation evidence. CLI permits only validated redirected ID retirements, compares course keys after redirects, and writes a readable cleanup report alongside the unresolved queue.

- [x] Observe integration tests failing for recovered duplicate grade/rating links and guarded retirements; implement and verify.
- [x] Run offline real import, inspect remaps/withheld ratings, verify term preservation and remaining ambiguity counts; repeat to prove deterministic data.
- [x] Run typecheck, full tests, build, and one fresh read-only branch review; resolve important findings with regression tests.
- [x] Commit locally and report exact results, remaining cases, and preview path. Preserve existing main/user files.
