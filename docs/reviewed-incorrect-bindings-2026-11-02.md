# Reviewed incorrect single-owner profile bindings

Reviewed on 2026-11-02. Three explicit legacy associations attach one instructor's RMP profile to a different course-history owner. Each profile currently has only one internal owner; the existing shared-profile reconciliation deliberately skips singleton groups, so these bad associations survived refresh.

## Design and scope

Extend reconciliation with a small reviewed rejection registry. Scope each rule to exact retained ID/name, current source ID, independently verified raw profile name/department/school, fresh observation and one owned history marker. Missing, stale, duplicate or contradictory evidence for an active reviewed wrong binding stops import for revalidation. No generic name-dissimilarity rule is introduced.

Detach only the verified wrong association, clear its selected rating/source timestamp and remove that same source ID from any alternate observations on the rejected record. Keep names, aliases and histories unchanged. If any other alternate source ID is present, stop for revalidation rather than choosing a replacement score or discarding its observation. If the sole alternate is the rejected ID, omit the resulting empty alternate array. The normal exact-source import can then retain the unchanged observation on a native source-name profile. Never infer a replacement score for the rejected instructor.

| Retained course-history identity | Incorrect RMP profile | Marker | Primary evidence |
|---|---|---|---|
| Lee, Christopher Tingkuang | [Cynthia Lee / 1161380](https://www.ratemyprofessors.com/professor/1161380) (Computer Science) | BILD/5 | [Primary 1](https://biology.ucsd.edu/research/faculty/ctlee), [Primary 2](https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=94088&selectedTerm=SP26&tabNum=tabs-sec), [Primary 3](https://cseweb.ucsd.edu/classes/su07/cse141/) |
| Beck, Ellen L. | [Erika Beck / 103179](https://www.ratemyprofessors.com/professor/103179) (Psychology) | PH/191 | [Primary 1](https://familymedicine.ucsd.edu/education-training/freeclinic/about/faculty-staff.html), [Primary 2](https://hwsph.ucsd.edu/people/faculty/faculty-directory.html), [Primary 3](https://www.csun.edu/office-of-the-president/erika-d-beck-phd-biography) |
| Brown, Bernard Joseph | [Barry Brown / 1197967](https://www.ratemyprofessors.com/professor/1197967) (Communication) | TDTR/10 | [Primary 1](https://theatre.ucsd.edu/people/faculty/dance/index.html), [Primary 2](https://catalog.ucsd.edu/faculty/CSE.html), [Primary 3](https://sciencestudies.ucsd.edu/colloquium/2008-2009.html) |

Christopher Tingkuang Lee is listed for BILD5 and Molecular Biology; Cynthia Lee is explicitly named in the earlier CSE141 teaching page. Ellen Beck is the physician and Public Health/Free Clinic faculty member; Erika D. Beck has a separately documented experimental-psychology career. Bernard Brown is Dance faculty; Barry Brown is independently listed in Communication and a 2008 UCSD Communication colloquium. RMP profile names, departments and course tags corroborate these distinct identities. Web scores are not imported or pinned.

## Boundaries

The nine importer-held profiles and the user's decisions on Kevin Cao, Writing David Jordan and Michael Landry remain unchanged. Michael Davidson and Ronald Evans are separate disambiguation leads, not asserted corrections. Unrated identities with grade histories have been inventoried in an ignored follow-up report; no invented RMP binding or broad alias is added for them here.

## Validation

Candidate preservation and completion checks are recorded below.

## Candidate preservation

The candidate changes exactly the three rejected records: their selected rating becomes null and the incorrect selected source ID/date are removed. Exactly three native source identities are added for Cynthia Lee, Erika Beck and Barry Brown, each retaining the exact prior rating observation, including all numeric values and source date/ID. No replacement rating is guessed for Christopher Lee, Ellen Beck or Bernard Brown.

Every other professor record and every non-professor dataset field is deep-equal to the prior snapshot: all 11,120 histories / 30,146 terms, names/aliases, 63 redirects, source dates/permissions, nine held profiles and Landry's entire record remain unchanged. Profile count changes from 5,677 to 5,680 because the distinct native source identities are represented explicitly.

- Before SHA-256: c6b4f0ba6cb17cae76297ff9e6a0acda97c8fe5cd7b56457bf707084dde9882f
- Candidate SHA-256: 1c24f9d8e3cf2ca5a056df38709c447f409131ae0da0be6cfb9baa06f0f7447f

The new regression first reproduced eight failures out of nine cases. Focused correction and existing reconciliation checks now pass 62 cases, including native-profile separation, repeat-import stability, both singleton/shared ownership, alternate-observation preservation and active-evidence contradiction guards. A further saved-rating/source-ID contradiction was separately observed red, then fixed. Final verification is recorded below.

Independent review identified that retaining an unselected alternate array would violate the current dataset contract. This was reproduced with valid input in five regression failures, including three full importer cases. The fix retains the existing validation contract: other alternate IDs stop import for review, and an emptied rejected-only array is omitted. No schema/UI change or automatic replacement selection is introduced.

## Runtime audit

The same July roster still has 1,995 names / 4,543 course-name pairs: 1,884 matched and 111 unmatched names; 4,388 identity-found pairs, zero ambiguous pairs, 2,930 rating-found pairs, 950 exact-history-found pairs and 847 pairs with both metrics. These counts are unchanged because the three rejected short names were already unmatched. This is a precision correction, not a coverage claim. The three unchanged full canonical names still resolve to their original owned history records, with no unrelated selected score.

Normal promotion and repeat import match SHA-256 `1c24f9d8e3cf2ca5a056df38709c447f409131ae0da0be6cfb9baa06f0f7447f`; the previous snapshot remains in the ignored backup.

## Completion checks

- Focused correction/reconciliation/CLI suite: 72 tests passed.
- Full suite: 724 tests across 43 files passed (`npm.cmd test -- --maxWorkers=2`).
- TypeScript validation, default extension build and diff whitespace checks passed.
- Independent read-only review confirmed exact permitted changes and identified one alternate-array edge case. Valid-input regressions reproduced it; the narrower stop-for-review/omit-empty-array fix passed all tests. Follow-up review confirmed the finding resolved with no remaining actionable issues.
- CLI regressions cover successful evidence-backed bootstrap, rollback retention, newer-observation preservation, and no file/history/backup writes on active correction revalidation failure.

Reload `D:/Projects/tritonlens/.worktrees/direct-data/dist` and refresh TSS. Work stays local on `fix/reviewed-single-owner-profile-links`; no push, merge or release was performed.
