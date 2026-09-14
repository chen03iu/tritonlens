import type {
  HistoricalCourseGradeRecord,
  LocalDataset,
  ProfessorRecord,
} from './types';

export type ProfessorMatchMethod =
  | 'exact'
  | 'normalized'
  | 'known-alias';

export type ProfessorLookupResult =
  | {
      readonly status: 'found';
      readonly matchMethod: ProfessorMatchMethod;
      readonly record: ProfessorRecord;
    }
  | {
      readonly status: 'ambiguous';
      readonly candidates: readonly ProfessorRecord[];
    }
  | {
      readonly status: 'not-found';
    };

export type CourseGradeLookupResult =
  | {
      readonly status: 'found';
      readonly record: HistoricalCourseGradeRecord;
    }
  | {
      readonly status: 'ambiguous';
      readonly candidates:
        readonly HistoricalCourseGradeRecord[];
    }
  | {
      readonly status: 'not-found';
    };

export function normalizeInstructorName(name: string): string {
  return name
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-US');
}

export function lookupProfessor(
  dataset: LocalDataset,
  instructorName: string,
): ProfessorLookupResult {
  const trimmedName = instructorName.trim().replace(/\s+/g, ' ');
  const normalizedName = normalizeInstructorName(instructorName);

  if (!normalizedName) {
    return {
      status: 'not-found',
    };
  }

  const matches: Array<{
    readonly matchMethod: ProfessorMatchMethod;
    readonly record: ProfessorRecord;
  }> = [];

  for (const record of dataset.professors) {
    let matchMethod: ProfessorMatchMethod | null = null;

    if (record.displayName === trimmedName) {
      matchMethod = 'exact';
    } else if (
      normalizeInstructorName(record.displayName) === normalizedName
    ) {
      matchMethod = 'normalized';
    } else if (
      record.aliases.some((alias) => {
        return normalizeInstructorName(alias) === normalizedName;
      })
    ) {
      matchMethod = 'known-alias';
    }

    if (matchMethod) {
      matches.push({
        matchMethod,
        record,
      });
    }
  }

  if (matches.length === 0) {
    return {
      status: 'not-found',
    };
  }

  if (matches.length > 1) {
    return {
      status: 'ambiguous',
      candidates: matches.map((match) => match.record),
    };
  }

  return {
    status: 'found',
    matchMethod: matches[0].matchMethod,
    record: matches[0].record,
  };
}

export function lookupHistoricalCourseGrades(
  dataset: LocalDataset,
  professorId: string,
  subjectCode: string,
  catalogNumber: string,
): CourseGradeLookupResult {
  const normalizedSubjectCode = subjectCode.trim().toUpperCase();
  const normalizedCatalogNumber = catalogNumber.trim().toUpperCase();

  const matches = dataset.historicalCourseGrades.filter((record) => {
    return (
      record.professorId === professorId &&
      record.subjectCode.trim().toUpperCase() ===
        normalizedSubjectCode &&
      record.catalogNumber.trim().toUpperCase() ===
        normalizedCatalogNumber
    );
  });

  if (matches.length === 0) {
    return {
      status: 'not-found',
    };
  }

  if (matches.length > 1) {
    return {
      status: 'ambiguous',
      candidates: matches,
    };
  }

  return {
    status: 'found',
    record: matches[0],
  };
}
