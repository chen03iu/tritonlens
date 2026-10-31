# Runtime lookup audit

The previous offline instructor audit uses the Easy-A dataset and name-only
lookup. It does not test the currently bundled direct snapshot, course-scoped
aliases, rating availability or course-specific grade availability.

Implement a separate offline audit using the actual local provider and insight
service. Reuse the saved instructor roster with its original provenance, check
each distinct name/course pair, and report identity, rating and history results
separately. Do not infer new identities, change source metrics, collect session
data or modify the held-profile decisions. The saved roster is a July snapshot,
not a current live TSS capture.

1. Add failing tests for known, missing and ambiguous identities, independent
   metric availability, normalization, course scope and rejected input.
2. Add the reusable audit and CLI with input/dataset provenance and protected
   output paths. Keep the legacy audit available.
3. Run against all 1,995 saved names / 4,543 name-course pairs. Record actual
   findings and distinguish possible identity work from missing source records.
   The first run found three existing declared aliases blocked by duplicate
   records (17 pairs). Corroborate the aliases against UCSD/RMP and retire only
   their exact reviewed history-free IDs through the existing guarded import
   preparation, preserving ratings, histories and redirects.
4. Run focused tests, full tests, typecheck and build; request a fresh review.
5. Update project status and make a local commit. Do not push or release.

Implementation and verification complete: 491 tests / 41 files, typecheck and
default build pass. All 17 duplicate-blocked pairs recover; all earlier names,
primary/alternate ratings, histories and source metadata survive. An exact
before-state guard addresses the reviewer's rated-donor edge case. See
`docs/runtime-lookup-audit-2026-10-31.md` for counts, primary evidence and limits.
