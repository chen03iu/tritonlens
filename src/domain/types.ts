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
  /** Academic year displayed by TSS, such as `2026/2027`. */
  readonly academicYear: string;

  /** Academic period displayed by TSS, such as `Fall Quarter`. */
  readonly academicPeriod: string;
}

/** A single scheduled section or component within a course offering. */
export interface Section {
  readonly sectionCode: string;
  readonly eventId: string | null;
  readonly teachingMethod: string | null;
  readonly scheduleText: string | null;
  readonly locationText: string | null;
  readonly deliveryMode: DeliveryMode;
  readonly instructors: readonly Instructor[];
}

/** A course and all of its known sections for one academic term. */
export interface CourseOffering {
  readonly course: Course;
  readonly term: Term | null;
  readonly packages: readonly CoursePackage[];
}

export type DeliveryMode =
  | 'in-person'
  | 'live-online'
  | 'mixed'
  | 'unknown';

export interface EnrollmentAvailability {
  readonly enrollmentLimit: number | null;
  readonly availableSeats: number | null;
  readonly waitlistCount: number | null;
}

export interface CoursePackage {
  readonly packageCode: string;
  readonly enrollment: EnrollmentAvailability;
  readonly sections: readonly Section[];
}
