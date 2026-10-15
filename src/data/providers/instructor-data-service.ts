import type {
  ExternalDataLink,
  HistoricalGradesLookupResult,
  IdentityLookupResult,
  InstructorDataService,
  InstructorDataServiceOptions,
  ProfessorRatingLookupResult,
} from './types';

const NO_IDENTITY: IdentityLookupResult = {
  status: 'not-found',
};
const NO_RATING: ProfessorRatingLookupResult = {
  status: 'not-found',
};
const NO_GRADES: HistoricalGradesLookupResult = {
  status: 'not-found',
};

function releaseApprovedRating(
  mode: InstructorDataServiceOptions['mode'],
  result: ProfessorRatingLookupResult,
): ProfessorRatingLookupResult {
  return mode === 'production-snapshot' &&
    result.status === 'found' &&
    result.data.source.permissionStatus !== 'approved'
    ? NO_RATING
    : result;
}

function releaseApprovedGrades(
  mode: InstructorDataServiceOptions['mode'],
  result: HistoricalGradesLookupResult,
): HistoricalGradesLookupResult {
  return mode === 'production-snapshot' &&
    result.status === 'found' &&
    result.data.source.permissionStatus !== 'approved'
    ? NO_GRADES
    : result;
}

export function createInstructorDataService(
  options: InstructorDataServiceOptions,
): InstructorDataService {
  return {
    mode: options.mode,
    getInsight(context) {
      let identity: IdentityLookupResult;

      try {
        identity = options.identityProvider.lookup(
          context.instructor.displayName,
        );
      } catch {
        identity = NO_IDENTITY;
      }

      let professorRating = NO_RATING;
      let historicalGrades = NO_GRADES;

      if (identity.status === 'found') {
        try {
          professorRating = releaseApprovedRating(
            options.mode,
            options.ratingProvider.lookup(identity.identity),
          );
        } catch {
          professorRating = NO_RATING;
        }

        try {
          historicalGrades = releaseApprovedGrades(
            options.mode,
            options.gradesProvider.lookup(
              identity.identity,
              context.course.subjectCode,
              context.course.catalogNumber,
            ),
          );
        } catch {
          historicalGrades = NO_GRADES;
        }
      }

      let links: ExternalDataLink[] = [];
      try {
        links = Array.from(
          options.linkProvider.getLinks(
            context,
            identity,
            professorRating,
          ),
        );
      } catch {
        links = [];
      }

      return {
        mode: options.mode,
        modeLabel: options.modeLabel,
        identity,
        professorRating,
        historicalGrades,
        links,
      };
    },
  };
}
