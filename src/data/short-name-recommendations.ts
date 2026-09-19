import type { InstructorAuditEntry } from './instructor-audit';
import {
  analyzeNameRelationship,
  type NameRelationshipKind,
} from './name-variants';

export type Recommendation = 'recommended' | 'review' | 'rejected';

export interface ShortNameRecommendation {
  readonly currentName: string;
  readonly currentCourses: readonly string[];
  readonly candidateId: string | null;
  readonly candidateName: string | null;
  readonly relationship: NameRelationshipKind | null;
  readonly sharedSubjects: readonly string[];
  readonly supportingEvidence: readonly string[];
  readonly conflictingEvidence: readonly string[];
  readonly recommendation: Recommendation;
  readonly reason: string;
}

const REVIEWED_HOLDOUTS = new Set(['Elizabeth Miller', 'Mark Young', 'Natalye Harpin']);

const RELATIONSHIP_RANK: Readonly<Record<NameRelationshipKind, number>> = {
  'exact-reordered': 0,
  'orthographic-variant': 1,
  'middle-initial': 2,
  'middle-omitted': 3,
  'fuzzy-only': 4,
  incompatible: 5,
};

function subjects(courses: readonly string[]): string[] {
  return [...new Set(courses.map(course => course.trim().split(/\s+/)[0]?.toLocaleUpperCase('en-US'))
    .filter((subject): subject is string => Boolean(subject)))]
    .sort((left, right) => left.localeCompare(right, 'en-US'));
}

function strongestRelationship(
  currentName: string,
  forms: readonly string[],
): NameRelationshipKind {
  return forms
    .map(form => analyzeNameRelationship(currentName, form).kind)
    .sort((left, right) => RELATIONSHIP_RANK[left] - RELATIONSHIP_RANK[right])[0] ?? 'incompatible';
}

export function recommendShortNameMatches(
  entries: readonly InstructorAuditEntry[],
): readonly ShortNameRecommendation[] {
  return entries
    .filter(entry => entry.status === 'needs-evidence')
    .map(entry => {
      const currentCourses = [...entry.courses].sort((left, right) => left.localeCompare(right, 'en-US'));
      if (entry.candidates.length !== 1) {
        return {
          currentName: entry.name,
          currentCourses,
          candidateId: null,
          candidateName: null,
          relationship: null,
          sharedSubjects: [],
          supportingEvidence: [],
          conflictingEvidence: [`Candidate count: ${entry.candidates.length}.`],
          recommendation: entry.candidates.length === 0 ? 'rejected' as const : 'review' as const,
          reason: entry.candidates.length === 0
            ? 'No candidate is available for deterministic evaluation.'
            : 'Multiple candidates require human review.',
        };
      }

      const candidate = entry.candidates[0];
      const relationship = strongestRelationship(entry.name, [candidate.displayName, ...candidate.aliases]);
      const currentSubjects = subjects(entry.courses);
      const historicalSubjects = new Set(subjects(candidate.historicalCourses));
      const sharedSubjects = currentSubjects.filter(subject => historicalSubjects.has(subject));
      const supportingEvidence = [
        `Name relationship: ${relationship}.`,
        ...sharedSubjects.map(subject => `Shared subject: ${subject}.`),
      ];
      const conflictingEvidence = sharedSubjects.length === 0
        ? ['No shared course subject was found.']
        : [];

      let recommendation: Recommendation;
      let reason: string;
      if (REVIEWED_HOLDOUTS.has(entry.name)) {
        recommendation = 'review';
        reason = 'This name is a reviewed holdout and requires human evidence.';
      } else if (relationship === 'incompatible') {
        recommendation = 'rejected';
        reason = 'The candidate name is structurally incompatible with the current instructor name.';
      } else if (relationship === 'exact-reordered') {
        recommendation = 'recommended';
        reason = 'The names are an exact deterministic match after reordering.';
      } else if (relationship === 'fuzzy-only') {
        recommendation = 'review';
        reason = 'Only a fuzzy name relationship is available.';
      } else if (sharedSubjects.length > 0) {
        recommendation = 'recommended';
        reason = 'Compatible name form and a shared course subject provide deterministic support.';
      } else {
        recommendation = 'review';
        reason = 'The name form is compatible, but there is no shared course subject.';
      }

      return {
        currentName: entry.name,
        currentCourses,
        candidateId: candidate.id,
        candidateName: candidate.displayName,
        relationship,
        sharedSubjects,
        supportingEvidence,
        conflictingEvidence,
        recommendation,
        reason,
      };
    })
    .sort((left, right) => left.currentName.localeCompare(right.currentName, 'en-US'));
}

export function summarizeRecommendations(
  results: readonly ShortNameRecommendation[],
): { recommended: number; review: number; rejected: number; total: number } {
  return {
    recommended: results.filter(result => result.recommendation === 'recommended').length,
    review: results.filter(result => result.recommendation === 'review').length,
    rejected: results.filter(result => result.recommendation === 'rejected').length,
    total: results.length,
  };
}
