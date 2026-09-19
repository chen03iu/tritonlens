import { describe, expect, it } from 'vitest';
import { consolidateCurrentInstructorStubs } from '../src/data/consolidate-current-instructor-stubs';
import currentInstructorEvidence from '../src/data/current-instructor-evidence.generated.json';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import { lookupProfessor } from '../src/data/lookup';
import type { HistoricalCourseGradeRecord, LocalDataset, ProfessorRecord } from '../src/data/types';

const professor = (id: string, displayName: string, aliases: string[] = []): ProfessorRecord => ({
  id, displayName, aliases, rating: null,
});

const grade = (professorId: string, subjectCode = 'TEST'): HistoricalCourseGradeRecord => ({
  professorId, subjectCode, catalogNumber: '1', averageGpa: 3.4, sampleSize: null,
  offeringCount: 2, sourceId: 'grades', updatedAt: '2026-07-23',
  gradeDistribution: {
    aPercent: null, bPercent: null, cPercent: null, dPercent: null,
    fPercent: null, wPercent: null, pPercent: null, npPercent: null,
  },
});

const fixture = (): LocalDataset => ({
  schemaVersion: 1,
  kind: 'development',
  sources: [],
  professors: [
    professor('stub', 'Example Person'),
    professor('canonical', 'Person, Example Middle', ['Example Middle Person']),
  ],
  historicalCourseGrades: [grade('canonical')],
});

const evidence = [{ name: 'Example Person', courses: ['TEST 100', 'OTHER 2'] }] as const;

describe('current-instructor stub consolidation', () => {
  it('merges one empty short-name stub into a fuller identity with same-subject history', () => {
    const input = fixture();
    const before = structuredClone(input);
    const result = consolidateCurrentInstructorStubs(input, evidence);

    expect(result.professors).toHaveLength(1);
    expect(lookupProfessor(result, 'Example Person')).toMatchObject({
      status: 'found', record: { id: 'canonical', aliases: expect.arrayContaining(['Example Person']) },
    });
    expect(result.historicalCourseGrades).toEqual(input.historicalCourseGrades);
    expect(input).toEqual(before);
    expect(consolidateCurrentInstructorStubs(result, evidence)).toEqual(result);
  });

  it.each([
    ['no shared subject', (input: LocalDataset) => ({ ...input, historicalCourseGrades: [grade('canonical', 'DIFFERENT')] })],
    ['stub rating', (input: LocalDataset) => ({
      ...input,
      professors: input.professors.map(record => record.id === 'stub' ? {
        ...record,
        rating: { overallRating: 4, difficulty: 3, ratingCount: 2, wouldTakeAgainPercent: 50,
          sourceId: 'rmp', updatedAt: '2026-07-23', sourceProfessorId: '123' },
      } : record),
    })],
    ['stub alias', (input: LocalDataset) => ({
      ...input,
      professors: input.professors.map(record => record.id === 'stub' ? { ...record, aliases: ['Another Name'] } : record),
    })],
    ['stub history', (input: LocalDataset) => ({ ...input, historicalCourseGrades: [...input.historicalCourseGrades, grade('stub')] })],
    ['second fuller candidate', (input: LocalDataset) => ({
      ...input,
      professors: [...input.professors, professor('other', 'Person, Example Another')],
      historicalCourseGrades: [...input.historicalCourseGrades, grade('other')],
    })],
    ['non-development data', (input: LocalDataset) => ({ ...input, kind: 'production' as const })],
  ] as const)('fails closed for %s', (_label, change) => {
    const input = change(fixture());
    expect(consolidateCurrentInstructorStubs(input, evidence)).toBe(input);
  });

  it('does not infer a different first or last name', () => {
    const input = fixture();
    expect(consolidateCurrentInstructorStubs(input, [{ name: 'Other Person', courses: ['TEST 100'] }])).toBe(input);
    expect(consolidateCurrentInstructorStubs(input, [{ name: 'Example Different', courses: ['TEST 100'] }])).toBe(input);
  });

  it('accepts an exact full-name reversal without subject inference', () => {
    const input: LocalDataset = {
      ...fixture(),
      professors: [
        professor('stub', 'Example Middle Person'),
        professor('canonical', 'Person, Example Middle'),
      ],
      historicalCourseGrades: [grade('canonical', 'DIFFERENT')],
    };
    expect(consolidateCurrentInstructorStubs(input, [{ name: 'Example Middle Person', courses: ['TEST 100'] }]))
      .toMatchObject({ professors: [{ id: 'canonical', aliases: ['Example Middle Person'] }] });
  });

  it('resolves every generated high-confidence current-instructor stub', () => {
    expect(currentInstructorEvidence.entries).toHaveLength(170);
    for (const item of currentInstructorEvidence.entries) {
      expect(lookupProfessor(EASY_A_DATASET, item.name), item.name).toMatchObject({
        status: 'found', record: { displayName: expect.stringContaining(',') },
      });
    }
  });
});
