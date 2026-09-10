# TritonLens Data Sources

TritonLens currently bundles no real ratings or historical grade data. The
mock `★ 4.5 demo` value is fictional and exists only to test the extension UI.

No source may be added to the published extension until its ownership,
license, access policy, redistribution rights, caching rules, update process,
and attribution requirements have been reviewed.

| Source | Potential data or use | Access method | License or permission status | Redistribution status | Planned strategy | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| UCSD Triton Student System (TSS) | Current course, section, term, and instructor | Passively observe information already delivered to the authenticated user's browser | UCSD-controlled system; use must remain limited to the user's session and applicable policy | Do not redistribute session payloads | Extract only the minimum current-course context locally | Never capture credentials, cookies, tokens, personal grades, or enrollment history |
| [TritonPlan](https://github.com/hfjddjksaj/tritonplan) | TSS integration and parser architecture research | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study architecture; attribute any code later adapted | No TritonPlan code is currently included |
| [UCSD Easy-A Radar](https://github.com/Edwardwang66/ucsd-easy-a-radar) | Professor matching, ratings, and historical grade schema research | Public GitHub repository | No explicit open-source license was found at the time reviewed | Not approved | Do not copy or bundle code/data without permission or a suitable license | Contact the author after the independent TSS prototype is established |
| [Sahir Sharma WebReg](https://github.com/SahirSSharma/WebReg) | TSS OData research, tools, and course data | Public GitHub repository | MIT at the time reviewed | MIT terms permit reuse with required notices | Study research; attribute any code or data later adapted | No WebReg code or data is currently included |
| RateMyProfessors | Professor rating, difficulty, rating count, and possibly would-take-again | Undecided | Terms, access method, and permission require review | Not approved | Prefer a permitted static snapshot or authorized upstream provider | Do not scrape on every page view |
| UCSD A.S. Instructor Grade Archive | Historical course × instructor grade distributions | Undecided | Policy, ownership, and redistribution rights require review | Not approved | Prefer a documented, periodically generated static dataset if permitted | Historical results must not be presented as predictions |
| UCSD SET/CAPE-related data | Historical teaching feedback | Undecided | Availability and reuse rights require review | Not approved | Evaluate only after the core data sources are resolved | Keep survey metrics distinct from grades and RMP ratings |

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
