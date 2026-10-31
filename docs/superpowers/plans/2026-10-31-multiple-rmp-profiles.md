# Multiple reviewed RMP profiles

User-approved behavior: keep a primary professor score, and reveal other
confirmed profiles under an English `Other RMP profiles` disclosure. Each
profile retains its own metrics, school, department, date, and numeric profile
link. Unrated profiles say `No ratings reported`. Never pool scores or counts.
Reuse the isolated preview checkout and execute inline; no collection, new
dependencies, generic fuzzy matching, merge, push, or release.

## Task 1 — Preserve and validate independent observations

Add an optional `rmpProfiles` array to `ProfessorRecord`, including the primary
and reviewed alternates. Each observation stores its profile ID, source name,
school, department, source reference, observation date, and nullable rating.
Require unique numeric IDs, valid dates/metrics/provenance, no second identity
owner, and agreement between the selected profile and existing primary fields.
Keep schema 1 backward compatible when the array is absent.

Extend the reviewed selector to retain observations for the ten approved pairs.
Keep the four unrelated old profiles separate. Retain Aaron's explicitly
reviewed Extended Studies source/date. Preserve newer prior observations when
inputs are older or missing; refresh an existing primary observation alongside
its rating during normal imports. Observe failing regressions before code.

Expected: focused selection/transform/validation tests and typecheck pass.

## Task 2 — Deliver and display profiles

Add optional sourced profiles to the rating provider result, available even
when a profile has no rating. The provider maps each observation to its own
source. Keep ambiguous identities and link-only mode free of profile metrics.
Refactor rating metric rendering for reuse; show primary identity/school when
multiple profiles exist and native details/summary for other profiles. Keep
each URL numeric and HTTPS, text escaped through DOM APIs, and disclose that
ratings are independent. Reposition on disclosure toggle; retain outside-click
and Escape dismissal. Scope styles to the card and preserve narrow scrolling.

Expected: DOM tests cover collapsed/expanded profiles, distinct scores/counts,
unrated alternates, own source dates/links, single-profile compatibility, and
dismissal. Provider tests cover independent sources and unresolved identities.

## Task 3 — Import, verify, review, and save locally

Regenerate using the existing dated source files. Compare all primary metrics,
identity IDs, names/aliases, redirects, and the complete historical grade array
against the starting commit 6281e2d. Expect ten profile groups, twenty independent
observations, unchanged 101 held profiles and 30,146 grade terms. Repeat import
must produce identical bytes, including after a selected primary refresh.
Run the full suite, typecheck, and default build; inspect a rendered local card
if an isolated browser is available. Obtain one fresh read-only whole-change
review, address findings, update source/status docs and the ignored execution
ledger, and commit only the intended files locally.

## Review focus

Check freshness by individual profile, missing alternates, source/date retention
for Aaron, unrated profiles, primary consistency, cross-identity ownership,
production permission validation, safe independent URLs, native disclosure and
card dismissal. Generic same-name suggestions remain unconfirmed and unexposed.
