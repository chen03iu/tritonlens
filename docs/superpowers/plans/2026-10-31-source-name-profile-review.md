# Source-name profile review

Continue the user's authorized external-evidence review of the 101 held roster
profiles, grouped into 87 source-name buckets. Confirmed same-person profiles
retain independent observations. Distinct people keep their own histories and
ratings. No generic nickname/department fuzzy matching or new collection.

1. Review dated roster names/departments and live primary UCSD/RMP evidence.
   Record profile-scoped decisions and evidence in a separate static manifest.
   Retain cases without sufficient corroboration in a readable decision list.
2. Extend the reviewed selector narrowly for explicit currently unlinked owners,
   verified new roster-only identities, and known empty internal duplicates.
   Only retire explicitly named IDs that have no histories. Preserve aliases,
   donor observations, direct redirects and all source terms. Separately attach
   verified distinct-person profiles without adding colliding short aliases.
   Write failing regression tests before implementation.
3. Import the existing real files, verify retained histories/names/source terms,
   independent metrics and repeat-import bytes, then run the full suite with
   two workers, typecheck and build. Obtain one fresh read-only final review.
   Update status and evidence/remaining-decision docs and commit locally.

Review focus: fail closed on changed IDs/names/departments/courses, missing or
stale evidence, unexpected stub metrics/histories, multiple owners, or any new
alias collision. No grade-owner transfers or pooled RMP metrics. User-facing
manual counts must distinguish unresolved rated profiles from empty profiles.
Main checkout, ignored instructions/caches/audits and release state stay intact.
