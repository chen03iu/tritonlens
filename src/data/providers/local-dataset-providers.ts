import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
} from '../lookup';
import type {
  DataSourceReference,
  LocalDataset,
  ProfessorRecord,
} from '../types';
import type {
  LocalDatasetProviderSet,
  ProfessorIdentity,
} from './types';

function findSource(
  dataset: LocalDataset,
  sourceId: string,
): DataSourceReference | null {
  return (
    dataset.sources.find((source) => source.id === sourceId) ??
    null
  );
}

function findProfessor(
  dataset: LocalDataset,
  identity: ProfessorIdentity,
): ProfessorRecord | null {
  return (
    dataset.professors.find(
      (professor) => professor.id === identity.id,
    ) ?? null
  );
}

export function createLocalDatasetProviderSet(
  dataset: LocalDataset,
): LocalDatasetProviderSet {
  return {
    identityProvider: {
      lookup(displayName) {
        const result = lookupProfessor(dataset, displayName);

        if (result.status === 'ambiguous') {
          return { status: 'ambiguous' };
        }

        if (result.status === 'not-found') {
          return { status: 'not-found' };
        }

        return {
          status: 'found',
          identity: {
            id: result.record.id,
            displayName: result.record.displayName,
            matchMethod: result.matchMethod,
          },
        };
      },
    },
    ratingProvider: {
      lookup(identity) {
        const rating = findProfessor(dataset, identity)?.rating;
        if (!rating) {
          return { status: 'not-found' };
        }

        const source = findSource(dataset, rating.sourceId);
        if (!source) {
          return { status: 'not-found' };
        }

        return {
          status: 'found',
          data: { rating, source },
        };
      },
    },
    gradesProvider: {
      lookup(identity, subjectCode, catalogNumber) {
        const result = lookupHistoricalCourseGrades(
          dataset,
          identity.id,
          subjectCode,
          catalogNumber,
        );

        if (result.status === 'ambiguous') {
          return { status: 'ambiguous' };
        }

        if (result.status === 'not-found') {
          return { status: 'not-found' };
        }

        const source = findSource(dataset, result.record.sourceId);
        if (!source) {
          return { status: 'not-found' };
        }

        return {
          status: 'found',
          data: {
            record: result.record,
            source,
          },
        };
      },
    },
    linkProvider: {
      getLinks(context, identity, ratingResult) {
        if (identity.status === 'ambiguous') {
          const searchUrl = new URL(
            'https://www.ratemyprofessors.com/search/professors/1079',
          );
          searchUrl.searchParams.set(
            'q',
            context.instructor.displayName,
          );
          return [
            {
              kind: 'professor-ratings',
              label: 'View ratings on RateMyProfessors',
              url: searchUrl.href,
            },
            {
              kind: 'historical-grades',
              label: 'Open the UCSD A.S. grade archive',
              url: 'https://dev-as.ucsd.edu/Home/InstructorGradeArchive',
            },
          ];
        }

        if (ratingResult.status !== 'found') {
          return [];
        }

        const sourceProfessorId =
          ratingResult.data.rating.sourceProfessorId;
        if (!sourceProfessorId || !/^\d+$/.test(sourceProfessorId)) {
          return [];
        }

        return [
          {
            kind: 'professor-ratings',
            label: 'RateMyProfessors profile',
            url:
              'https://www.ratemyprofessors.com/professor/' +
              sourceProfessorId,
          },
        ];
      },
    },
  };
}
