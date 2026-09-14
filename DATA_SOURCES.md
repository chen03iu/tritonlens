# TritonLens Data Sources

Last reviewed: 2026-09-14

TritonLens local development builds bundle a normalized snapshot from Easy-A
Radar. The snapshot is marked `development`, and the UI labels it as not for
release. Fictional fixtures remain available only for automated tests.

This document is an engineering risk record, not legal advice. A publicly
accessible page is not automatically approved for copying, caching, or
redistribution.

No source may be added to the published extension until its ownership,
license, access policy, redistribution rights, caching rules, update process,
and attribution requirements have been reviewed.

| Source | Potential data or use | Access method | License or permission status | Redistribution status | Planned strategy | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TritonLens fictional demo dataset | Development-only rating and historical-grade-shaped records | Bundled TypeScript object | Original fictional test fixture | May ship only while unmistakably labeled as demo data | Replace with approved sources after policy review | Values do not describe the named instructors or real UCSD outcomes |
| UCSD Triton Student System (TSS) | Current course, section, term, and instructor | Passively observe information already delivered to the authenticated user's browser | UCSD-controlled system; use must remain limited to the user's session and applicable policy | Do not redistribute session payloads | Extract only the minimum current-course context locally | Never capture credentials, cookies, tokens, personal grades, or enrollment history |
| [TritonPlan](https://github.com/hfjddjksaj/tritonplan) | TSS integration and parser architecture research | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study architecture; attribute any code later adapted | No TritonPlan code is currently included |
| [UCSD Easy-A Radar](https://github.com/Edwardwang66/ucsd-easy-a-radar) | Professor aliases, RMP snapshot metrics, and aggregate historical grade distributions | Author's public static `data.json`, transformed locally by `scripts/import-easy-a.mjs` | No public license found; the user reports that the author directly granted TritonLens unrestricted noncommercial use with no additional conditions | Approved for local noncommercial development; public redistribution remains pending upstream review | Bundle as an explicitly labeled development snapshot; do not promote to production automatically | Snapshot generated 2026-07-23; 4,864 professor identity records and 11,159 historical course × professor records after normalization |
| [Sahir Sharma WebReg](https://github.com/SahirSSharma/WebReg) | TSS OData research, tools, and course data | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study research; attribute any code or data later adapted | No WebReg code or data is currently included |
| [RateMyProfessors](https://www.ratemyprofessors.com/terms-of-use) | Professor rating, difficulty, rating count, and possibly would-take-again | No approved access method | Official Terms limit use to personal noncommercial use, prohibit third-party reproduction or distribution without prior written consent, and prohibit automated scraping without prior permission | Not approved | Request written permission from RMP; otherwise provide source links without bundling RMP data | Permission from an intermediary does not necessarily override RMP terms |
| [UCSD A.S. Instructor Grade Archive](https://dev-as.ucsd.edu/Home/InstructorGradeArchive) | Public aggregate course × instructor grade distributions | Public search page; no approved bulk access method | Page is © Regents; UCSD Website Terms prohibit copying or redistribution without explicit permission beyond limited personal use | Not approved pending written permission | Ask A.S. and UCSD for permission to transform and redistribute aggregate records in a free extension | Historical results must never be presented as predictions |
| [UCSD Campus Grades](https://blink.ucsd.edu/instructors/student-reporting/enroll-grades/grades.html) | Internal student-, section-, and instructor-level grading reports | Restricted Business Analytics Hub access requiring training and authorization | Restricted institutional data containing student-level fields | Prohibited source for TritonLens | Do not access, request, collect, or use | This is not the public A.S. aggregate archive |
| [UCSD CAPE statistics](https://cape.ucsd.edu/scripts/stats.asp) and SET-related data | Historical public numerical teaching feedback and possible aggregate grade metrics | Public CAPE search page; SET availability varies | UCSD-controlled content; general UCSD redistribution terms require explicit permission | Not approved pending written permission | Evaluate only after core rating and grade sources are resolved | Keep teaching-feedback metrics distinct from grades and RMP ratings |

## Current Decision

- Do not scrape RateMyProfessors or bundle its data without direct written
  permission from RMP.
- Do not bulk copy or redistribute A.S. Instructor Grade Archive data without
  direct written permission from UCSD or the responsible A.S. unit.
- Do not use Campus Grades or any report containing student-level information.
- Easy-A Radar is used for TritonLens's local noncommercial development under
  the author's direct permission as reported by the user. Each upstream field
  retains provenance and remains subject to its source restrictions.
- Keep the imported snapshot classified as `development`; do not publish it as
  a production dataset until upstream redistribution questions are resolved.
- Treat Easy-A's `n` field as course-offering count, not student sample size.
- Treat RMP rows with zero rating count and `-1` percentage sentinels as
  unavailable rather than displaying misleading zero values.

Ready-to-send requests are maintained in
`SOURCE_PERMISSION_REQUESTS.md`.

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
