# TritonLens Attribution

This file records external code, data, libraries, and architectural influences
used by TritonLens. It must be updated whenever a new dependency or source is
introduced.

## Current Project Code

The current TritonLens prototype does not contain copied or adapted source
code from TritonPlan, UCSD Easy-A Radar, or Sahir Sharma WebReg. TritonLens
does contain a transformed Easy-A Radar data snapshot for local development.

Their public projects informed research and architectural discussion:

- [TritonPlan](https://github.com/hfjddjksaj/tritonplan): privacy-oriented TSS
  integration and passive observation concepts.
- [UCSD Easy-A Radar](https://github.com/Edwardwang66/ucsd-easy-a-radar): data
  schema and professor-matching research. A snapshot generated 2026-07-23 is
  transformed into `src/data/easy-a-dataset.generated.json` by TritonLens's
  own importer. On 2026-09-14, the user reported that the author directly
  granted TritonLens unrestricted noncommercial use with no additional
  conditions. This private permission is not a public repository license, and
  upstream source restrictions still require separate review before release.
- [Sahir Sharma WebReg](https://github.com/SahirSSharma/WebReg): TSS OData and
  course-data research.

Researching an idea is not the same as incorporating external code. If code is
later copied or adapted, add its copyright notice, license, source URL, and a
description of the modified files here before release.

## Development Dependencies

TritonLens currently uses these npm development dependencies:

- `@types/chrome`
- `esbuild`
- `jsdom`
- `typescript`
- `vitest`

These packages remain under their respective licenses. Exact installed
versions and transitive dependencies are recorded in `package-lock.json`.

## Data Attribution

Local development builds bundle normalized professor rating fields and
aggregate historical course × professor grade fields from Easy-A Radar. The
snapshot includes professor aliases, RMP profile identifiers and metrics,
average GPA, offering count, and grade-distribution percentages. TritonLens
does not infer unavailable student sample sizes. The UI labels this data as a
development snapshot that is not for release.

Every value displayed with a `demo` label remains an original fictional test
fixture and does not describe a named instructor or real UCSD outcome.

Future datasets must be documented in both this file and
`DATA_SOURCES.md`, including:

- owner and source URL;
- license or written permission;
- fields used;
- snapshot or update date;
- redistribution and caching conditions;
- required notices and source links;
- any transformations performed by TritonLens.

## Project License

Explicit name corrections are based on the instructors' UCSD webpages,
documented in `REVIEWED_IDENTITIES.md`. Aaron's separately reviewed personal
development rating observation comes directly from RMP profile 3050657, not
Easy-A Radar. It remains pending redistribution review and is not approved
release data. No student review text is included.

The batch audit uses Easy-A Radar's public `fa` snapshot as development input.
Its source-profile/name links provide the evidence for conservative duplicate
consolidation; this is not new independent RMP verification. TritonLens's own
audit/consolidation code retains all historical rows and source metadata.
See `INSTRUCTOR_MATCH_REVIEW.md` for safeguards and unresolved cases.

No license has been selected for TritonLens yet. Adding a project license is a
release-phase decision and does not change the licenses of third-party
dependencies or future datasets.
