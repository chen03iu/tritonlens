import { describe, expect, it } from 'vitest';
import { MOCK_DATASET } from '../src/data/mock-dataset';
import type { LocalDataset } from '../src/data/types';
import { validateLocalDataset } from '../src/data/validation';

describe('validateLocalDataset', () => {
  it('accepts the fictional development dataset', () => {
    expect(validateLocalDataset(MOCK_DATASET)).toEqual({
      valid: true,
      issues: [],
    });
  });

  it('rejects records that reference an unknown source', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            sourceId: 'missing-source',
          },
        },
      ],
    };

    expect(validateLocalDataset(dataset).issues).toContainEqual({
      code: 'unknown-source',
      path: 'professors[0].rating.sourceId',
      message: 'Source "missing-source" is not declared.',
    });
  });

  it('rejects production records from unapproved sources', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      kind: 'production',
      sources: [
        {
          ...MOCK_DATASET.sources[0],
          id: 'pending-ratings',
          category: 'professor-ratings',
          permissionStatus: 'pending',
        },
      ],
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            sourceId: 'pending-ratings',
          },
        },
      ],
      historicalCourseGrades: [],
    };

    expect(validateLocalDataset(dataset).issues).toContainEqual({
      code: 'source-not-approved',
      path: 'professors[0].rating.sourceId',
      message: 'Production data cannot use pending source "pending-ratings".',
    });
  });

  it('rejects mock sources in production datasets', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      kind: 'production',
    };

    expect(validateLocalDataset(dataset).issues).toContainEqual({
      code: 'mock-source-in-production',
      path: 'professors[0].rating.sourceId',
      message: 'Production data cannot use mock source "tritonlens-fictional-demo".',
    });
  });

  it('rejects ratings outside their valid ranges', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            overallRating: 5.1,
            difficulty: -1,
            ratingCount: -2,
            wouldTakeAgainPercent: 101,
          },
        },
      ],
    };

    expect(validateLocalDataset(dataset).issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining([
        'professors[0].rating.overallRating',
        'professors[0].rating.difficulty',
        'professors[0].rating.ratingCount',
        'professors[0].rating.wouldTakeAgainPercent',
      ]),
    );
  });

  it('rejects invalid historical grade metrics', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      historicalCourseGrades: [
        {
          ...MOCK_DATASET.historicalCourseGrades[0],
          averageGpa: 4.1,
          sampleSize: 0,
          offeringCount: 1.5,
        },
      ],
    };

    expect(validateLocalDataset(dataset).issues.map((issue) => issue.path)).toEqual(
      expect.arrayContaining([
        'historicalCourseGrades[0].averageGpa',
        'historicalCourseGrades[0].sampleSize',
        'historicalCourseGrades[0].offeringCount',
      ]),
    );
  });

  it('rejects impossible calendar dates', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            updatedAt: '2026-02-30',
          },
        },
      ],
    };

    expect(validateLocalDataset(dataset).issues).toContainEqual({
      code: 'invalid-date',
      path: 'professors[0].rating.updatedAt',
      message: 'Expected a real calendar date in YYYY-MM-DD format.',
    });
  });

  it('rejects duplicate source and professor IDs', () => {
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      sources: [MOCK_DATASET.sources[0], MOCK_DATASET.sources[0]],
      professors: [MOCK_DATASET.professors[0], MOCK_DATASET.professors[0]],
    };

    expect(validateLocalDataset(dataset).issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['duplicate-source-id', 'duplicate-professor-id']),
    );
  });
});
