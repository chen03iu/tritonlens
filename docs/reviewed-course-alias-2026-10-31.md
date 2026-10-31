# Reviewed ANTH87 short-name lookup

The user screenshot showed `David Jordan` in ANTH-087 with both metrics
unavailable. Reproduction with the current direct snapshot returned identity
`not-found`. Its retained record was `Jordan, David K.` with only the alias
`David K. Jordan`; the provider previously received no course context.

The 2026-10-29 snapshot already contains RMP32591, 4.0/5 from 136 reported
ratings, and seven ANTH87 terms. The separate Writing2404677 profile remains
held by the user's explicit keep-separate decision. Neither profile is merged
and no global `David Jordan` alias is added to the dataset.

Primary evidence: the [UCSD Anthropology teaching directory](https://anthropology.ucsd.edu/people/visiting/index.html)
lists David Jordan, dkjordan@ucsd.edu, and ANTH87. The
[RMP Anthropology profile](https://www.ratemyprofessors.com/professor/32591)
uses David Jordan and has ANTH87 reviews. This corroborates the specific
course-scoped name, not a generic first/last-name rule.

`InstructorIdentityProvider.lookup` accepts an optional course key. The local
adapter applies one reviewed registry entry only for normalized David Jordan /
ANTH87. It requires the exact retained ID, expected canonical name, unique
ownership of the reviewed Anthropology profile, and one owned ANTH87 history.
Existing ambiguous names remain ambiguous; contradictory ordinary name matches
are not overridden. Missing or changed evidence withholds metrics. Other
courses, Writing, and calls without course context retain ordinary lookup.
Generic import matching and all snapshot bytes remain unchanged.

The seven recorded terms have null GPA and P/NP/withdrawal percentages. The card
therefore correctly shows GPA unavailable while exposing the actual distribution
and historical-term selector. No average GPA is fabricated.

Regressions cover the exact screenshot, normalized/padded course identifiers,
unreviewed courses/names, no-context lookup, changed retained identity/profile,
missing/duplicate histories, duplicate profile owners, conflicting ordinary
identities, and DOM rating/history/source links. Expected metrics come from the
retained source observations so legitimate later refreshes do not require
rewriting numeric assertions. An isolated Chrome preview confirmed the badge,
Anthropology-only profile link, and seven term options. A fresh read-only code
review found no actionable issue; external evidence and final checks were
verified by the parent session.

Verification: 472 tests across 38 files, typecheck and default build pass. The
generated dataset is byte-identical with SHA-256
`75bd32ce46b48f978793dda3beb5031e9c240a56ad1684cdad311dd5745655e6`;
the held Writing profile is unchanged. No merge, push or release was performed.
