# Reviewed Instructor Identities

Reviewed: 2026-09-15. These are explicit development corrections, not a rule
to ignore middle names or automatically match similar surnames.

## Miles Jones

Target: `Jones, Miles E` (`easy-a-jones-miles-e-f6900194f3`).
Aliases: `Miles Jones`, `Miles Eli Jones`.

His UCSD homepage uses both Miles Eli Jones and Miles Jones, with the same
CSE contact address as the department's Miles E. Jones faculty profile:

- https://cseweb.ucsd.edu/~mej016/
- https://cse.ucsd.edu/people/faculty-profiles/miles-e-jones

Existing Easy-A rating and historical records are retained unchanged.

## Linnea Wilder

Target: `Wilder, Linnea Lorene` (`easy-a-wilder-linnea-lorene-d9d040d7f2`).
Aliases: `Linnea Wilder`, `Linnea L. Wilder`.

The UCSD Anthropology lecturers page uses both short names and lists the
contact address llwilder@ucsd.edu. A UCSD summer course report lists the full
name Wilder, Linnea Lorene teaching ANTH 2, consistent with the snapshot.

- https://anthropology.ucsd.edu/people/lecturers/index.html
- https://summersession.ucsd.edu/_files/course-scheduling-documents/Course_Report_2019.pdf

Existing snapshot metrics are retained: RMP profile 2470718, rating 3.8,
difficulty 2.5, 56 ratings, would-take-again 75 percent; ANTH 2 historical GPA
2.992 across 7 offerings. No new rating or historical dataset was imported.

## Aaron Shalev / Aaron Schulman

Target: `Shalev, Aaron D` (`easy-a-shalev-aaron-d-1ef0bedf0d`).
Aliases: `Aaron Shalev`, `Aaron Schulman`, `Aron Shalev`, `Aaron Shaleve`.

His own UCSD page confirms the professional name Aaron Schulman, legal name
Aaron Shalev, and database typo Aron Shalev. Aaron Shaleve was reported by the
user as another TSS spelling; it is not claimed to appear on that web page.
UCSD's public schedule lists Shalev, Aaron D teaching CSE 29.

- https://cseweb.ucsd.edu/~schulman/shalev.html
- https://act.ucsd.edu/scheduleOfClasses/scheduleOfClassesStudentResult.htm?sections=29057&selectedTerm=WI26&tabNum=tabs-sec

RMP profile 3050657 is named Aaron Schulman and lists UC San Diego Extended
Studies. Its reviews refer to CSE 29, CSE 123, and Schulman (Shalev), supporting
the reviewed identity connection despite the different school label:

- https://www.ratemyprofessors.com/professor/3050657

On the review date its structured aggregate fields and displayed summary
reported overall rating 5, difficulty 3, rating count 3, and would-take-again
100 percent. The visible review list included four entries and a 3/5 review,
which disagrees with those reported totals. We preserve the site's aggregate
fields as an observation, not a recomputed score or guaranteed current value.
No review text or student identities are bundled.

This separate personal noncommercial development observation is pending
redistribution review. It is not Easy-A data or approved release data. The UI
links to the actual profile and preserves its Extended Studies school label.

## Daphne Taylor García

Target: `Taylor-Garcia, Daphne` (`easy-a-taylor-garcia-daphne-33ba9d49d2`).
Aliases: `Daphne Taylor García`, `Daphne Taylor Garcia`, `Daphne Taylor-García`.

UCSD faculty and program pages use accented, unaccented, spaced, and hyphenated
forms for the same professor and contact address dtg@ucsd.edu:

- https://www.ethnicstudies.ucsd.edu/people/taylor-garcia.html
- https://cgs.ucsd.edu/people/faculty/directors/index.html

The existing RMP profile 1850822 and all ETHN/CGS history are unchanged.
The snapshot has no AIP 197 history; no other course's grades are substituted.

## Isabella Maita

Canonical target: `Maita, Isabella Vincenza`
(`easy-a-maita-isabella-vincenza-4852998842`, RMP profile 2987635).
Reviewed empty duplicate: `Isabella Maita`
(`easy-a-isabella-maita-1cf20dd783`).

UCSD's biology offerings list Isabella Maita for BIPN 100 and BIPN 145; the
course archive lists Maita, Isabella Vincenza for those biology courses.
The biology faculty page uses the short name and identifies the instructor:

- https://biology.ucsd.edu/research/faculty/imaita
- https://biology.ucsd.edu/education/undergrad/course/course-offerings.html
- https://courses.ucsd.edu/profMain.aspx?profname=Maita%2C+Isabella+Vincenza

The correction removes only the exact empty duplicate from the effective
development dataset and adds its short name to the canonical aliases. The
generated source JSON remains untouched. Existing rating metrics and biology
history are retained, including the snapshot's 76 percent would-take-again
(not the user's newer screenshot's 77 percent). Neither record has AIP 197
history, so it remains unavailable.

If the shorter record gains a rating, aliases, or historical data, or if IDs,
canonical names, or the reviewed RMP profile conflict, it is not consolidated.
No meaningful record is silently discarded or its grades reassigned.

## Safeguards

Corrections are applied separately from generated JSON, so imports preserve
them. They require the exact reviewed ID and a unique canonical name. Existing
ratings are not overwritten, a profile already attached elsewhere is not
reassigned, and alias collisions remain ambiguous under the normal lookup.
No correction is applied automatically to mock or production datasets.
