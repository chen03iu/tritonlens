# Multiple reviewed RMP profiles

The user approved showing confirmed same-person profiles together while keeping
their ratings separate. A compact primary rating remains at the top of the card.
`Other RMP profiles (1)` expands to show the alternate's own name, school,
department, rating, difficulty, review count, would-take-again percentage,
source date, and profile link. A short explanation states that metrics are not
combined. Unrated observations display `No ratings reported` with a source link
and date. Single-profile cards retain their existing presentation.

## Data behavior

`ProfessorRecord.rmpProfiles` is optional under schema 1. It stores independent
observations for the ten pairs already reviewed in
[the distinct-profile audit](reviewed-profile-selection-2026-10-30.md), including
the primary profile. Existing datasets without the field remain compatible.
This does not add a generic same-name or nickname matching rule.

Each observation has its own numeric source profile ID, display name, school,
nullable department, source ID, date, and nullable rating. The selected profile
must agree with the original primary fields; no profile may belong to another
local identity. Validation checks all metrics and dates, rating/source agreement,
duplicate IDs, and production source approval, including unrated observations.
The data service also filters unapproved profiles in production mode.

Freshness is per profile. A missing or older input preserves an already reviewed
observation with its own date, rather than deleting it or claiming a new download.
A later independently updated alternate can become primary by reported count;
all metrics move together. Initial review still requires the scoped identity,
IDs, source names/departments, course and freshness checks. Changed name or
department evidence cannot establish a new link. Counts are never added and
ratings/difficulty are never averaged.

Aaron's earlier Extended Studies observation remains dated 2026-09-15 under
`reviewed-aaron-rmp`; the unrated main-campus observation is dated 2026-10-29.
The older observation's reported-count limitation remains in its source label.
Source permissions and partial grade archive coverage remain unchanged.

## Interface and verification

Native `details`/`summary` supports pointer and keyboard disclosure. Toggle
repositions the card; the existing scroll limits, outside-click dismissal and
Escape behavior remain. Profile names and school labels use text nodes, and
profile links require numeric IDs, HTTPS and `noopener noreferrer`.

The real import adds ten groups with twenty observations, two unrated. All
previous primary fields, source metadata, 5,677 identities, 55 redirects,
11,120 grade histories and 30,146 source terms are exactly preserved. The held
queue remains 101 source-name profiles. Repeating the real import produces
identical bytes with SHA-256
`28f0b324a4cfa9c2442b7e549b0f585a043cbf7d8376108de6e4ae7b4746e7a4`.

Automated regressions cover independent provenance, unsafe/duplicate IDs,
invalid metrics/dates, ownership, primary consistency, source approval, missing
and older imports, primary refresh/reselection, Aaron's retained source/date,
unrated observations, ambiguity, disclosure, source links, and dismissal.
An isolated Chrome profile rendered the actual Ching Wei Ho card collapsed and
expanded. An exact 360×760 viewport check confirms contained scrolling and no
horizontal overflow. This is local component verification, not a live TSS or
release certification. A fresh read-only code review found no actionable issues.

Final verification: `npm.cmd test -- --maxWorkers=2` passes all 385 tests across
36 files; typecheck and default build pass. Default parallel runs exceeded the
existing five-second limit in different multi-process CLI integration cases.
Those cases passed together in a focused run, and the full suite passed with
two workers. No timeout or global test configuration was changed.

No merge, push, release or new collection was performed.
