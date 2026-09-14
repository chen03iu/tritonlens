# TritonLens Attribution

This file records external code, data, libraries, and architectural influences
used by TritonLens. It must be updated whenever a new dependency or source is
introduced.

## Current Project Code

The current TritonLens prototype does not contain copied or adapted source
code from TritonPlan, UCSD Easy-A Radar, or Sahir Sharma WebReg.

Their public projects informed research and architectural discussion:

- [TritonPlan](https://github.com/hfjddjksaj/tritonplan): privacy-oriented TSS
  integration and passive observation concepts.
- [UCSD Easy-A Radar](https://github.com/Edwardwang66/ucsd-easy-a-radar): data
  schema and professor-matching research only. No code or data is currently
  included. On 2026-09-14, the user reported that the author directly granted
  TritonLens unrestricted noncommercial use with no additional conditions.
  This private permission is not a public repository license, and upstream
  source restrictions still require separate review.
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

No real external rating or grade dataset is currently bundled. The local
records and every value displayed with a `demo` label are original fictional
test fixtures; they do not describe the named instructors or real UCSD grade
outcomes.

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

No license has been selected for TritonLens yet. Adding a project license is a
release-phase decision and does not change the licenses of third-party
dependencies or future datasets.
