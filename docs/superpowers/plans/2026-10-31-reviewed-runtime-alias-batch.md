# Reviewed runtime alias batch implementation plan

> **For agentic workers:** Use superpowers:executing-plans for native execution. Reuse the existing isolated checkout. Request a fresh read-only review after implementation.

**Goal:** Restore verified short-name lookup for 31 instructors without generic fuzzy matching or frozen numeric observations.

**Architecture:** A static evidence manifest binds each alias to an exact retained ID/name, RMP ID/department and owned course. An offline helper adds only reviewed aliases after normal data refresh, requiring fresh matching source evidence, unique ownership and no exact or potentially shortened-name collision. Runtime lookup stays unchanged.

**Tech stack:** Existing TypeScript, JSON, esbuild import CLI and Vitest.

- [x] Corroborate each lead with primary UCSD pages and the saved 2026-10-29 RMP snapshot; record source URLs/hash and exclude unresolved people.
- [x] Add failing tests for alias application, unchanged metrics/history, independent future metric updates, source/name/ownership/course contradictions, duplicate source rows and same-name collisions.
- [x] Implement `scripts/reviewed-runtime-aliases.ts` and its JSON manifest; apply at the end of `scripts/direct-source-transform.ts` and record added/blocked aliases in the import report. Review additionally requires preflight of already-promoted aliases before reconciliation/matching.
- [x] Seed an isolated candidate from the current curated snapshot, verify only reviewed aliases change, then promote through the normal importer. Preserve held-profile decisions.
- [x] Rerun the full stored-roster audit, tests, typecheck and build. Request a fresh review, update project status and commit locally; do not push or release.

Final validation: 531 tests / 42 files, typecheck and build pass. Exactly 31
aliases change; all other dataset fields remain identical. Audit gains 31 names,
75 rating-found pairs and 68 history-found pairs. No new ambiguous pair. Review's
promoted-alias finding is fixed with RED/GREEN regressions; no finding remains.
