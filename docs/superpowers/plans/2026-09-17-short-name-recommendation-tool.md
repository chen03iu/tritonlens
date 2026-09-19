# Offline Short-Name Recommendation Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic offline CLI that classifies all instructor-audit `needs-evidence` entries and emits reviewable JSON and Markdown reports.

**Architecture:** A pure name-relationship module feeds a pure evidence evaluator. A Node CLI validates a prior instructor audit report, bundles the evaluator with esbuild, and writes deterministic reports without changing runtime lookup or source datasets.

**Tech Stack:** TypeScript 5.6, Node.js 20+, esbuild, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-17-short-name-recommendation-tool-design.md`

## Global Constraints

- Process only audit entries with status `needs-evidence`.
- Make no network requests and use no AI/LLM calls.
- Never modify generated datasets, reviewed corrections, professor records, or historical rows.
- Runtime `lookupProfessor()` remains unchanged.
- Only deterministic evidence may produce `recommended`.
- Same input must produce byte-identical JSON and Markdown reports.
- Use test-driven development for every production behavior.

---

### Task 1: Deterministic name relationships

**Files:**
- Create: `src/data/name-variants.ts`
- Create: `tests/name-variants.test.ts`

**Interfaces:**
- Produces:
  - `type NameRelationshipKind = 'exact-reordered' | 'middle-omitted' | 'middle-initial' | 'orthographic-variant' | 'fuzzy-only' | 'incompatible'`
  - `interface NameRelationship { kind: NameRelationshipKind; currentName: string; candidateName: string; compatible: boolean }`
  - `analyzeNameRelationship(currentName: string, candidateName: string): NameRelationship`

- [ ] **Step 1: Write failing relationship tests**

Create table-driven tests with literal expectations for:

```ts
[
  ['Justin Opatkiewicz', 'Opatkiewicz, Justin Paul', 'middle-omitted'],
  ['Justin P. Opatkiewicz', 'Opatkiewicz, Justin Paul', 'middle-initial'],
  ['Daphne Taylor Garcia', 'Taylor-Garcia, Daphne', 'orthographic-variant'],
  ['Daphne Taylor García', 'Taylor-Garcia, Daphne', 'orthographic-variant'],
  ['Keiko Nomura', 'Nomura, Keiko K.', 'middle-omitted'],
  ['Kenji Nomura', 'Nomura, Keiko K.', 'incompatible'],
  ['Elizabeth Miller', 'Miller, Elizabeth Deen', 'middle-omitted'],
  ['Bob Example', 'Example, Robert', 'incompatible'],
]
```

Also assert blank names and first-initial-only forms are incompatible.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm.cmd test -- tests/name-variants.test.ts`

Expected: FAIL because `src/data/name-variants.ts` does not exist.

- [ ] **Step 3: Implement token normalization and relationship analysis**

Implement private helpers for NFKD accent removal, Unicode dash normalization,
punctuation removal, comma-form reordering, and token comparison. Do not use
edit distance or nickname tables.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm.cmd test -- tests/name-variants.test.ts`

Expected: all relationship tests pass.

### Task 2: Evidence classification

**Files:**
- Create: `src/data/short-name-recommendations.ts`
- Create: `tests/short-name-recommendations.test.ts`
- Modify: `src/data/instructor-audit.ts` only if exporting its existing candidate type is required.

**Interfaces:**
- Produces:
  - `type Recommendation = 'recommended' | 'review' | 'rejected'`
  - `interface ShortNameRecommendation { currentName: string; currentCourses: readonly string[]; candidateId: string | null; candidateName: string | null; relationship: NameRelationshipKind | null; sharedSubjects: readonly string[]; supportingEvidence: readonly string[]; conflictingEvidence: readonly string[]; recommendation: Recommendation; reason: string }`
  - `recommendShortNameMatches(entries: readonly InstructorAuditEntry[]): readonly ShortNameRecommendation[]`
  - `summarizeRecommendations(results): { recommended: number; review: number; rejected: number; total: number }`

- [ ] **Step 1: Write failing evaluator tests**

Use hand-built `InstructorAuditEntry` fixtures. Assert:

- Justin Opatkiewicz + CENG overlap is recommended.
- Keiko Nomura + MAE overlap is recommended.
- compatible middle omission without subject overlap is review.
- incompatible first name is rejected.
- multiple candidates are review.
- non-`needs-evidence` entries are omitted.
- reviewed holdout names Mark Young, Elizabeth Miller, and Natalye Harpin are review.
- output ordering is deterministic.
- input objects are unchanged.

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm.cmd test -- tests/short-name-recommendations.test.ts`

Expected: FAIL because the evaluator module does not exist.

- [ ] **Step 3: Implement the minimal evaluator**

Extract subject codes from strings using the first whitespace-delimited token,
evaluate all display-name and alias forms, select the strongest deterministic
relationship, apply holdouts, and construct literal evidence messages. Sort
arrays before returning.

- [ ] **Step 4: Run Tasks 1 and 2 tests and verify GREEN**

Run: `npm.cmd test -- tests/name-variants.test.ts tests/short-name-recommendations.test.ts`

Expected: both files pass.

### Task 3: Offline CLI and deterministic reports

**Files:**
- Create: `scripts/recommend-name-matches.mjs`
- Create: `tests/name-match-recommendations-cli.test.mjs`
- Modify: `package.json`

**Interfaces:**
- CLI:
  - `npm.cmd run recommend:names -- <audit.json> [output.json] [output.md]`
  - defaults to `reports/name-match-recommendations.json` and `reports/name-match-recommendations.md`
- JSON report fields:
  - `schemaVersion`, `sourceAuditSha256`, `sourceSnapshotSha256`, `counts`, `entries`
- Markdown report:
  - heading, provenance hashes, counts table, and deterministic sections for recommended/review/rejected.

- [ ] **Step 1: Write failing CLI integration tests**

Create temporary audit fixtures and assert:

- output JSON schema and literal counts;
- Markdown contains recommendation headings and instructor names;
- malformed input creates neither output;
- input/output alias paths are rejected;
- generated dataset and reviewed-corrections paths are protected;
- two runs against identical input produce byte-identical outputs.

- [ ] **Step 2: Run CLI tests and verify RED**

Run: `npm.cmd test -- tests/name-match-recommendations-cli.test.mjs`

Expected: FAIL because the CLI does not exist.

- [ ] **Step 3: Implement validation, bundling, rendering, and writes**

Validate `schemaVersion`, `instructorSnapshotSha256`, and every audit entry
before evaluating. Build the TypeScript evaluator with esbuild. Compute SHA-256
from the exact input bytes. Produce both payload strings in memory before
creating output directories and writing files.

- [ ] **Step 4: Add the package script**

Add:

```json
"recommend:names": "node scripts/recommend-name-matches.mjs"
```

- [ ] **Step 5: Run CLI and evaluator tests and verify GREEN**

Run: `npm.cmd test -- tests/name-variants.test.ts tests/short-name-recommendations.test.ts tests/name-match-recommendations-cli.test.mjs`

Expected: all new tests pass.

### Task 4: Generate reports and document the workflow

**Files:**
- Create: `reports/name-match-recommendations.json`
- Create: `reports/name-match-recommendations.md`
- Modify: `INSTRUCTOR_MATCH_REVIEW.md`
- Modify: `PROJECT_STATUS.md`

**Interfaces:**
- Consumes the CLI from Task 3 and `reports/instructor-audit.json`.
- Produces committed, reproducible review artifacts for the current 331-entry queue.

- [ ] **Step 1: Generate the current reports**

Run:

```powershell
npm.cmd run recommend:names -- reports/instructor-audit.json reports/name-match-recommendations.json reports/name-match-recommendations.md
```

Expected: counts total exactly 331.

- [ ] **Step 2: Review safety samples**

Confirm Justin Opatkiewicz and Keiko Nomura are absent because they are already
matched; confirm no `ambiguous` or `no-candidate` audit entry appears; inspect
the recommended, review, and rejected samples for evidence messages.

- [ ] **Step 3: Update project documentation**

Document the offline command, report-first policy, current counts, deferred
automatic promotion, and future snapshot workflow. Do not claim the
recommendations are verified aliases.

- [ ] **Step 4: Run complete verification**

Run:

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
git diff --check
```

Then regenerate both reports to temporary paths and compare SHA-256 hashes with
the checked-in report files. Expected: 0 test failures, successful typecheck and
build, no diff-check errors, and byte-identical reports.
