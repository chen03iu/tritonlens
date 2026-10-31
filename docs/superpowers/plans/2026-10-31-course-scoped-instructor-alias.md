# Reviewed course-scoped short name

Bug: TSS shows David Jordan in ANTH-087. The runtime name-only provider returns
not-found although David K. Jordan (RMP32591) and seven ANTH87 terms exist.
The user explicitly kept the separate Writing2404677 profile unassociated.

1. Add failing real-data provider and DOM regressions: ANTH087 short name finds
   the retained anthropology rating/history; WCWP and unreviewed course scopes
   do not. Cover padded catalog numbers/case, changed target IDs/source links,
   duplicate profile owners and contradictory normal-name results.
2. Pass optional course identifiers through identity-provider lookup. Add one
   explicitly reviewed alias registry entry for David Jordan / ANTH87, bound
   to expected retained ID/name/RMP32591 and owned course history. Keep ordinary
   exact/alias matching and ambiguous results conservative; do not infer new
   identities from course overlap, remove middle names generally, or mutate
   imported data. Refuse contradictory identity/source/history evidence.
3. Verify provider/DOM behavior, full suite with two workers, typecheck/build,
   unchanged dataset hash and continued Writing hold. Request one fresh
   read-only review, update status/evidence, and commit locally. Same dist path;
   no new collection, merge, push or release.

Evidence: https://anthropology.ucsd.edu/people/visiting/index.html explicitly
lists David Jordan, dkjordan@ucsd.edu, and ANTH87; RMP32591 identifies Anthropology
and includes ANTH87 reviews. Historical GPA may remain unavailable because the
reported ANTH87 terms are P/NP; do not invent a numeric GPA.
