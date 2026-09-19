# Name Matching Coverage Audit

Date: 2026-09-15. Dataset: Easy-A 2026-07-23 development snapshot with the
reviewed Miles, Aaron, and Linnea corrections applied.

## Method and Findings

For canonical names containing one comma and multiple given-name tokens,
construct a candidate using the first given token plus the complete family
name. Group candidates using the existing name normalization, then run each
candidate through the actual professor lookup. No data or aliases are changed.

- Distinct candidate short-name forms: 2,070.
- Candidates not found by current lookup: 1,691.
- Unresolved candidates with one canonical record in the generated group:
  1,685.
- Unresolved candidates with multiple canonical records in the group: 6.

These are hypothetical shortened forms, not observed TSS names or confirmed
bugs. A unique record in this snapshot does not prove a person's identity or
exclude someone absent from the snapshot. The heuristic may misinterpret
compound given names. It is an audit aid, not a matching policy.

Examples requiring independent review include Sarah Aarons (Aarons, Sarah
Miranda), Henry Abarbanel (Abarbanel, Henry Don Isaac), Ian Abramson (Abramson,
Ian S), and Patrick Adamiak (Adamiak, Patrick John). None was automatically
added as an alias.

## Next Steps

The later batch audit now uses actual upstream `fa` snapshot names rather than
only hypothetical short forms. See `INSTRUCTOR_MATCH_REVIEW.md` and
`reports/instructor-audit.json` for source-linked automatic consolidation,
coverage, user decision cases, and remaining evidence queues. The older counts
above are historical findings, not current live-TSS failures or current batch
coverage. Independent verification remains necessary for unlinked candidates;
middle names are not silently dropped by runtime lookup.
