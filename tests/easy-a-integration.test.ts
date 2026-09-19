import { describe, expect, it } from 'vitest';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
} from '../src/data/lookup';
import { validateLocalDataset } from '../src/data/validation';

describe('generated Easy-A development dataset', () => {
  it('passes the TritonLens validation gate', () => {
    expect(validateLocalDataset(EASY_A_DATASET)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it('matches the live TSS Libby Butler identity safely', () => {
    const result = lookupProfessor(
      EASY_A_DATASET,
      'Libby Butler',
    );

    expect(result.status).toBe('found');

    if (result.status === 'found') {
      expect(result.matchMethod).toBe('known-alias');
      expect(result.record.rating?.overallRating).toBe(2.7);
      expect(result.record.rating?.sourceProfessorId).toBe(
        '1410511',
      );
    }
  });

  it('matches TSS AAS-010R to its historical grade record', () => {
    const professor = lookupProfessor(
      EASY_A_DATASET,
      'Libby Butler',
    );

    if (professor.status !== 'found') {
      throw new Error('Expected Libby Butler to resolve');
    }

    const grades = lookupHistoricalCourseGrades(
      EASY_A_DATASET,
      professor.record.id,
      'AAS',
      '010R',
    );

    expect(grades.status).toBe('found');

    if (grades.status === 'found') {
      expect(grades.record.averageGpa).toBe(3.444);
      expect(grades.record.sampleSize).toBeNull();
      expect(grades.record.offeringCount).toBe(4);
    }
  });

  it('preserves a rating-only professor without inventing grades', () => {
    const professor = lookupProfessor(
      EASY_A_DATASET,
      'Adalbert Gerald Soosai Raj',
    );

    expect(professor.status).toBe('found');
    if (professor.status === 'found') {
      expect(professor.record.rating).not.toBeNull();
      expect(
        EASY_A_DATASET.historicalCourseGrades.some(
          (record) => record.professorId === professor.record.id,
        ),
      ).toBe(false);
    }
  });

  it('preserves grade-only data without inventing a professor rating', () => {
    const professor = lookupProfessor(
      EASY_A_DATASET,
      'Marco Octavio Aburto Oropeza',
    );

    expect(professor.status).toBe('found');
    if (professor.status !== 'found') {
      return;
    }

    expect(professor.record.rating).toBeNull();
    expect(
      lookupHistoricalCourseGrades(
        EASY_A_DATASET,
        professor.record.id,
        'SIO',
        '003',
      ),
    ).toMatchObject({
      status: 'found',
      record: {
        averageGpa: 3.546,
        offeringCount: 8,
      },
    });
  });

  it('preserves an explicit neither-data state', () => {
    const professor = lookupProfessor(
      EASY_A_DATASET,
      'Aaron Boussina',
    );

    expect(professor.status).toBe('found');
    if (professor.status === 'found') {
      expect(professor.record.rating).toBeNull();
      expect(
        EASY_A_DATASET.historicalCourseGrades.some(
          (record) => record.professorId === professor.record.id,
        ),
      ).toBe(false);
    }
  });

  it('uses the independently reviewed Keolu Fox identity', () => {
    expect(lookupProfessor(EASY_A_DATASET, 'Keolu Fox')).toMatchObject({
      status: 'found',
      record: { rating: { sourceProfessorId: '2778643' } },
    });
  });
});
