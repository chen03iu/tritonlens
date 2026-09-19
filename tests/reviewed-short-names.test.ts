import { expect, it } from 'vitest';
import raw from '../src/data/easy-a-dataset.generated.json';
import batch from '../src/data/reviewed-short-names.json';
import { applyReviewedShortNames } from '../src/data/reviewed-short-names';
import { lookupProfessor, lookupHistoricalCourseGrades } from '../src/data/lookup';
import { EASY_A_DATASET } from '../src/data/easy-a-dataset';
import type { LocalDataset } from '../src/data/types';

const source = raw as unknown as LocalDataset;
it.each([
  [
    "Anthony Burr",
    "easy-a-burr-anthony-i-a6689eb4c9"
  ],
  [
    "Antony Lyon",
    "easy-a-lyon-antony-j-6bc3ff66b3"
  ],
  [
    "Arthur Atkinson",
    "easy-a-atkinson-arthur-laird-fe7080dea2"
  ],
  [
    "Ashley Juavinett",
    "easy-a-juavinett-ashley-lauren-9634c61254"
  ],
  [
    "Ayse Saygin",
    "easy-a-saygin-ayse-p-34c5aab2fe"
  ],
  [
    "Barbara Bliss",
    "easy-a-bliss-barbara-ann-9befe91a4c"
  ],
  [
    "Becca Rose",
    "easy-a-rose-becca-rae-7071378a96"
  ],
  [
    "Bernhard Palsson",
    "easy-a-palsson-bernhard-o-dab9264bda"
  ],
  [
    "Bhaskar Rao",
    "easy-a-rao-bhaskar-d-2ad5438792"
  ],
  [
    "Bradley Moore",
    "easy-a-moore-bradley-s-e052960984"
  ],
  [
    "Bradley Werner",
    "easy-a-werner-bradley-t-0892518fcd"
  ],
  [
    "Brandon Som",
    "easy-a-som-brandon-d-4a0342835c"
  ],
  [
    "Brendon Rhoades",
    "easy-a-rhoades-brendon-patrick-9133bdb547"
  ],
  [
    "Brian Aguado",
    "easy-a-aguado-brian-alberto-276cd3d920"
  ],
  [
    "Brian Cross",
    "easy-a-cross-brian-r-1507e2c648"
  ],
  [
    "Brian Zid",
    "easy-a-zid-brian-m-01265d05f9"
  ],
  [
    "Briana Iatarola",
    "easy-a-iatarola-briana-marie-f17d20ff3b"
  ],
  [
    "Brice Semmens",
    "easy-a-semmens-brice-xavier-0236c0a93d"
  ],
  [
    "Bryan Chin",
    "easy-a-chin-bryan-w-4c42164ada"
  ]
])('resolves externally reviewed %s in the effective dataset', (name, id) => {
  expect(lookupProfessor(EASY_A_DATASET, name)).toMatchObject({status: 'found', record: {id}});
});
it('resolves Mark Anderson without his middle name and retrieves his MAE 142 history', () => {
  const professor = lookupProfessor(EASY_A_DATASET, 'Mark Anderson');
  expect(professor.status).toBe('found');
  if (professor.status !== 'found') throw new Error('Missing reviewed Mark Anderson identity');
  expect(professor.record.id).toBe('easy-a-anderson-mark-ronald-9b7e2534ca');
  expect(professor.record.rating).toMatchObject({
    overallRating: 4.2, ratingCount: 14, sourceProfessorId: '2089978',
  });
  expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'MAE', '142'))
    .toMatchObject({ status: 'found', record: { averageGpa: 3.511, offeringCount: 8 } });
  expect(lookupHistoricalCourseGrades(EASY_A_DATASET, professor.record.id, 'CSE', '142'))
    .toEqual({ status: 'not-found' });
});
it('resolves externally reviewed aliases and preserves ratings and all historical rows', () => {
  const before = structuredClone(source);
  const result = applyReviewedShortNames(source);
  for (const entry of batch.entries) {
    expect(lookupProfessor(result, entry.alias)).toMatchObject({
      status: 'found', record: { id: entry.expectedRecord.id, rating: entry.expectedRecord.rating },
    });
  }
  expect(result.historicalCourseGrades).toBe(source.historicalCourseGrades);
  expect(result.professors).toHaveLength(source.professors.length);
  expect(source).toEqual(before);
  expect(applyReviewedShortNames(result)).toEqual(result);
});
it('requires a fresh review if the pinned record changes', () => {
  const target = batch.entries[0];
  const changed = { ...source, professors: source.professors.map(p =>
    p.id === target.expectedRecord.id ? { ...p, displayName: 'Another Person' } : p) };
  expect(applyReviewedShortNames(changed).professors.find(p => p.id === target.expectedRecord.id)?.aliases)
    .not.toContain(target.alias);
});
it('does not add an alias owned by another identity or accept duplicate target IDs', () => {
  const target = batch.entries[0];
  const duplicate = { ...source, professors: [...source.professors, {
    ...target.expectedRecord, id: 'conflict', displayName: target.alias, aliases: [],
  }] } as LocalDataset;
  expect(applyReviewedShortNames(duplicate).professors.find(p => p.id === target.expectedRecord.id)?.aliases)
    .not.toContain(target.alias);
  const duplicateId = { ...source, professors: [...source.professors, target.expectedRecord] } as LocalDataset;
  expect(applyReviewedShortNames(duplicateId).professors.filter(p => p.id === target.expectedRecord.id)
    .every(p => !p.aliases.includes(target.alias))).toBe(true);
});
it('keeps production datasets unchanged', () => {
  const production = { ...source, kind: 'production' } as LocalDataset;
  expect(applyReviewedShortNames(production)).toBe(production);
});
