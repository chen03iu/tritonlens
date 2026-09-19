# Offline Short-Name Recommendation Tool Design

**Date:** 2026-09-17
**Status:** Approved

## Goal

Build a deterministic offline developer tool that evaluates the instructor
audit's `needs-evidence` entries and recommends only high-confidence
short-name aliases. The tool reduces repeated manual work after future Easy-A
snapshot imports without changing runtime lookup behavior or source datasets.

## Scope

Version 1 processes only the instructor audit entries whose status is
`needs-evidence`. It does not process `ambiguous` or `no-candidate`
entries, scrape websites, call an LLM, modify the generated dataset, or write
reviewed corrections.

The tool reads:

- a previously generated `reports/instructor-audit.json`;
- candidate names, aliases, and historical courses already embedded in that
  report;
- a small reviewed holdout policy stored in source control.

It writes:

- `reports/name-match-recommendations.json` for machines and regression tests;
- `reports/name-match-recommendations.md` for human review.

## Architecture

### Name relationship analyzer

`src/data/name-variants.ts` compares a current instructor name with one
candidate name at a time. It recognizes these deterministic relationships:

- `exact-reordered`: identical full tokens in `First Last` and
  `Last, First` order;
- `middle-omitted`: first and surname agree and only candidate middle tokens
  are absent from the current name;
- `middle-initial`: a middle initial agrees with the candidate's full middle
  token;
- `orthographic-variant`: names differ only by accents, apostrophes, Unicode
  dash types, hyphen/space presentation, or case;
- `fuzzy-only`: same first and surname boundary but an unsupported token
  difference remains;
- `incompatible`: first or surname identity conflicts.

Candidate discovery may expose fuzzy-only relationships, but only deterministic
relationships can support a recommendation. Nicknames and edit distance never
produce automatic approval.

### Evidence evaluator

`src/data/short-name-recommendations.ts` consumes
`InstructorAuditEntry[]`. It filters to `needs-evidence`, requires exactly
one candidate, evaluates the best relationship across the candidate display
name and aliases, and compares current and historical subject codes.

Classification rules:

- `recommended`
  - exact reordered full name; or
  - middle omitted, middle initial, or orthographic variant with at least one
    shared subject.
- `review`
  - fuzzy-only candidate;
  - compatible shortened form without subject overlap;
  - a reviewed holdout;
  - more than one candidate.
- `rejected`
  - incompatible first/surname identity;
  - zero candidates inside a malformed needs-evidence entry.

Every result records the relationship, shared subjects, supporting evidence,
conflicting evidence, candidate identity, and recommendation reason. Results
are sorted by current name and candidate ID.

### CLI and reports

`scripts/recommend-name-matches.mjs` bundles the TypeScript evaluator with
esbuild, validates the audit-report schema, runs the evaluator, renders stable
JSON and Markdown, and writes reports only after the complete input has been
validated and both output payloads have been produced.

The CLI refuses output paths that resolve to:

- its input audit report;
- `src/data/easy-a-dataset.generated.json`;
- `src/data/reviewed-corrections.ts`.

It makes no network requests and does not mutate input data.

## Safety boundaries

- Precision is more important than recall.
- A unique candidate is necessary but not sufficient.
- Surname changes require an existing reviewed alias and are never inferred.
- Nicknames are never inferred.
- First-initial-only names are never recommended.
- Department/subject conflicts prevent recommendation.
- Reviewed holdouts override otherwise compatible evidence.
- No professor record or historical row is created, removed, or reassigned.
- Runtime `lookupProfessor()` remains strict and unchanged.
- The same input produces byte-identical reports.

## Testing

Unit tests cover:

- comma-order reversal;
- middle-name omission;
- middle initials;
- accents, apostrophes, and Unicode dashes;
- compound and hyphenated surnames;
- incompatible first or surname tokens;
- Justin Opatkiewicz as recommended;
- Keiko Nomura as recommended;
- Elizabeth Miller, Mark Young, and Natalye Harpin/Pass as review;
- Kenji Nomura never matching Keiko Nomura.

CLI tests cover:

- valid JSON and Markdown output;
- malformed input leaving no outputs;
- protected-path rejection;
- deterministic repeated output;
- result counts exactly matching the input `needs-evidence` count.

The full project test, typecheck, build, audit reproducibility, and
`git diff --check` remain completion gates.

## Update workflow

```text
import new Easy-A snapshot
→ validate dataset
→ regenerate instructor audit
→ generate short-name recommendations
→ review only new or changed recommendations
→ explicitly promote approved aliases
→ run full tests and build
```

Automatic promotion of recommendations, web research, and ambiguous-name
resolution are intentionally deferred until the report-first results have been
reviewed for precision.
