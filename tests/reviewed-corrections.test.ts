import { describe, expect, it } from 'vitest';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import { lookupHistoricalCourseGrades, lookupProfessor } from '../src/data/lookup';
import { validateLocalDataset } from '../src/data/validation';
import { applyReviewedCorrections } from '../src/data/reviewed-corrections';
import type { LocalDataset, ProfessorRecord } from '../src/data/types';

function fixture(): LocalDataset {
  return {
    schemaVersion: 1, kind: 'development', sources: [], historicalCourseGrades: [],
    professors: [{ id: 'easy-a-shalev-aaron-d-1ef0bedf0d', displayName: 'Shalev, Aaron D', aliases: ['Aaron D Shalev'], rating: null }],
  };
}

describe('reviewed instructor corrections', () => {
  it.each([
    ['Miles Jones', 'Jones, Miles E'],
    ['Miles Eli Jones', 'Jones, Miles E'],
    ['Linnea Wilder', 'Wilder, Linnea Lorene'],
    ['Linnea L. Wilder', 'Wilder, Linnea Lorene'],
    ['Aaron Shalev', 'Shalev, Aaron D'],
    ['Aaron Schulman', 'Shalev, Aaron D'],
    ['Aron Shalev', 'Shalev, Aaron D'],
    ['Aaron Shaleve', 'Shalev, Aaron D'],
  ])('resolves documented name %s to %s', (name, canonical) => {
    expect(lookupProfessor(EASY_A_DATASET, name)).toMatchObject({
      status: 'found', matchMethod: 'known-alias', record: { displayName: canonical },
    });
  });

  it.each([
    ['Miles Jones', '021', 3.138, 18],
    ['Aaron Shalev', '029', 2.794, 3],
  ] as const)('restores course-specific history for %s', (name, course, gpa, offerings) => {
    const professor = lookupProfessor(EASY_A_DATASET, name);
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'CSE', course)).toMatchObject({
      status: 'found', record: { averageGpa: gpa, offeringCount: offerings, sampleSize: null },
    });
  });

  it('adds Aaron profile totals with separate provenance and observation date', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Aaron D Shalev');
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(professor.record.rating).toEqual({
      overallRating: 5, difficulty: 3, ratingCount: 3, wouldTakeAgainPercent: 100,
      sourceId: 'reviewed-aaron-rmp', updatedAt: '2026-09-15', sourceProfessorId: '3050657',
    });
  });

  it('restores Linnea ANTH 002 grades without altering snapshot metrics', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Linnea Wilder');
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(professor.record.rating).toMatchObject({
      overallRating: 3.8, difficulty: 2.5, ratingCount: 56, wouldTakeAgainPercent: 75,
      sourceId: 'easy-a-radar-rmp', updatedAt: '2026-07-23', sourceProfessorId: '2470718',
    });
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'ANTH', '002')).toMatchObject({
      status: 'found', record: { averageGpa: 2.992, offeringCount: 7, sampleSize: null },
    });
  });

  it('keeps the manually reviewed rating pending and blocked for production', () => {
    expect(EASY_A_DATASET.sources.find(source => source.id === 'reviewed-aaron-rmp')).toMatchObject({
      homepageUrl: 'https://www.ratemyprofessors.com/professor/3050657',
      permissionStatus: 'pending', retrievedAt: '2026-09-15',
      label: expect.stringContaining('Extended Studies'),
    });
    expect(validateLocalDataset({ ...EASY_A_DATASET, kind: 'production' }).issues).toEqual(
      expect.arrayContaining([expect.objectContaining({
        code: 'source-not-approved', message: expect.stringContaining('reviewed-aaron-rmp'),
      })]),
    );
  });

  it.each(['mock', 'production'] as const)('does not inject development corrections into %s data', kind => {
    const dataset = { ...fixture(), kind };
    expect(applyReviewedCorrections(dataset)).toBe(dataset);
  });

  it('does not choose between duplicated canonical identities', () => {
    const dataset = fixture();
    const duplicate = { ...dataset.professors[0], id: 'another-aaron' };
    const corrected = applyReviewedCorrections({ ...dataset, professors: [...dataset.professors, duplicate] });
    expect(lookupProfessor(corrected, 'Aaron Schulman').status).toBe('not-found');
    expect(corrected.professors.every(professor => professor.rating === null)).toBe(true);
  });

  it('requires the reviewed ID, not just a matching display name', () => {
    const dataset = fixture();
    const corrected = applyReviewedCorrections({ ...dataset, professors: [{ ...dataset.professors[0], id: 'unreviewed-aaron' }] });
    expect(lookupProfessor(corrected, 'Aaron Schulman').status).toBe('not-found');
    expect(corrected.sources).toEqual([]);
  });

  it('preserves a newer upstream rating rather than overwriting it', () => {
    const dataset = fixture();
    const upstream = { overallRating: 4.5, difficulty: 3.5, ratingCount: 4, wouldTakeAgainPercent: 100,
      sourceId: 'upstream', updatedAt: '2026-09-16', sourceProfessorId: '3050657' };
    const corrected = applyReviewedCorrections({ ...dataset, professors: [{ ...dataset.professors[0], rating: upstream }] });
    expect(corrected.professors[0].rating).toBe(upstream);
    expect(corrected.sources).toEqual([]);
  });

  it('does not reassign a profile already attached to another identity', () => {
    const dataset = fixture();
    const another: ProfessorRecord = { id: 'other', displayName: 'Other Instructor', aliases: [],
      rating: { overallRating: 2, difficulty: null, ratingCount: 1, wouldTakeAgainPercent: null,
        sourceId: 'other-source', updatedAt: '2026-09-15', sourceProfessorId: '3050657' } };
    const corrected = applyReviewedCorrections({ ...dataset, professors: [...dataset.professors, another] });
    expect(corrected.professors[0].rating).toBeNull();
    expect(corrected.professors[1]).toBe(another);
  });

  it('is repeatable without mutating input or duplicating aliases and sources', () => {
    const dataset = fixture();
    const before = structuredClone(dataset);
    const once = applyReviewedCorrections(dataset);
    expect(applyReviewedCorrections(once)).toEqual(once);
    expect(dataset).toEqual(before);
    expect(once.sources).toHaveLength(1);
    expect(once.professors[0].aliases.filter(alias => alias === 'Aaron Schulman')).toHaveLength(1);
  });

  it('keeps alias collisions ambiguous instead of selecting the reviewed candidate', () => {
    const dataset = fixture();
    const another: ProfessorRecord = { id: 'other', displayName: 'Different Person', aliases: ['Aaron Schulman'], rating: null };
    const corrected = applyReviewedCorrections({ ...dataset, professors: [...dataset.professors, another] });
    expect(lookupProfessor(corrected, 'Aaron Schulman').status).toBe('ambiguous');
  });
});
