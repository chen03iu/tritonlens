# Single-Owner Binding Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans inline.

**Goal:** Stop three independently verified cross-person legacy rating links from surviving singleton reconciliation.

**Architecture:** Extend the existing development-only reconciliation with exact reviewed negative bindings. Preserve histories and native source observations; stop when an active correction's evidence changes.

**Tech Stack:** Existing TypeScript, JSON registry, Vitest and saved-source importer.

**Spec:** [Design and evidence](../../reviewed-incorrect-bindings-2026-11-02.md)

## Global Constraints

- Only the three fixed reviewed identities/profile IDs can be detached.
- Every grade record, name/alias, existing redirect and all unrelated observations remain identical.
- Preserve all nine importer-held profiles and Landry's entire record.
- No fuzzy runtime policy, new collection, push, merge or release.

## Review Focus

- Singleton and shared ownership must both support the narrow reviewed correction.
- Missing/stale/duplicate/changed source evidence stops an active correction.
- A sole rejected alternate is omitted; other alternate IDs stop import for revalidation without modifying input.
- Exact native source observations remain available and repeat import is stable.
- Production/mock data and unrelated records are untouched.

### Task 1: Reproduce and correct guarded single-owner links

- [x] Add registry and failing unit/integration regressions.
- [x] Implement minimal reviewed detachment within reconciliation.
- [x] Verify preserved histories, source observations and revalidation failures.

### Task 2: Verify candidate and finish locally

- [x] Import isolated candidate seeded from the current snapshot.
- [x] Prove only the three selected bindings change and native observations remain exact.
- [x] Obtain independent read-only review.
- [x] Promote and check repeat-import hash; run runtime audit/full suite/typecheck/build.
- [x] Update evidence/status/source notes.
- Local commit is the final integration step; no push, merge or release.
