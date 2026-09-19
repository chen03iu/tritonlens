# Instructor Matching Review

Latest batch (2026-09-19): 19 more externally verified short names now resolve.
Current counts: 1,608 matched, 39 ambiguous, 286 needs-evidence, 62 no-candidate.
Bernard Brown's candidate has a conflicting Barry Brown RMP profile and was
not approved. See `reports/short-name-batch-2-review.md` for individual evidence.
Earlier counts below are historical.

Latest update (2026-09-19): Mark Anderson was externally verified against
UCSD MAE faculty/course sources and RMP profile 2089978, then added as a
guarded alias for Mark Ronald Anderson. Current counts: 1,589 matched,
39 ambiguous, 305 needs-evidence, 62 no-candidate. Only Mark's status changed.
Evidence: `src/data/reviewed-short-names.json`.
The first-batch counts below are historical.

Latest update (2026-09-18): the first 25 recommendations were externally
reviewed and added as guarded aliases. All 25 now resolve uniquely. Current
counts are 1,588 matched, 39 ambiguous, 306 needs-evidence, 62 no-candidate;
284 recommendations and 22 review entries remain. See
[batch evidence](reports/short-name-batch-1-review.md).
Counts in the original 2026-09-17 sections below are the pre-batch baseline.

Audit date: 2026-09-17. Full machine-readable details:
[reports/instructor-audit.json](reports/instructor-audit.json).

## Completed Automatically

The offline audit checks 1,995 names in Easy-A Radar's public `fa` snapshot.
These are upstream snapshot names, not captured live TSS names or confirmed
live failures. The report records the input SHA-256. Upstream metadata still
says generated 2026-07-23 and 1,711 instructors; the actual `fa` object has
more names, so those metadata counts are not treated as audit results.

692 redundant identity records were consolidated in the effective development
dataset. Source-profile groups require identical numeric RMP linkage, rating
payload/provenance, compatible names, and same-subject evidence when more than
one member carries history. A generated reviewed list also consolidates 170
empty current-term stubs using exact full-name reversal or shortened first/last
name plus same-subject evidence. All historical rows and their provenance are
retained. Raw generated JSON is untouched.

Strict lookup succeeds for 1,563 names. After exact reviewed corrections but
before automatic consolidation, the same audit resolves 1,140 names.
This does not mean every name has ratings or course-specific history, or that
all additional candidate identities have been verified.

Nathan Delson / Nathan J. Delson now resolve through reviewed aliases to the
existing Nathan Joseph Delson identity, rating, and MAE 3 history. No new
ratings or historical grades were invented.

Official UCSD evidence also resolves Justin / Justin Paul Opatkiewicz, Keiko / Keiko K. Nomura, Alyssa Taylor / Taylor-Amos, Siavash
Mirarab / Mir Arabbaygi, Thomas / Tom Erbe, and Timothy / Tim Gentner. Cheryl
Anderson's FMPH 40 and FPMU 40 records are consolidated under one identical RMP
profile while retaining both historical rows. Exact evidence links and source
fingerprints are recorded in `REVIEWED_IDENTITIES.md`.

## Resolved Profile-Link Conflicts

The 11 priority conflicts were independently checked against the profile name
and department plus UCSD faculty or course evidence. They are now explicit,
exact-ID corrections rather than fuzzy runtime rules.

| Instructor | Selected profile | Resolution |
| --- | --- | --- |
| Danna Zhang | [2276558](https://www.ratemyprofessors.com/professor/2276558) | Mathematics; 1294356 is Dong-Er Zhang in Biology. |
| Florian Meyer | [3051803](https://www.ratemyprofessors.com/professor/3051803) | Engineering/ECE; 1005716 is Steve Meyer in Psychology. |
| Jonathan Cohen | [362637](https://www.ratemyprofessors.com/professor/362637) | Philosophy; 99372 is Alain J. J. Cohen in Literature. |
| Juan Carlos Del Alamo | [1512231](https://www.ratemyprofessors.com/professor/1512231) | Both candidate profiles describe the same MAE professor; retain the more complete linked snapshot. |
| K. Wayne Yang | [1121831](https://www.ratemyprofessors.com/professor/1121831) | Ethnic Studies; 2232051 is Kesong Yang in Engineering. |
| Karen Kovaka | [2855730](https://www.ratemyprofessors.com/professor/2855730) | 2915175 is the same Philosophy professor under the typo `Karenc`; retain the correctly spelled, larger profile. |
| Kenji Nomura | [2449656](https://www.ratemyprofessors.com/professor/2449656) | ECE; 377111 is Keiko Nomura in MAE. |
| Keolu Fox | [2778643](https://www.ratemyprofessors.com/professor/2778643) | Anthropology; 1695836 is Patrick Fox in Engineering. |
| Li-Fan Lu | [1824878](https://www.ratemyprofessors.com/professor/1824878) | Both profiles describe the same Biology professor; retain the larger, more current snapshot. |
| Monte Johnson | [999601](https://www.ratemyprofessors.com/professor/999601) | Philosophy; 128225 is Christine Johnson in Cognitive Science. |
| Erik Johnson | [3033351](https://www.ratemyprofessors.com/professor/3033351) | Management/MGT 160; 2881727 is Sara Johnson in Literature. |

All 11 short names now resolve uniquely. Historical rows remain intact. Karen
Kovaka's two PHIL 12 snapshots are deliberately retained as ambiguous instead
of silently choosing or deleting one.

## Other Unresolved Work

The JSON report exposes all candidate IDs, names, aliases, profile links, and
historical courses, including:

- 39 ambiguous entries: duplicate or conflicting identities.
- 331 entries with one candidate but insufficient identity evidence.
- 62 entries with no candidate under these limited discovery rules; this is
  not proof that no external data exists.
- 10 strict matches with additional plausible candidates, marked
  `reviewRequired: true`. This flag does not change runtime lookup.

Unlinked empty stubs, shortened names, and accent/hyphen variants remain
unresolved unless independent evidence supports an explicit alias. This audit
is candidate discovery, not comprehensive external verification. These queues
remain follow-up work; you do not need to manually search every entry.

Mark Young, Elizabeth Miller, and Natalye Harpin/Pass are intentional
holdouts. Their name/profile linkage conflicts with department-specific history
or lacks direct surname-change evidence, so precision takes priority over
coverage.

## Offline Short-Name Recommendations

The 331-entry `needs-evidence` queue now has a reproducible, read-only second
pass in
[reports/name-match-recommendations.json](reports/name-match-recommendations.json)
and
[reports/name-match-recommendations.md](reports/name-match-recommendations.md).
It classifies 309 entries as `recommended`, 22 as `review`, and 0 as
`rejected`. All 309 recommendations are shortened middle-name forms with one
candidate and at least one shared current/historical course subject. The 22
review entries have a compatible shortened name but no shared subject.

`recommended` means the deterministic evidence threshold was met; it does not
mean the alias has been independently verified. The command never changes
aliases, corrections, professor records, historical rows, or runtime lookup.
Promotion into reviewed corrections remains a separate human-reviewed step.
The three intentional holdouts above are outside this report because their
source audit status is `ambiguous`, not `needs-evidence`.

## Repeat the Audit

Use an author-permitted local Easy-A `data.json` file:

```powershell
npm.cmd run audit:instructors -- D:\path\to\data.json
```

The tool reads that file's `fa` instructor names and checks the currently
bundled dataset with reviewed corrections and conservative consolidation.
It does not import or update rating/grade data, make network requests, scrape
RMP, or touch TSS. Default output is `reports/instructor-audit.json`.
Missing/malformed instructor input fails; output cannot overwrite the input
snapshot or generated dataset, including existing symlink/junction aliases.

Then generate the deterministic short-name review artifacts from that audit:

```powershell
npm.cmd run recommend:names -- reports/instructor-audit.json reports/name-match-recommendations.json reports/name-match-recommendations.md
```

This second command is offline, fingerprints the exact audit input, processes
only `needs-evidence` entries, and protects the audit, generated dataset, and
reviewed-corrections source from output-path overwrite. Run both commands for
each future snapshot before reviewing any proposed alias.
