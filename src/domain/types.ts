/**
 * An instructor name as presented by an approved source.
 *
 * Identity matching and aliases will be handled separately. Keeping only the
 * display name here prevents an uncertain match from becoming part of the
 * basic course model.
 */
export interface Instructor {
  readonly displayName: string;
}

/** A catalog course, independent of a particular term or section. */
export interface Course {
  /** Department or subject abbreviation, such as `CSE`. */
  readonly subjectCode: string;

  /** Catalog number as text so values such as `134B` retain their meaning. */
  readonly catalogNumber: string;

  /** Human-readable catalog title when TSS provides one. */
  readonly title: string | null;
}

/** An academic term as identified and displayed by TSS. */
export interface Term {
  /** Stable source code when available, such as a TSS term identifier. */
  readonly code: string;

  /** Human-readable term label shown to the user. */
  readonly displayName: string;
}

/** A single scheduled section or component within a course offering. */
export interface Section {
  /** Section label shown by TSS, such as `001-000`. */
  readonly sectionCode: string;

  /** Lecture, discussion, laboratory, or another source-provided label. */
  readonly teachingMethod: string | null;

  /** Zero, one, or multiple instructors assigned to this section. */
  readonly instructors: readonly Instructor[];
}

/** A course and all of its known sections for one academic term. */
export interface CourseOffering {
  readonly course: Course;
  readonly term: Term;
  readonly sections: readonly Section[];
}
