# TritonLens Data Sources

Last reviewed: 2026-10-15

The default TritonLens build bundles a normalized Easy-A Radar snapshot and
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
| [RateMyProfessors](https://www.ratemyprofessors.com/terms-of-use) | Professor rating, difficulty, rating count, and possibly would-take-again | No approved access method | Official Terms limit use to personal noncommercial use, prohibit third-party reproduction or distribution without prior written consent, and prohibit automated scraping without prior permission | Not approved | Request written permission from RMP; otherwise provide source links without bundling RMP data | Permission from an intermediary does not necessarily override RMP terms |
| [UCSD A.S. Instructor Grade Archive](https://dev-as.ucsd.edu/Home/InstructorGradeArchive) | Public aggregate course × instructor grade distributions | Public search page; no approved bulk access method | Page is © Regents; UCSD Website Terms prohibit copying or redistribution without explicit permission beyond limited personal use | Not approved pending written permission | Ask A.S. and UCSD for permission to transform and redistribute aggregate records in a free extension | Historical results must never be presented as predictions |
| [UCSD Campus Grades](https://blink.ucsd.edu/instructors/student-reporting/enroll-grades/grades.html) | Internal student-, section-, and instructor-level grading reports | Restricted Business Analytics Hub access requiring training and authorization | Restricted institutional data containing student-level fields | Prohibited source for TritonLens | Do not access, request, collect, or use | This is not the public A.S. aggregate archive |
| [UCSD CAPE statistics](https://cape.ucsd.edu/scripts/stats.asp) and SET-related data | Historical public numerical teaching feedback and possible aggregate grade metrics | Public CAPE search page; SET availability varies | UCSD-controlled content; general UCSD redistribution terms require explicit permission | Not approved pending written permission | Evaluate only after core rating and grade sources are resolved | Keep teaching-feedback metrics distinct from grades and RMP ratings |

## Current Decision

- `npm run build` includes the locally queried metric snapshot because ratings
  and historical grades are core product behavior. The UI and source records
  explicitly state that upstream permissions remain pending.
- Keep `npm run build:link-only` as the no-snapshot fallback.
- Do not create an automated RMP scraping/update pipeline. A single
  user-requested, dated personal observation of Aaron Schulman's profile is
  included in the default pending-permission snapshot; it is not an approved
  reusable access method or redistribution grant.
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
historical grades stay unchanged.

The record can be removed by deleting its rating correction; there is no
automatic RMP updater. Future observations require another explicit review.

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
