# Runtime lookup audit and reviewed duplicate cleanup

The legacy `audit:instructors` tool checks the corrected Easy-A dataset with
name-only lookup. A matched legacy result does not test the currently bundled
direct snapshot or course-scoped aliases, and it does not imply that either
metric is available. The new `audit:runtime` tool instead uses the actual local
providers and insight service in `pending-permission-snapshot` mode.

## Scope and provenance

The saved `reports/instructor-audit.json` contains 1,995 names and 4,543 distinct
name/course pairs from the 2026-07-23 Easy-A `fa` snapshot. These are not live
TSS captures or confirmed current failures. Original snapshot SHA-256:
`b746016b93791acaaea1554e1a7ae3f75e7fbc6f64cd6bc53d6d9ae470b6266f`.

The report records roster provenance, input-report SHA-256, bundled dataset
SHA-256, source dates/permission states and separate identity/rating/history
statuses for every pair. A found grade record can still have unavailable GPA
or percentages. The tool performs no network requests, accepts no new identity
decisions and writes only its diagnostic JSON. It refuses protected inputs,
junction aliases and unrelated existing JSON; malformed input yields concise
errors without printing the bundled data URL. Repeated runs against unchanged
inputs produce identical reports.

## Three reviewed runtime collisions

The initial run found 17 ambiguous pairs across three names. Each retained
history owner already declares the exact alias, but old duplicate records also
match it. Broad fuzzy matching is not involved.

| Name | Retained owner | Retired exact IDs | Corroboration |
| --- | --- | --- | --- |
| Ahmed-Waeil Elgamal | `easy-a-elgamal-ahmed-91acae5cb9` | `easy-a-ahmed-waeil-elgamal-d76d2936bc` | [Jacobs faculty profile](https://jacobsschool.ucsd.edu/faculty/profile?id=3) uses Ahmed-Waeil Elgamal and Ahmed Elgamal for the same structural engineering professor. |
| Dhananjay Bambah-Mukku | `easy-a-mukku-dhananjaya-b6b1b85f8c` | `easy-a-dhananjay-bambah-mukku-ac86b94076` | [ERC faculty](https://roosevelt.ucsd.edu/about/faculty.html) lists both Dhananjaya Mukku and Bambah-Mukku, Dhananjay in Psychology; [Psychology faculty](https://psychology.ucsd.edu/people/faculty.html) and [RMP2739870](https://www.ratemyprofessors.com/professor/2739870) corroborate the identity. |
| Leo Porter | `easy-a-porter-leonard-emerson-513019c4be` | `easy-a-leo-porter-c60262726f`, `easy-a-leo-porter-fa90a62a23` | The [UCSD profile at leonard.porter](https://profiles.ucsd.edu/leonard.porter) identifies CSE professor Leo Porter, matching the retained owner's existing explicit alias and [RMP1992362](https://www.ratemyprofessors.com/professor/1992362). Auto-derived publications on the UCSD profile were not used as identity evidence. |

Three retired records are empty. Leo's second retired record has the existing
3.4/5, 45-rating observation; that unchanged observation transfers to the
retained grade owner. Ahmed has no bundled rating, so only his existing SE180
history becomes available. No missing score is invented.

`scripts/reviewed-runtime-duplicates.ts` feeds only these explicit rules into
the existing guarded owner preparation. Exact IDs, canonical and stub names,
owned course, expected source ID and fresh source name/department are checked
as applicable. Retired records must have no histories or alternate profiles.
Alias collisions with unreviewed owners block cleanup. Leo additionally requires
the exact reviewed before-state of an unlinked retained owner; an already-linked
owner blocks retirement, preventing its null rating from discarding the donor.
These rules do not add multi-profile selection groups or relax runtime matching.

## Full roster results

| Name/course-pair result | Before | After |
| --- | ---: | ---: |
| Identity found | 4,035 | 4,052 |
| Identity ambiguous | 17 | 0 |
| Identity not found | 491 | 491 |
| Professor rating found | 2,583 | 2,594 |
| Course-specific history found | 751 | 754 |
| Both metrics found | 649 | 651 |
| Matched identity with neither metric | 1,350 | 1,355 |

All 17 affected pairs now resolve; metric availability still depends on the
specific professor and course. There are 1,680 matched names and 315 unmatched
names in this stored roster. Of the latter, 211 have a previously recorded
candidate with a bundled rating after following current redirects. Those are
candidate leads, not identity proof or confirmed live failures. The next batch
can review these leads automatically against primary evidence; the user does
not need to search all names manually.

The 315 unmatched roster names are a different queue from the nine held incoming
RMP profiles. Holding two same-name source profiles apart is not the same task
as recognizing every TSS short name. Neither queue is silently accepted by this
audit. A matched professor without history for a particular course does not
justify using another course's distribution.

## Preservation

The incremental import uses the current curated snapshot, not an empty output
directory's older Easy-A baseline. An initial fresh-baseline candidate failed
the separate preservation comparison and was not promoted. The correctly seeded
candidate passed before promotion, and repeat import was byte-identical.

- Retained identities: 5,681 to 5,677; direct redirects: 59 to 63.
- Every prior canonical name, alias, primary score and alternate score survives
  under its original or explicitly redirected owner.
- The complete 11,120-entry historical array and all 30,146 terms are unchanged.
- Source metadata, observation dates and permission states are unchanged.
- All nine held source profiles remain held, including the user's keep-separate
  Kevin Cao and David Jordan decisions. No Writing/Anthropology association is made.

Before dataset SHA-256:
`75bd32ce46b48f978793dda3beb5031e9c240a56ad1684cdad311dd5745655e6`.
After dataset SHA-256:
`68ad8c85caf5adc2b67ee798b681926ce7c7fe889f13fc0c7333b728e07f7814`.

The audit is repeatable after later imports. Missing source records and newly
observed names still need their own source refresh/evidence; this report does
not turn uncertain candidates into verified matches or expand archive coverage.

## Verification

Focused tests first reproduced the absent audit/CLI and all three ambiguous
runtime identities. Cleanup fixtures test history, name, ownership and source
contradictions, metric preservation, stable redirects and repeatability. A fresh
review reproduced potential Leo donor loss if the owner was already linked
without a score; the exact before-state guard fixes that regression.

The final full run passes 491 tests across 41 files with two workers. Typecheck,
default build and `git diff --check` pass. The audit rerun confirms all 17 pairs
recover, with the counts above. Fresh code review has no remaining actionable
finding. Work is local; nothing was pushed or released.
