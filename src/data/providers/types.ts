import type { ProfessorMatchMethod } from '../lookup';
import type {
  DataSourceReference,
  HistoricalCourseGradeRecord,
  ProfessorRating,
} from '../types';
import type {
  RenderedInstructorContext,
} from '../../tss/instructor-context';

export type ProviderMode =
  | 'link-only'
  | 'mock'
  | 'development-snapshot'
  | 'pending-permission-snapshot'
  | 'production-snapshot';

export interface ProfessorIdentity {
  readonly id: string;
  readonly displayName: string;
  readonly matchMethod: ProfessorMatchMethod;
}

export type IdentityLookupResult =
  | {
      readonly status: 'found';
      readonly identity: ProfessorIdentity;
    }
  | { readonly status: 'ambiguous' }
  | { readonly status: 'not-found' };

export interface SourcedProfessorRating {
  readonly rating: ProfessorRating;
  readonly source: DataSourceReference;
}

export interface SourcedHistoricalGrades {
  readonly record: HistoricalCourseGradeRecord;
  readonly source: DataSourceReference;
}

export type ProfessorRatingLookupResult =
  | {
      readonly status: 'found';
      readonly data: SourcedProfessorRating;
    }
  | { readonly status: 'not-found' };

export type HistoricalGradesLookupResult =
  | {
      readonly status: 'found';
      readonly data: SourcedHistoricalGrades;
    }
  | { readonly status: 'ambiguous' }
  | { readonly status: 'not-found' };

export interface ExternalDataLink {
  readonly kind: 'professor-ratings' | 'historical-grades';
  readonly label: string;
  readonly url: string;
}

export interface InstructorInsight {
  readonly mode: ProviderMode;
  readonly modeLabel: string;
  readonly identity: IdentityLookupResult;
  readonly professorRating: ProfessorRatingLookupResult;
  readonly historicalGrades: HistoricalGradesLookupResult;
  readonly links: readonly ExternalDataLink[];
}

export interface InstructorDataService {
  readonly mode: ProviderMode;
  getInsight(context: RenderedInstructorContext): InstructorInsight;
}

export interface InstructorIdentityProvider {
  lookup(displayName: string): IdentityLookupResult;
}

export interface ProfessorRatingProvider {
  lookup(identity: ProfessorIdentity): ProfessorRatingLookupResult;
}

export interface HistoricalGradesProvider {
  lookup(
    identity: ProfessorIdentity,
    subjectCode: string,
    catalogNumber: string,
  ): HistoricalGradesLookupResult;
}

export interface ExternalLinkProvider {
  getLinks(
    context: RenderedInstructorContext,
    identity: IdentityLookupResult,
    rating: ProfessorRatingLookupResult,
  ): readonly ExternalDataLink[];
}

export interface InstructorDataServiceOptions {
  readonly mode: ProviderMode;
  readonly modeLabel: string;
  readonly identityProvider: InstructorIdentityProvider;
  readonly ratingProvider: ProfessorRatingProvider;
  readonly gradesProvider: HistoricalGradesProvider;
  readonly linkProvider: ExternalLinkProvider;
}

export type LocalDatasetProviderSet = Omit<
  InstructorDataServiceOptions,
  'mode' | 'modeLabel'
>;
