# Explicit Reviewed Source-Name Bindings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement inline.

**Goal:** Accept individually corroborated alias/source-name differences without enabling generic fuzzy matching.

**Architecture:** Add optional `sourceDisplayName` to the static manifest and default existing rules to alias. Validate both names for collisions while retaining every existing ownership, freshness and preflight guard.

**Tech Stack:** Existing TypeScript, Vitest, Node importer; no dependencies.

**Spec:** [Explicit source-name design](../specs/2026-11-02-explicit-reviewed-source-names.md)

## Global Constraints

- Preserve every non-alias dataset field and every previous alias.
- Keep user-held identities and Landry's entire record unchanged.
- Grades require the exact queried course and professor.
- No publication, push, merge or credential capture.

## Review Focus

- Future profile renames, missing source rows and stale observations must stop promoted-alias imports.
- Alternate source-name collisions must block new aliases even when TSS alias is unique.
- Retained full-name collisions must block either name.
- Old rules must continue to require exact source-name equality by default.
- No numeric metric, source metadata or course-history ownership changes.

### Task 1: Guarded optional source-name binding

Files: `scripts/reviewed-runtime-aliases.ts`, `scripts/reviewed-runtime-aliases.json`, `tests/reviewed-runtime-aliases.test.ts`.

- [x] Review primary sources and add declared exact source names for supported candidates.
- [x] Add failing regressions for acceptance, changed-source rejection, collisions under either name, and promoted-alias preflight revalidation.
- [x] Implement the minimal optional binding and dual-name collision checks.
- [x] Run focused tests; the bundled-data case remains red until promotion.

### Task 2: Verified import and measured coverage

Files: generated direct dataset, evidence report, README, DATA_SOURCES, PROJECT_STATUS.

- [x] Seed isolated candidate from the current curated dataset and import saved sources.
- [x] Prove only approved aliases changed, no aliases were lost, and all other data is identical.
- [x] Obtain independent read-only review of code, evidence and candidate.
- [x] Promote normally; verify repeat import and backup hashes.
- [x] Run actual saved-roster audit, full suite, typecheck/build/diff checks.
- [x] Record measured gains and source-quality exclusions.
- Local commit is the final integration step; no push, merge or release.
