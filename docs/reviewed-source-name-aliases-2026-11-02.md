# Explicit reviewed source-name aliases

Reviewed on 2026-11-02. This batch adds 23 individually corroborated aliases (204 reviewed aliases total) and a narrowly scoped import-only source-name binding.

## Import behavior

Optional `sourceDisplayName` declares the exact, independently reviewed RMP name when it differs from the requested runtime alias. Existing rules default to their alias. Both names are checked for conflicting raw source profiles and retained full-name forms. Stable identity/source IDs, saved department/school, observation freshness and a unique owned historical course remain mandatory. Future contradictions stop already-promoted aliases before reconciliation or grade matching.

No runtime nickname table or fuzzy matching policy is added. Only the requested aliases are appended; source names, ratings and raw grade records are not renamed or recomputed. Exact course-by-professor history lookup remains separate from professor ratings.

| Runtime alias | Reviewed RMP source name | Retained identity | RMP ID / department | Owned marker | UCSD evidence |
|---|---|---|---|---|---|
| Daniel Martinico | Dan Martinico | Martinico, Daniel J | [781098](https://www.ratemyprofessors.com/professor/781098) / Communication | COMM/101D | [UCSD 1](https://communication.ucsd.edu/people/faculty/martinico-daniel.html) |
| Joseph Pecore | Joe Pecore | Pecore, Joseph P. | [1687063](https://www.ratemyprofessors.com/professor/1687063) / Accounting | MGT/12 | [UCSD 1](https://rady.ucsd.edu/faculty-research/other-faculty/continuing-lecturers/joseph-pecore.html) |
| Junko Simpson | Junko Tokuda Simpson | Simpson, Junko Tokuda | [2265866](https://www.ratemyprofessors.com/professor/2265866) / Languages | JAPN/10A | [UCSD 1](https://japan.ucsd.edu/people/lecturers.html), [UCSD 2](https://roosevelt.ucsd.edu/about/faculty.html) |
| Katharine Lacefield | Kathy Lacefield | Lacefield, Katharine I | [2279389](https://www.ratemyprofessors.com/professor/2279389) / Psychology | PSYC/154 | [UCSD 1](https://psychology.ucsd.edu/people/non-senate-instructors.html), [UCSD 2](https://profiles.ucsd.edu/katharine.lacefield) |
| Kimberly Prather | Kim Prather | Prather, Kimberly A | [415312](https://www.ratemyprofessors.com/professor/415312) / Chemistry | CCS/102 | [UCSD 1](https://www.chem.ucsd.edu/faculty/profiles/kimberly-prather) |
| Maria Candido | Maria Teresa Candido | Candido, Maria Teresa | [521611](https://www.ratemyprofessors.com/professor/521611) / Economics | ECON/120B | [UCSD 1](https://economics.ucsd.edu/faculty-and-research/faculty-profiles/candido.html) |
| Mattheus Stephens | M.E. Stephens | Stephens, Mattheus E | [61356](https://www.ratemyprofessors.com/professor/61356) / Political Science | POLI/104M | [UCSD 1](https://polisci.ucsd.edu/people/faculty/faculty-directory/instructors/index.html) |
| Mayumi Mckee | Mayumi Mochizuki McKee | McKee, Mayumi Mochizuki | [433291](https://www.ratemyprofessors.com/professor/433291) / Languages | JAPN/10A | [UCSD 1](https://japan.ucsd.edu/people/lecturers.html), [UCSD 2](https://roosevelt.ucsd.edu/about/faculty.html) |
| Michael Burkart | Mike Burkart | Burkart, Michael D | [571875](https://www.ratemyprofessors.com/professor/571875) / Chemistry | CHEM/40B | [UCSD 1](https://profiles.ucsd.edu/michael.burkart) |
| Michael Calderon-Zaks | Michael Calderon-Zak's | Calderon-Zaks, Michael Aar | [2375048](https://www.ratemyprofessors.com/professor/2375048) / Sociology | SOCI/125 | [UCSD 1](https://www.sociology.ucsd.edu/people/faculty/index.html) |
| Michael Sailor | Mike Sailor | Sailor, Michael Joseph | [105783](https://www.ratemyprofessors.com/professor/105783) / Chemistry | CHEM/120B | [UCSD 1](https://sailorgroup.ucsd.edu/people/) |
| Mohammad Bahadori | Yousef Bahadori | Bahadori, Mohammad Yousef | [439973](https://www.ratemyprofessors.com/professor/439973) / Engineering | MAE/181 | [UCSD 1](https://maeweb.ucsd.edu/faculty-profiles/lecturers), [UCSD 2](https://profiles.ucsd.edu/mohammad.bahadori) |
| Niall Twohig | Niall Ivan Twohig | Twohig, Niall Ivan | [2395461](https://www.ratemyprofessors.com/professor/2395461) / English | WCWP/10A | [UCSD 1](https://profiles.ucsd.edu/niall.twohig) |
| Patricia Wells | Rebecca Wells | Wells, Patricia Rebecca | [1632861](https://www.ratemyprofessors.com/professor/1632861) / Languages | LTRU/104B | [UCSD 1](https://roosevelt.ucsd.edu/about/faculty.html), [UCSD 2](https://advising.ucsd.edu/students/courses-enrollment/placement-exams.html), [UCSD 3](https://literature.ucsd.edu/people/faculty/rwells.html) |
| Ronald Burton | Ronald S Burton | Burton, Ronald S. | [623111](https://www.ratemyprofessors.com/professor/623111) / Biology | SIO/127 | [UCSD 1](https://profiles.ucsd.edu/ronald.burton), [UCSD 2](https://scrippsprofiles.ucsd.edu/) |
| Seth Cohen | Seth M Cohen | Cohen, Seth M | [295561](https://www.ratemyprofessors.com/professor/295561) / Chemistry | CHEM/125 | [UCSD 1](https://mrsec.ucsd.edu/faculty/) |
| Sherry Hayes | Sherri Hayes | Hayes, Sherry Lorine | [2563725](https://www.ratemyprofessors.com/professor/2563725) / Business | MGT/173 | [UCSD 1](https://rady.ucsd.edu/faculty-research/other-faculty/continuing-lecturers/sherry-hayes.html) |
| Stefan Llewellyn Smith | Stefan G Llewellyn Smith | Llewellyn Smith, Stefan G. | [879883](https://www.ratemyprofessors.com/professor/879883) / Engineering | MAE/152 | [UCSD 1](https://jacobsschool.ucsd.edu/faculty/profile?id=138) |
| Steven Levkoff | Steve Levkoff | Levkoff, Steven B. | [1739027](https://www.ratemyprofessors.com/professor/1739027) / Economics | ECON/1 | [UCSD 1](https://economics.ucsd.edu/about/contact-us.html) |
| Todd Henry | Todd A. Henry | Henry, Todd A. | [1413866](https://www.ratemyprofessors.com/professor/1413866) / History | HIEA/150 | [UCSD 1](https://historyweb.ucsd.edu/people/faculty/henry.html) |
| Vu Nguyen | Vu Quang Nguyen | Nguyen, Vu Quang | [3018411](https://www.ratemyprofessors.com/professor/3018411) / Biology | BICD/100 | [UCSD 1](https://biology.ucsd.edu/research/faculty/vnguyen) |
| Wouter Rappel | Wouter Jan Rappel | Rappel, Wouter Jan | [1857337](https://www.ratemyprofessors.com/professor/1857337) / Physics | PHYS/2A | [UCSD 1](https://bioengineering.ucsd.edu/graduate/training-program-in-quantitative-integrative-biology) |
| Yuan Tang | Yuan Emily Tang | Tang, Yuan Emily | [1050427](https://www.ratemyprofessors.com/professor/1050427) / Economics | ECON/130 | [UCSD 1](https://profiles.ucsd.edu/yuan.tang) |

## Evidence distinctions

The MAE lecturer page explicitly identifies Mohammad "Yousef" Bahadori. Patricia Rebecca Wells in the ERC faculty directory and Rebecca Wells in the Russian placement contact share the same UCSD contact; the Literature biography supports the Russian-language lecturer. This is evidence for a specific identity, not permission to match arbitrary middle names.

Junko Tokuda Simpson and Mayumi Mochizuki McKee are explicitly named by Japanese Studies, with the retained surname-first forms also in the ERC directory. The Rady Finance/Accounting page corroborates Joseph Pecore; UCSD Psychology explicitly lists Katharine Lacefield and her PSYC154/188 courses. Mattheus Stephens is named by Political Science, with POLI104M in its official schedule. Vu Nguyen uses the Biology faculty research page, not the unrelated same-name stem-cell-core research associate. Yuan Tang uses the Economics lecturer header, not unrelated cognitive-science publication results.

Reviewed source IDs and raw source spellings remain exact even for nickname, middle-name, initials or punctuation variants. No score is refreshed from web snippets or fixed in the manifest.

## Exclusions and follow-up

Michael Landry stays exactly unchanged, with its existing mixed-profile concern pending review per the user's explicit decision. Bernard Brown/Barry Brown and Elizabeth Miller remain excluded from global alias addition. Michael Davidson is not broadened without resolving potential full-name conflicts. The Christopher Lee/Cynthia Lee, Ellen Beck/Erika Beck and Ronald Evans Mathematics/Bioengineering candidate associations are suspicious leads, not approved identity matches. No new alias or source association is inferred for them in this batch; their current data is unchanged pending a separate source-association review. Kevin Cao and Writing David Jordan remain separate as requested.

## Preservation

The candidate starts from the current curated direct snapshot. Full comparison excluding only professor alias arrays proves every other field identical. Exactly 23 approved aliases are added and no old aliases removed. All 5,677 identities, 63 redirects, 11,120 histories / 30,146 terms, primary and alternate metrics, dates/permissions and nine importer-held profiles remain intact. Landry's entire record is also checked separately.

- Before snapshot SHA-256: `dbd93e3202b2233099ccb58f391779ab878c75d512950df0e204a814092bd531`.
- Candidate snapshot SHA-256: `c6b4f0ba6cb17cae76297ff9e6a0acda97c8fe5cd7b56457bf707084dde9882f`.
- July roster SHA-256: `b746016b93791acaaea1554e1a7ae3f75e7fbc6f64cd6bc53d6d9ae470b6266f`.
- Saved raw RMP roster SHA-256: `3950b97735d772328c0520f2c465fb310c46cda2fb14a352ac490ed292887d84`.

## Validation

Before implementation, the expanded focused regression had 29 expected failures: 23 source-name variants, preferred-name preflight, four new source/collision checks and the unpromoted bundled dataset. After the minimal helper change, 217 cases pass and only the expected unpromoted bundle case remains red. Candidate import applies all 23 rules with zero blocked entries. Final audit and completion checks are recorded below.

## Saved-roster runtime results

The same July roster contains 1,995 names and 4,543 course-name pairs; it is an older saved assignment snapshot, not a live TSS census.

| Measure | Before | After |
|---|---:|---:|
| Matched names | 1,861 | 1,884 |
| Unmatched names | 134 | 111 |
| Identity-found pairs | 4,344 | 4,388 |
| Identity-ambiguous pairs | 0 | 0 |
| Rating-found pairs | 2,886 | 2,930 |
| Exact course-history-found pairs | 924 | 950 |
| History-ambiguous pairs | 0 | 0 |
| Both metrics found | 821 | 847 |

The batch recovers 44 rating-found pairs and 26 exact course-history pairs. A found history still does not guarantee a numeric GPA or usable grade percentages.

Normal promotion and repeat candidate import are byte-identical at SHA-256 `c6b4f0ba6cb17cae76297ff9e6a0acda97c8fe5cd7b56457bf707084dde9882f`. The previous snapshot is preserved in the ignored import backup.

## Completion checks

- Focused regression: 218 tests passed, including all 204 bundled aliases, preferred-name exact-source validation, both-name raw collisions, retained-source-name collisions and preflight before reconciliation.
- Full suite: 709 tests across 42 files passed (`npm.cmd test -- --maxWorkers=2`).
- TypeScript validation, default extension build and diff whitespace checks passed.
- Independent read-only review found no actionable issues and rechecked guard ordering/backward fallback, all 23 source bindings, unchanged prior 181 decisions, alias preservation and deep equality of every non-alias field. UCSD primary evidence also supports the reviewed individual distinctions.

The updated default build is in `D:/Projects/tritonlens/.worktrees/direct-data/dist`. Reload the unpacked extension and refresh TSS. This work remains local on `fix/reviewed-source-name-aliases`; no push, merge or release was performed.
