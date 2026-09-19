import { describe, expect, it } from 'vitest';
import generatedDataset from '../src/data/easy-a-dataset.generated.json';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import { lookupHistoricalCourseGrades, lookupProfessor } from '../src/data/lookup';
import { applyReviewedCorrections } from '../src/data/reviewed-corrections';
import type { LocalDataset } from '../src/data/types';

const rawDataset = generatedDataset as unknown as LocalDataset;

const reviewedProfiles = [
  ['Danna Zhang', '2276558'],
  ['Florian Meyer', '3051803'],
  ['Jonathan Cohen', '362637'],
  ['Juan Carlos Del Alamo', '1512231'],
  ['K Wayne Yang', '1121831'],
  ['Karen Kovaka', '2855730'],
  ['Kenji Nomura', '2449656'],
  ['Keolu Fox', '2778643'],
  ['Li-Fan Lu', '1824878'],
  ['Monte Johnson', '999601'],
  ['Erik Johnson', '3033351'],
] as const;

const officialIdentityAliases = [
  ['Alyssa Taylor', '2972062'],
  ['Siavash Mirarab', '2781321'],
  ['Thomas Erbe', '573969'],
  ['Timothy Gentner', '632694'],
] as const;

describe('reviewed upstream profile conflicts', () => {
  it.each(reviewedProfiles)('resolves %s to reviewed RMP profile %s', (name, profileId) => {
    const result = lookupProfessor(EASY_A_DATASET, name);
    expect(result.status).toBe('found');
    if (result.status !== 'found') return;
    expect(result.record.rating?.sourceProfessorId).toBe(profileId);
  });

  it.each(officialIdentityAliases)(
    'resolves official UCSD name variant %s to RMP profile %s',
    (name, profileId) => {
      expect(lookupProfessor(EASY_A_DATASET, name)).toMatchObject({
        status: 'found',
        record: { rating: { sourceProfessorId: profileId } },
      });
    },
  );

  it('resolves Keiko Nomura to her MAE profile and history', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Keiko Nomura');
    expect(professor).toMatchObject({
      status: 'found',
      record: {
        id: 'easy-a-nomura-keiko-k-719c7f4b1c',
        rating: { overallRating: 4, sourceProfessorId: '377111' },
      },
    });
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'MAE', '11').status).toBe('found');
  });

  it('resolves Justin Opatkiewicz to his CENG profile and history', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Justin Opatkiewicz');
    expect(professor).toMatchObject({
      status: 'found',
      record: {
        id: 'easy-a-opatkiewicz-justin-paul-823ddc3a91',
        rating: { overallRating: 4.7, sourceProfessorId: '1802395' },
      },
    });
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'CENG', '120').status).toBe('found');
  });

  it.each([
    ['Alyssa Taylor', 'BENG', '100'],
    ['Siavash Mirarab', 'ECE', '30'],
    ['Thomas Erbe', 'MUS', '170'],
    ['Timothy Gentner', 'PSYC', '102'],
  ] as const)('retains reviewed alias %s historical %s %s grades', (name, subject, course) => {
    const professor = lookupProfessor(EASY_A_DATASET, name);
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, subject, course).status).toBe('found');
  });

  it('consolidates Cheryl Anderson while preserving both department-prefix histories', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Cheryl Anderson');
    expect(professor).toMatchObject({
      status: 'found',
      record: { rating: { sourceProfessorId: '1882283' } },
    });
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'FMPH', '40').status).toBe('found');
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'FPMU', '40').status).toBe('found');
  });

  it('keeps Natalye Harpin and Natalye Pass unresolved pending direct identity evidence', () => {
    expect(lookupProfessor(EASY_A_DATASET, 'Natalye Harpin').status).toBe('ambiguous');
    expect(EASY_A_DATASET.professors.filter(professor =>
      professor.rating?.sourceProfessorId === '2321551',
    )).toHaveLength(2);
  });

  it.each([
    ['Danna Zhang', 'MATH', '181A'],
    ['Florian Meyer', 'ECE', '161A'],
    ['Jonathan Cohen', 'PHIL', '134'],
    ['Juan Carlos Del Alamo', 'MAE', '104'],
    ['K Wayne Yang', 'ETHN', '2'],
    ['Karen Kovaka', 'PHIL', '147'],
    ['Kenji Nomura', 'ECE', '103'],
    ['Keolu Fox', 'ANBI', '117'],
    ['Li-Fan Lu', 'BICD', '140'],
    ['Monte Johnson', 'PHIL', '110'],
    ['Erik Johnson', 'MGT', '160'],
  ] as const)('retains %s historical %s %s grades', (name, subject, course) => {
    const professor = lookupProfessor(EASY_A_DATASET, name);
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, subject, course).status).toBe('found');
  });

  it('preserves both reviewed Karen Kovaka PHIL 12 snapshots as ambiguous history', () => {
    const professor = lookupProfessor(EASY_A_DATASET, 'Karen Kovaka');
    expect(professor.status).toBe('found');
    if (professor.status !== 'found') return;
    const grades = lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'PHIL', '12');
    expect(grades.status).toBe('ambiguous');
    if (grades.status === 'ambiguous') expect(grades.candidates).toHaveLength(2);
  });

  it('does not delete the distinct professors whose profiles were incorrectly borrowed', () => {
    for (const profileId of ['1294356', '1005716', '99372', '2232051', '377111', '128225', '2881727']) {
      expect(EASY_A_DATASET.professors.some(record => record.rating?.sourceProfessorId === profileId)).toBe(true);
    }
    expect(lookupProfessor(EASY_A_DATASET, 'Keolu Fox')).toMatchObject({
      status: 'found', record: { rating: { sourceProfessorId: '2778643' } },
    });
  });

  it('preserves every historical row and does not mutate the source snapshot', () => {
    const before = structuredClone(rawDataset);
    const corrected = applyReviewedCorrections(rawDataset);
    expect(corrected.historicalCourseGrades).toHaveLength(rawDataset.historicalCourseGrades.length);
    expect(rawDataset).toEqual(before);
    expect(applyReviewedCorrections(corrected)).toEqual(corrected);
  });

  it.each(['alias', 'rating', 'provenance'] as const)('fails closed when a reviewed member changes its %s payload', field => {
    const changed = {
      ...rawDataset,
      professors: rawDataset.professors.map(record => {
        if (record.id !== 'easy-a-danna-zhang-f1da2036bb') return record;
        if (field === 'alias') return { ...record, aliases: ['New upstream alias'] };
        return {
          ...record,
          rating: field === 'rating'
            ? { ...record.rating!, overallRating: 4.9 }
            : { ...record.rating!, sourceId: 'changed-upstream-source' },
        };
      }),
    };
    const corrected = applyReviewedCorrections(changed);
    expect(corrected.professors.filter(record =>
      record.id === 'easy-a-danna-zhang-f1da2036bb' || record.id === 'easy-a-zhang-danna-14fad79d5b',
    )).toHaveLength(2);
    expect(lookupProfessor(corrected, 'Danna Zhang').status).toBe('ambiguous');
  });

  it('fails closed when an official-alias source member changes', () => {
    const changed = {
      ...rawDataset,
      professors: rawDataset.professors.map(record => record.id === 'easy-a-siavash-mirarab-22774e6c50'
        ? { ...record, aliases: ['Unexpected upstream alias'] }
        : record),
    };
    const corrected = applyReviewedCorrections(changed);
    expect(corrected.professors.filter(record =>
      record.id === 'easy-a-mir-arabbaygi-siavash-f11007ef65' ||
      record.id === 'easy-a-siavash-mirarab-22774e6c50',
    )).toHaveLength(2);
    expect(lookupProfessor(corrected, 'Siavash Mirarab').status).toBe('ambiguous');
  });
});
