import type { LocalDataset } from './types';

export type DatasetValidationIssueCode =
  | 'unknown-source'
  | 'source-not-approved'
  | 'mock-source-in-production'
  | 'invalid-number'
  | 'invalid-date'
  | 'duplicate-source-id'
  | 'duplicate-professor-id'
  | 'invalid-history'
  | 'unknown-professor';

export interface DatasetValidationIssue {
  readonly code: DatasetValidationIssueCode;
  readonly path: string;
  readonly message: string;
}

export interface DatasetValidationResult {
  readonly valid: boolean;
  readonly issues: readonly DatasetValidationIssue[];
}

function isRealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateLocalDataset(
  dataset: LocalDataset,
): DatasetValidationResult {
  const issues: DatasetValidationIssue[] = [];
  const sourcesById = new Map(
    dataset.sources.map((source) => [source.id, source]),
  );

  const addInvalidNumber = (path: string, message: string): void => {
    issues.push({
      code: 'invalid-number',
      path,
      message,
    });
  };

  const validateDate = (value: string, path: string): void => {
    if (!isRealDate(value)) {
      issues.push({
        code: 'invalid-date',
        path,
        message: 'Expected a real calendar date in YYYY-MM-DD format.',
      });
    }
  };

  const validateSourceReference = (
    sourceId: string,
    path: string,
  ): void => {
    const source = sourcesById.get(sourceId);

    if (!source) {
      issues.push({
        code: 'unknown-source',
        path,
        message: `Source "${sourceId}" is not declared.`,
      });
      return;
    }

    if (dataset.kind !== 'production') {
      return;
    }

    if (source.category === 'mock') {
      issues.push({
        code: 'mock-source-in-production',
        path,
        message: `Production data cannot use mock source "${sourceId}".`,
      });
      return;
    }

    if (source.permissionStatus !== 'approved') {
      issues.push({
        code: 'source-not-approved',
        path,
        message:
          `Production data cannot use ${source.permissionStatus} source ` +
          `"${sourceId}".`,
      });
    }
  };

  const seenSourceIds = new Set<string>();
  dataset.sources.forEach((source, index) => {
    if (seenSourceIds.has(source.id)) {
      issues.push({
        code: 'duplicate-source-id',
        path: `sources[${index}].id`,
        message: `Source ID "${source.id}" is duplicated.`,
      });
    }

    seenSourceIds.add(source.id);

    if (source.retrievedAt !== null) {
      validateDate(source.retrievedAt, `sources[${index}].retrievedAt`);
    }
  });

  const seenProfessorIds = new Set<string>();
  dataset.professors.forEach((professor, index) => {
    if (seenProfessorIds.has(professor.id)) {
      issues.push({
        code: 'duplicate-professor-id',
        path: `professors[${index}].id`,
        message: `Professor ID "${professor.id}" is duplicated.`,
      });
    }

    seenProfessorIds.add(professor.id);

    const rating = professor.rating;
    if (!rating) {
      return;
    }

    const path = `professors[${index}].rating`;
    validateSourceReference(rating.sourceId, `${path}.sourceId`);
    validateDate(rating.updatedAt, `${path}.updatedAt`);

    if (
      !Number.isFinite(rating.overallRating) ||
      rating.overallRating < 0 ||
      rating.overallRating > 5
    ) {
      addInvalidNumber(
        `${path}.overallRating`,
        'Overall rating must be between 0 and 5.',
      );
    }

    if (
      rating.difficulty !== null &&
      (!Number.isFinite(rating.difficulty) ||
        rating.difficulty < 0 ||
        rating.difficulty > 5)
    ) {
      addInvalidNumber(
        `${path}.difficulty`,
        'Difficulty must be null or between 0 and 5.',
      );
    }

    if (
      !Number.isInteger(rating.ratingCount) ||
      rating.ratingCount < 0
    ) {
      addInvalidNumber(
        `${path}.ratingCount`,
        'Rating count must be a nonnegative integer.',
      );
    }

    if (
      rating.wouldTakeAgainPercent !== null &&
      (!Number.isFinite(rating.wouldTakeAgainPercent) ||
        rating.wouldTakeAgainPercent < 0 ||
        rating.wouldTakeAgainPercent > 100)
    ) {
      addInvalidNumber(
        `${path}.wouldTakeAgainPercent`,
        'Would-take-again percentage must be null or between 0 and 100.',
      );
    }
  });

  dataset.historicalCourseGrades.forEach((record, index) => {
    const path = `historicalCourseGrades[${index}]`;
    if (!seenProfessorIds.has(record.professorId)) {
      issues.push({code:'unknown-professor',path:`${path}.professorId`,message:'Historical record references an unknown professor.'});
    }
    validateSourceReference(record.sourceId, `${path}.sourceId`);
    validateDate(record.updatedAt, `${path}.updatedAt`);

    if (
      record.averageGpa !== null && (!Number.isFinite(record.averageGpa) ||
      record.averageGpa < 0 ||
      record.averageGpa > 4)
    ) {
      addInvalidNumber(
        `${path}.averageGpa`,
        'Average GPA must be null or between 0 and 4.',
      );
    }

    if (
      record.sampleSize !== null &&
      (!Number.isInteger(record.sampleSize) || record.sampleSize <= 0)
    ) {
      addInvalidNumber(
        `${path}.sampleSize`,
        'Sample size must be a positive integer.',
      );
    }

    if (
      !Number.isInteger(record.offeringCount) ||
      record.offeringCount <= 0
    ) {
      addInvalidNumber(
        `${path}.offeringCount`,
        'Offering count must be a positive integer.',
      );
    }

    Object.entries(record.gradeDistribution).forEach(
      ([key, value]) => {
        if (
          value !== null &&
          (!Number.isFinite(value) || value < 0 || value > 100)
        ) {
          addInvalidNumber(
            `${path}.gradeDistribution.${key}`,
            'Grade percentage must be null or between 0 and 100.',
          );
        }
      },
    );
    if (record.terms !== undefined) {
      const fields=['aPercent','bPercent','cPercent','dPercent','fPercent','wPercent','pPercent','npPercent'] as const;
      const quarters=['WI','SP','S1','SU','S2','FA'];
      const seen=new Set<string>();
      let previous=Infinity;
      let invalid=!Array.isArray(record.terms)||!record.terms.length||record.offeringCount!==record.terms.length||record.sampleSize!==null;
      for (const term of record.terms) {
        const key=`${term.year}-${term.quarter}`;
        const rank=term.year*10+quarters.indexOf(term.quarter);
        if (!Number.isInteger(term.year)||term.year<1900||term.year>2100||!quarters.includes(term.quarter)
          ||seen.has(key)||rank>=previous
          ||(term.averageGpa!==null&&(!Number.isFinite(term.averageGpa)||term.averageGpa<0||term.averageGpa>4))
          ||!term.gradeDistribution||fields.some(field=>term.gradeDistribution[field]!==null&&(!Number.isFinite(term.gradeDistribution[field])||term.gradeDistribution[field]!<0||term.gradeDistribution[field]!>100))) invalid=true;
        seen.add(key);previous=rank;
      }
      const latest=record.terms[0];
      if (!latest||latest.averageGpa!==record.averageGpa||fields.some(field=>latest.gradeDistribution?.[field]!==record.gradeDistribution[field])) invalid=true;
      if (invalid) issues.push({code:'invalid-history',path:`${path}.terms`,message:'Terms must be unique, newest first, valid, and agree with the latest-term summary.'});
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}
