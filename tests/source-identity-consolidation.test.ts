import { expect, it } from 'vitest';
import { consolidateSourceIdentities } from '../src/data/consolidate-source-identities';
import { lookupProfessor, lookupHistoricalCourseGrades } from '../src/data/lookup';
import type { LocalDataset, ProfessorRecord } from '../src/data/types';

const rating = { overallRating: 4, difficulty: 3, ratingCount: 10, wouldTakeAgainPercent: 80, sourceId: 'snapshot', updatedAt: '2026-07-23', sourceProfessorId: '123' };
const canonical: ProfessorRecord = { id: 'canonical', displayName: 'Person, Example', aliases: ['Example Person'], rating };
const current: ProfessorRecord = { id: 'current', displayName: 'Example Person', aliases: [], rating };
const grade = { professorId: 'canonical', subjectCode: 'TEST', catalogNumber: '1', averageGpa: 3.4, sampleSize: null, offeringCount: 2, sourceId: 'grades', updatedAt: '2026-07-23', gradeDistribution: { aPercent: null, bPercent: null, cPercent: null, dPercent: null, fPercent: null, wPercent: null, pPercent: null, npPercent: null } };
const fixture = (): LocalDataset => ({ schemaVersion: 1, kind: 'development', sources: [], professors: [current, canonical], historicalCourseGrades: [grade] });

it('consolidates exact alias-linked duplicates with the same profile and preserves historical lookup', () => {
  const result = consolidateSourceIdentities(fixture());
  expect(result.professors).toHaveLength(1);
  expect(lookupProfessor(result, 'Example Person')).toMatchObject({ status: 'found', record: { id: 'canonical' } });
  expect(lookupHistoricalCourseGrades(result, 'canonical', 'TEST', '001')).toMatchObject({ status: 'found', record: { averageGpa: 3.4 } });
});

it('merges same-profile histories within one subject without dropping either row', () => {
  const input = fixture();
  const changed = { ...input, historicalCourseGrades: [grade, { ...grade, professorId: 'current', catalogNumber: '2' }] };
  const result = consolidateSourceIdentities(changed);
  expect(result.professors).toHaveLength(1);
  expect(result.historicalCourseGrades).toHaveLength(2);
  expect(result.historicalCourseGrades.every(record => record.professorId === 'canonical')).toBe(true);
});

it('does not merge separate RMP profiles with identical names', () => {
  const input = fixture();
  const result = consolidateSourceIdentities({ ...input, professors: [canonical, { ...current, rating: { ...rating, sourceProfessorId: '456' } }] });
  expect(result.professors).toHaveLength(2);
  expect(lookupProfessor(result, 'Example Person').status).toBe('ambiguous');
});

it('consolidates a shortened name when the exact same source profile links it', () => {
  const input = fixture();
  const result = consolidateSourceIdentities({
    ...input,
    professors: [{ ...canonical, displayName: 'Person, Example Middle', aliases: ['Example Middle Person'] }, current],
  });
  expect(result.professors).toHaveLength(1);
  expect(lookupProfessor(result, 'Example Person').status).toBe('found');
});

it('does not merge incompatible names merely because the source profile was reused', () => {
  const input = fixture();
  const unrelated = { ...current, displayName: 'Different Human', aliases: [] };
  expect(consolidateSourceIdentities({ ...input, professors: [canonical, unrelated] }).professors).toHaveLength(2);
});

it('preserves rating conflicts for review', () => {
  const input = fixture();
  const changed = { ...input, professors: [canonical, { ...current, rating: { ...rating, overallRating: 2 } }] };
  expect(consolidateSourceIdentities(changed)).toBe(changed);
});

it('leaves unlinked empty stubs and non-development datasets unchanged', () => {
  const input = fixture();
  const empty = { ...input, professors: [canonical, { ...current, rating: null }] };
  expect(consolidateSourceIdentities(empty)).toBe(empty);
  expect(consolidateSourceIdentities({ ...input, kind: 'production' }).professors).toHaveLength(2);
});

it('is pure and idempotent', () => {
  const input = fixture(); const before = JSON.stringify(input);
  const once = consolidateSourceIdentities(input);
  expect(JSON.stringify(input)).toBe(before);
  expect(consolidateSourceIdentities(once)).toEqual(once);
  expect(once.professors).toHaveLength(1);
});

it.each([
  { sourceProfessorId: null }, { sourceProfessorId: 'not-numeric' },
  { sourceId: 'different-source' }, { updatedAt: '2026-08-01' },
])('refuses missing, invalid, or inconsistent profile provenance: %j', change => {
  const input = { ...fixture(), professors: [canonical, { ...current, rating: { ...rating, ...change } }] };
  expect(consolidateSourceIdentities(input)).toBe(input);
});

it('refuses duplicate local identity IDs', () => {
  const input = { ...fixture(), professors: [canonical, current, { ...current }] };
  expect(consolidateSourceIdentities(input)).toBe(input);
});

it('does not accept only pairwise alias linkage across three records', () => {
  const input = { ...fixture(), professors: [
    { ...canonical, aliases: ['shared-one'] },
    { ...current, aliases: ['shared-one', 'shared-two'] },
    { ...current, id: 'third', displayName: 'Third Name', aliases: ['shared-two'] },
  ] };
  expect(consolidateSourceIdentities(input)).toBe(input);
});

it('merges same-profile conflicting course histories but preserves both rows as ambiguous', () => {
  const input = { ...fixture(), historicalCourseGrades: [grade, { ...grade, professorId: 'current', subjectCode: 'test', catalogNumber: '001', averageGpa: 2 }] };
  const result = consolidateSourceIdentities(input);
  expect(result.professors).toHaveLength(1);
  expect(result.historicalCourseGrades).toHaveLength(2);
  expect(lookupHistoricalCourseGrades(result, 'canonical', 'TEST', '1').status).toBe('ambiguous');
});

it('preserves same-profile groups with histories attached to multiple identities', () => {
  const input = {
    ...fixture(),
    historicalCourseGrades: [grade, { ...grade, professorId: 'current', subjectCode: 'OTHER', catalogNumber: '2' }],
  };
  expect(consolidateSourceIdentities(input)).toBe(input);
});
