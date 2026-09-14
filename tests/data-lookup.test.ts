import { describe, expect, it } from 'vitest';
import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
  normalizeInstructorName,
} from '../src/data/lookup';
import { MOCK_DATASET } from '../src/data/mock-dataset';
import type {
  LocalDataset,
  ProfessorRecord,
} from '../src/data/types';

function createProfessor(
  id: string,
  displayName: string,
  aliases: readonly string[] = [],
): ProfessorRecord {
  return {
    id,
    displayName,
    aliases,
    rating: null,
  };
}

describe('normalizeInstructorName', () => {
  it('normalizes case and repeated whitespace', () => {
    expect(
      normalizeInstructorName('  LIBBY   Butler  '),
    ).toBe('libby butler');
  });

  it('preserves punctuation instead of guessing name order', () => {
    expect(
      normalizeInstructorName('Butler, Libby'),
    ).toBe('butler, libby');
  });
});

describe('lookupProfessor', () => {
  it('finds an exact canonical name', () => {
    const result = lookupProfessor(
      MOCK_DATASET,
      'Libby Butler',
    );

    expect(result.status).toBe('found');

    if (result.status === 'found') {
      expect(result.matchMethod).toBe('exact');
      expect(result.record.id).toBe('demo-libby-butler');
    }
  });

  it('finds a conservatively normalized name', () => {
    const result = lookupProfessor(
      MOCK_DATASET,
      '  libby   butler ',
    );

    expect(result.status).toBe('found');

    if (result.status === 'found') {
      expect(result.matchMethod).toBe('normalized');
    }
  });

  it('finds an explicitly listed alias', () => {
    const result = lookupProfessor(
      MOCK_DATASET,
      'Butler, Libby',
    );

    expect(result.status).toBe('found');

    if (result.status === 'found') {
      expect(result.matchMethod).toBe('known-alias');
    }
  });

  it('returns not-found for an unknown instructor', () => {
    expect(
      lookupProfessor(MOCK_DATASET, 'Unknown Instructor'),
    ).toEqual({
      status: 'not-found',
    });
  });

  it('refuses to choose between ambiguous records', () => {
    const ambiguousDataset: LocalDataset = {
      ...MOCK_DATASET,
      professors: [
        createProfessor('alex-kim-one', 'Alex Kim'),
        createProfessor('alex-kim-two', 'Alex Kim'),
      ],
    };

    const result = lookupProfessor(
      ambiguousDataset,
      'Alex Kim',
    );

    expect(result.status).toBe('ambiguous');

    if (result.status === 'ambiguous') {
      expect(result.candidates).toHaveLength(2);
    }
  });
});

describe('lookupHistoricalCourseGrades', () => {
  it('finds grades for an exact course and professor', () => {
    const result = lookupHistoricalCourseGrades(
      MOCK_DATASET,
      'demo-libby-butler',
      'AAS',
      '010R',
    );

    expect(result.status).toBe('found');

    if (result.status === 'found') {
      expect(result.record.averageGpa).toBe(3.42);
      expect(result.record.sampleSize).toBe(120);
    }
  });

  it('returns not-found for a different course', () => {
    expect(
      lookupHistoricalCourseGrades(
        MOCK_DATASET,
        'demo-libby-butler',
        'AAS',
        '170',
      ),
    ).toEqual({
      status: 'not-found',
    });
  });

  it('refuses to choose between duplicate grade records', () => {
    const firstRecord =
      MOCK_DATASET.historicalCourseGrades[0];

    const ambiguousDataset: LocalDataset = {
      ...MOCK_DATASET,
      historicalCourseGrades: [
        firstRecord,
        {
          ...firstRecord,
          averageGpa: 3.5,
        },
      ],
    };

    const result = lookupHistoricalCourseGrades(
      ambiguousDataset,
      firstRecord.professorId,
      firstRecord.subjectCode,
      firstRecord.catalogNumber,
    );

    expect(result.status).toBe('ambiguous');
  });
});
