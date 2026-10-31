# TritonLens Data Sources

Last reviewed: 2026-10-31

The default TritonLens build bundles a normalized direct-source snapshot and
shows professor ratings and historical grade metrics locally. Its detail card
is marked `Data snapshot — source permissions pending`. It makes no automatic
request to RMP, UCSD, or Easy-A Radar. `npm run build:link-only` produces a
fallback package without the snapshot; external sites are contacted only if
the user clicks a source link.

The user reports direct permission from the Easy-A Radar author for
noncommercial use. Direct RMP and UCSD permission remains unresolved, so this
repository does not describe the upstream data as approved. Fictional
fixtures remain available only for automated tests.

This document is an engineering risk record, not legal advice. A publicly
accessible page is not automatically approved for copying, caching, or
redistribution.

Before a source is added, its ownership, license, access policy,
redistribution rights, caching rules, update process, and attribution
requirements should be reviewed and recorded here.

| Source | Potential data or use | Access method | License or permission status | Redistribution status | Planned strategy | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TritonLens fictional demo dataset | Development-only rating and historical-grade-shaped records | Bundled TypeScript object | Original fictional test fixture | May ship only while unmistakably labeled as demo data | Replace with approved sources after policy review | Values do not describe the named instructors or real UCSD outcomes |
| UCSD Triton Student System (TSS) | Current course, section, term, and instructor | Passively observe information already delivered to the authenticated user's browser | UCSD-controlled system; use must remain limited to the user's session and applicable policy | Do not redistribute session payloads | Extract only the minimum current-course context locally | Never capture credentials, cookies, tokens, personal grades, or enrollment history |
| [TritonPlan](https://github.com/hfjddjksaj/tritonplan) | TSS integration and parser architecture research | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study architecture; attribute any code later adapted | No TritonPlan code is currently included |
| [UCSD Easy-A Radar](https://github.com/Edwardwang66/ucsd-easy-a-radar) | Professor aliases, RMP snapshot metrics, and aggregate historical grade distributions | Author's public static `data.json`, transformed locally by `scripts/import-easy-a.mjs` | No public license found; the user reports that the author directly granted TritonLens unrestricted noncommercial use with no additional conditions | Easy-A author permission reported; upstream RMP/UCSD public redistribution remains unresolved | Bundle in the default build with an explicit pending-permission label; retain a link-only fallback | Snapshot generated 2026-07-23; 4,864 professor identity records and 11,159 historical course × professor records after normalization |
| [Sahir Sharma WebReg](https://github.com/SahirSSharma/WebReg) | TSS OData research, tools, and course data | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study research; attribute any code or data later adapted | No WebReg code or data is currently included |
| [RateMyProfessors](https://www.ratemyprofessors.com/terms-of-use) | Professor rating, difficulty, rating count, would-take-again | Aggregate roster collected separately in the private pipeline; offline JSON import here | Official terms restrict automated collection and redistribution; written permission unresolved | Pending; not described as approved | Developer-run dated imports; no requests from the extension | 4,039 main-campus profiles retrieved 2026-10-29; unreviewed conflicting IDs and ambiguous identities remain held |
| [UCSD A.S. Instructor Grade Archive](https://qa-as.ucsd.edu/Home/InstructorGradeArchive) | Aggregate course × instructor × term GPA and grade distributions | User-initiated export from an existing authorized QA browser session; offline JSON import here | Access to a session is not redistribution permission; written permission unresolved | Pending; not described as approved | Retain actual term values and provenance; ask A.S. about missing terms and unexplained shares | 30,146 rows through Spring 2026; 2018/2019 and other terms absent; QA provenance and full coverage unconfirmed |
| [UCSD Campus Grades](https://blink.ucsd.edu/instructors/student-reporting/enroll-grades/grades.html) | Internal student-, section-, and instructor-level grading reports | Restricted Business Analytics Hub access requiring training and authorization | Restricted institutional data containing student-level fields | Prohibited source for TritonLens | Do not access, request, collect, or use | This is not the public A.S. aggregate archive |
| [UCSD CAPE statistics](https://cape.ucsd.edu/scripts/stats.asp) and SET-related data | Historical public numerical teaching feedback and possible aggregate grade metrics | Public CAPE search page; SET availability varies | UCSD-controlled content; general UCSD redistribution terms require explicit permission | Not approved pending written permission | Evaluate only after core rating and grade sources are resolved | Keep teaching-feedback metrics distinct from grades and RMP ratings |

## Current Decision

- `npm run build` includes the locally queried metric snapshot because ratings
  and historical grades are core product behavior. The UI and source records
  explicitly state that upstream permissions remain pending.
- Keep `npm run build:link-only` as the no-snapshot fallback.
- Source collection is isolated in the private pipeline. The public repository
  contains an offline importer, not network collection or authentication code.
  The user has authorized local integration while accepting the unresolved
  source-policy risk; no new source permission is asserted.
- Direct RMP and UCSD/A.S. redistribution permission remains unresolved. Do
  not describe the bundled snapshot as approved by those upstream sources.
- Do not use Campus Grades or any report containing student-level information.
- Easy-A Radar is used in TritonLens's default noncommercial snapshot under
  the author's direct permission as reported by the user. Each upstream field
  retains provenance and remains subject to its source restrictions.
- Keep the imported snapshot classified as `development`; the public build's
  `pending-permission-snapshot` mode does not imply production approval.
- Keep default and link-only entry points separate. Automated packaging tests
  verify that the fallback contains no generated snapshot records.
- Treat Easy-A's `n` field as course-offering count, not student sample size.
- Treat RMP rows with zero rating count and `-1` percentage sentinels as
  unavailable rather than displaying misleading zero values.
- Preserve the corrected Easy-A identities before the first refresh. Subsequent
  imports start from the current validated direct snapshot and preserve newer
  metrics and previously collected terms. The direct runtime file does not
  replay snapshot-specific metric fingerprints.
- Do not average term percentages without student counts. Direct-source records
  carry all observed terms and use the latest term as the initial display.
- Treat all-zero distributions and zero GPA without letter-grade shares as
  unavailable; retain genuine zero GPA when letter-grade evidence exists.
- Retain reported percentages even when they total below 99%. The remainder is
  not identified as a specific grade or rescaled away. No student counts exist.
- Reconcile compatible internal duplicates before direct-source refresh, with
  explicit retired-ID redirects and local audit history. A reused profile ID
  alone does not establish that unrelated names identify one person.
- Withhold incompatible shared legacy links instead of transferring their
  metrics into a same-name history. Preserve possible nicknames/spelling changes
  for review; stale roster evidence cannot revoke newer observations.
- Reviewed, profile-scoped name variants have primary-source corroboration, including:
  [James/Jim Kadonaga](https://biology.ucsd.edu/research/faculty/jkadonaga.html),
  [Nadezhda/Nadia Polikarpova](https://jacobsschool.ucsd.edu/people/profile/nadezhda-polikarpova),
  and [Alexander Niema/Niema Moshiri](https://niema.net/).
  No generic nickname dictionary is used to accept other identities.
- The [2026-10-30 primary-source review](docs/primary-source-identity-review-2026-10-30.md)
  documents 19 additional profile corrections, their corroborating pages, and
  limits. Reviewed names persist as aliases across later data imports.
- The [profile ownership follow-up](docs/primary-source-profile-ownership-2026-10-30.md)
  resolves the final 12 shared-profile groups. Four name groups are reconciled;
  eight incorrect links are excluded only with reviewed source-name/department
  and retained-owner/course evidence. Stale or missing evidence cannot trigger
  these exclusions. Separate instructors retain separate grade histories.
- The [distinct-profile review](docs/reviewed-profile-selection-2026-10-30.md)
  corrects four links to other instructors and resolves ten reviewed alternate
  profile pairs. One complete aggregate is selected by reported rating count,
  with current-profile ties retained; no ratings or counts are pooled. Expected
  source IDs, names, departments, owner course, and freshness gate selection.
  Alternate IDs remain in the import audit. Aaron's older Extended Studies
  observation retains its existing source and date over an unrated main-campus
  alternate. The remaining 101 held profiles need source-name disambiguation.
- The [multiple-profile card](docs/multiple-rmp-profiles-2026-10-31.md) now retains
  the primary and reviewed alternate observations in the runtime snapshot.
  All twenty observations have independent school, department, source/date,
  and nullable rating fields. Ten primary choices remain unchanged. Older or
  missing inputs do not refresh prior observation dates or erase alternates.
  Unrated profiles show no invented zero score. Production approval checks
  apply to every displayed profile, including unrated observations.
- The [source-name evidence review](docs/source-name-profile-review-2026-10-31.md)
  adds 76 scoped same-person groups and independently assigns the writing and
  engineering profiles of two same-name pairs. It never joins the two different
  instructors' histories. Four explicit grade-free duplicate records retire
  with direct redirects, retaining all names and observed ratings. Nine incoming
  profiles remain held; two have ratings and seven are empty. Source permission
  status, source dates, and partial grade coverage remain unchanged.

Ready-to-send requests are maintained in
`SOURCE_PERMISSION_REQUESTS.md`.

## Reviewed Corrections

`src/data/reviewed-corrections.ts` adds explicitly verified Miles Jones and
Aaron Shalev/Schulman name aliases after loading the generated snapshot.
Evidence and exact reviewed IDs are documented in `REVIEWED_IDENTITIES.md`.
No generic fuzzy or middle-name-dropping match was introduced.

Aaron's missing rating is filled from profile 3050657's reported aggregate
fields observed on 2026-09-15, not from Easy-A Radar. Its source remains
`pending`, identifies the profile's UC San Diego Extended Studies school
label, and notes an inconsistent review count. The visible review list did
not agree with the reported summary. No review text is bundled and no score
is recomputed. This correction is included in the default pending-permission
snapshot but remains unapproved for upstream redistribution;
`production-snapshot` validation rejects its pending source. Existing Easy-A
historical data remains available in the migration baseline; the direct runtime
now uses individual source terms with the reviewed identity preserved.

The Extended Studies observation is retained with its original date when absent
from the main-campus roster. A missing roster entry does not authorize assigning
a different profile with the same name.

## Required Review for Each Added Source

Before adding source data, document:

1. The source owner and canonical URL.
2. The exact fields used by TritonLens.
3. The access method and update frequency.
4. The applicable license and terms or written permission.
5. Whether redistribution and caching are allowed.
6. Required attribution and source links.
7. The snapshot date and data-quality limitations.
8. The deletion or replacement process if permission changes.
