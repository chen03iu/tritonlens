import { describe, expect, it } from 'vitest';
import rawDataset from '../src/data/easy-a-dataset.generated.json';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import { applyReviewedCorrections } from '../src/data/reviewed-corrections';
import { lookupHistoricalCourseGrades, lookupProfessor } from '../src/data/lookup';
import type { LocalDataset } from '../src/data/types';

const source = rawDataset as unknown as LocalDataset;
const shortId = 'easy-a-isabella-maita-1cf20dd783';
const fullId = 'easy-a-maita-isabella-vincenza-4852998842';

describe('reviewed name variants and empty duplicate consolidation', () => {
  it.each(['Daphne Taylor García', 'Daphne Taylor Garcia', 'Daphne Taylor-García'])(
    'resolves Daphne variant %s without replacing source metrics', name => {
      expect(lookupProfessor(EASY_A_DATASET, name)).toMatchObject({
        status: 'found', record: { displayName: 'Taylor-Garcia, Daphne',
          rating: { overallRating: 4.2, sourceProfessorId: '1850822' } },
      });
    },
  );

  it('resolves Isabella short name to her reviewed full-name identity', () => {
    expect(lookupProfessor(EASY_A_DATASET, 'Isabella Maita')).toMatchObject({
      status: 'found', record: { id: fullId, rating: {
        overallRating: 4, difficulty: 3.6, ratingCount: 38,
        wouldTakeAgainPercent: 76, sourceId: 'easy-a-radar-rmp',
      } },
    });
    expect(EASY_A_DATASET.professors.some(professor => professor.id === shortId)).toBe(false);
  });

  it('retains Isabella biology history without inventing AIP 197 grades', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Isabella Maita');
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'BIPN', '100')).toMatchObject({
      status: 'found', record: { averageGpa: 2.839, offeringCount: 7 },
    });
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'AIP', '197').status).toBe('not-found');
  });

  it('keeps Daphne AIP history unavailable instead of substituting ETHN grades', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Daphne Taylor García');
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'AIP', '197').status).toBe('not-found');
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'ETHN', '002')).toMatchObject({
      status: 'found', record: { averageGpa: 3.766 },
    });
  });

  it('preserves a formerly empty record when it gains a rating', () => {
    const rated = source.professors.find(professor => professor.id === fullId)!;
    const dataset = { ...source, professors: source.professors.map(professor =>
      professor.id === shortId ? { ...professor, rating: rated.rating } : professor) };
    expect(applyReviewedCorrections(dataset).professors.find(professor => professor.id === shortId)?.rating).toBe(rated.rating);
  });

  it('preserves a formerly empty record when it gains historical data', () => {
    const history = source.historicalCourseGrades.find(record => record.professorId === fullId)!;
    const dataset = { ...source, historicalCourseGrades: [...source.historicalCourseGrades,
      { ...history, professorId: shortId, subjectCode: 'AIP', catalogNumber: '197' }] };
    const corrected = applyReviewedCorrections(dataset);
    expect(corrected.professors.some(professor => professor.id === shortId)).toBe(true);
    expect(lookupProfessor(corrected, 'Isabella Maita')).toMatchObject({ status: 'found', record: { id: shortId } });
  });

  it('does not mutate source data and is idempotent after consolidation', () => {
    const before = structuredClone(source);
    const corrected = applyReviewedCorrections(source);
    expect(corrected.professors.some(professor => professor.id === shortId)).toBe(false);
    expect(source.professors.find(professor => professor.id === shortId)?.aliases).toEqual([]);
    expect(applyReviewedCorrections(corrected)).toEqual(corrected);
    expect(corrected.historicalCourseGrades).toHaveLength(source.historicalCourseGrades.length);
    expect(source).toEqual(before);
  });
});
