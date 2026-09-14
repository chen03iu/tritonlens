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
});
