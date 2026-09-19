import { describe, expect, it } from 'vitest';
import { auditInstructors } from '../src/data/instructor-audit';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import { lookupProfessor, lookupHistoricalCourseGrades } from '../src/data/lookup';
import type { LocalDataset, ProfessorRecord } from '../src/data/types';

const professor = (id: string, displayName: string, aliases: string[] = []): ProfessorRecord => ({ id, displayName, aliases, rating: null });
const dataset = (professors: ProfessorRecord[]): LocalDataset => ({ schemaVersion: 1, kind: 'development', sources: [], professors, historicalCourseGrades: [] });

describe('offline instructor audit', () => {
  it('discovers shortened forms from comma-form aliases as well as canonical names', () => {
    expect(auditInstructors(dataset([professor('full', 'Example Middle Person', ['Person, Example Middle'])]), {
      'TEST 1': ['Example Person'],
    })).toMatchObject([{ status: 'needs-evidence', candidates: [{ id: 'full' }] }]);
  });

  it('marks additional plausible identities for review even when strict lookup succeeds', () => {
    const records = [professor('one', 'Example Person'), professor('two', 'Person, Example Middle')];
    records[0] = { ...records[0], rating: { overallRating: 4, difficulty: null, ratingCount: 1, wouldTakeAgainPercent: null, sourceId: 'rmp', updatedAt: '2026-07-23', sourceProfessorId: '123' } };
    const input = dataset(records);
    expect(auditInstructors(input, { 'TEST 1': ['Example Person'] })).toMatchObject([{ status: 'matched', reviewRequired: true, candidates: [{ id: 'one' }, { id: 'two' }] }]);
  });
  it('reports a missing shortened alias without accepting a unique candidate', () => {
    const input = dataset([professor('full', 'Delson, Nathan Joseph', ['Nathan Joseph Delson'])]);
    const before = JSON.stringify(input);
    expect(auditInstructors(input, { 'MAE 3': ['Nathan Delson'] })).toMatchObject([
      { name: 'Nathan Delson', courses: ['MAE 3'], status: 'needs-evidence', candidates: [{ id: 'full', displayName: 'Delson, Nathan Joseph' }] },
    ]);
    expect(JSON.stringify(input)).toBe(before);
    expect(lookupProfessor(input, 'Nathan Delson').status).toBe('not-found');
  });

  it('keeps two plausible canonical identities ambiguous', () => {
    const input = dataset([professor('one', 'Kim, Alex Joseph'), professor('two', 'Kim, Alex Jane')]);
    expect(auditInstructors(input, { 'TEST 1': ['Alex Kim'] })).toMatchObject([
      { status: 'ambiguous', candidates: [{ id: 'one' }, { id: 'two' }] },
    ]);
  });

  it('flags an empty exact record that hides another plausible record', () => {
    const input = dataset([professor('stub', 'Isabella Maita'), professor('full', 'Maita, Isabella Vincenza')]);
    expect(auditInstructors(input, { 'AIP 197': ['Isabella Maita'] })).toMatchObject([
      { status: 'ambiguous', candidates: [{ id: 'stub' }, { id: 'full' }] },
    ]);
    expect(input.professors).toHaveLength(2);
  });

  it('reports accent and hyphen variants as evidence needed, not automatic aliases', () => {
    expect(auditInstructors(dataset([professor('daphne', 'Taylor-Garcia, Daphne', ['Daphne Taylor-Garcia'])]), {
      'ETHN 2': ['Daphne Taylor García'],
    })).toMatchObject([{ status: 'needs-evidence', candidates: [{ id: 'daphne' }] }]);
  });

  it('distinguishes matched empty data from no name candidate and deduplicates course names', () => {
    expect(auditInstructors(dataset([professor('empty', 'Known Person')]), {
      'TEST 1': ['Known Person', 'Known Person', 'Absent Person'], 'TEST 2': ['Known Person'],
    })).toMatchObject([
      { name: 'Absent Person', status: 'no-candidate', candidates: [] },
      { name: 'Known Person', courses: ['TEST 1', 'TEST 2'], status: 'matched', candidates: [{ hasRating: false, historicalCourses: [] }] },
    ]);
  });

  it('rejects malformed current-instructor input', () => {
    expect(() => auditInstructors(dataset([]), { 'TEST 1': 'Someone' } as never)).toThrow();
  });

  it('resolves the reviewed Nathan short name to existing MAE 3 history', () => {
    const match = lookupProfessor(EASY_A_DATASET, 'Nathan Delson');
    expect(match.status).toBe('found');
    if (match.status !== 'found') return;
    expect(match.record.id).toBe('easy-a-delson-nathan-joseph-e5b4df8331');
    expect(match.record.rating).toMatchObject({ overallRating: 3.2, ratingCount: 42, sourceProfessorId: '258679' });
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, match.record.id, 'MAE', '003')).toMatchObject({ status: 'found', record: { averageGpa: 3.411, offeringCount: 10 } });
  });
});
