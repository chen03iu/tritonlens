import { describe, expect, it } from 'vitest';
import { transformEasyARadar } from '../scripts/easy-a-transform.mjs';

const COLUMNS = [
  's',
  'c',
  't',
  'i',
  'g',
  'gA',
  'gB',
  'gC',
  'gD',
  'gF',
  'gW',
  'gP',
  'gNP',
  'n',
  'y',
  'off',
  'lv',
  'rq',
  'rd',
  'rw',
  'rn',
  'rid',
  'src',
  'cur',
];

function createFixture() {
  return {
    cols: COLUMNS,
    titles: ['Introduction to African American Studies'],
    recs: [
      [
        'AAS',
        '10R',
        0,
        'Butler, Elizabeth Annette',
        3.444,
        61.2,
        18.3,
        7.1,
        2.1,
        1.3,
        3.4,
        6.2,
        0.4,
        4,
        26,
        1,
        10,
        2.7,
        3,
        33,
        30,
        1410511,
        0,
        1,
      ],
      [
        'AAS',
        '170',
        0,
        'Chadwick Campbell',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        0,
        null,
        1,
        170,
        4.8,
        2.4,
        91,
        31,
        2915203,
        2,
        1,
      ],
    ],
    meta: {
      generated: '2026-07-23',
      years: '2015-2026',
      schoolRMP: 1079,
    },
    aka: {
      'Butler, Elizabeth Annette': ['Libby Butler'],
    },
    rmpAka: {},
  };
}

describe('transformEasyARadar', () => {
  it('creates a development dataset with explicit pending upstream sources', () => {
    const result = transformEasyARadar(createFixture());

    expect(result.kind).toBe('development');
    expect(result.sources).toEqual([
      expect.objectContaining({
        id: 'easy-a-radar-rmp',
        category: 'professor-ratings',
        permissionStatus: 'pending',
        retrievedAt: '2026-07-23',
      }),
      expect.objectContaining({
        id: 'easy-a-radar-grades',
        category: 'historical-grades',
        permissionStatus: 'pending',
        retrievedAt: '2026-07-23',
      }),
    ]);
  });

  it('preserves reviewed aliases and professor-level RMP metrics', () => {
    const result = transformEasyARadar(createFixture());
    const professor = result.professors.find((record) =>
      record.aliases.includes('Libby Butler'),
    );

    expect(professor).toMatchObject({
      displayName: 'Butler, Elizabeth Annette',
      aliases: expect.arrayContaining([
        'Elizabeth Annette Butler',
        'Libby Butler',
      ]),
      rating: {
        overallRating: 2.7,
        difficulty: 3,
        ratingCount: 30,
        wouldTakeAgainPercent: 33,
        sourceId: 'easy-a-radar-rmp',
        updatedAt: '2026-07-23',
        sourceProfessorId: '1410511',
      },
    });
  });

  it('maps only real grade rows without inventing student sample size', () => {
    const result = transformEasyARadar(createFixture());

    expect(result.historicalCourseGrades).toHaveLength(1);
    expect(result.historicalCourseGrades[0]).toMatchObject({
      subjectCode: 'AAS',
      catalogNumber: '10R',
      averageGpa: 3.444,
      sampleSize: null,
      offeringCount: 4,
      sourceId: 'easy-a-radar-grades',
      updatedAt: '2026-07-23',
      gradeDistribution: {
        aPercent: 61.2,
        bPercent: 18.3,
        cPercent: 7.1,
        dPercent: 2.1,
        fPercent: 1.3,
        wPercent: 3.4,
        pPercent: 6.2,
        npPercent: 0.4,
      },
    });
  });

  it('keeps conflicting RMP identities separate for fail-closed lookup', () => {
    const fixture = createFixture();
    fixture.recs.push([
      'AAS',
      '11R',
      0,
      'Butler, Elizabeth Annette',
      3.5,
      60,
      20,
      10,
      2,
      1,
      3,
      4,
      0,
      1,
      26,
      0,
      11,
      4.9,
      1.1,
      99,
      500,
      9999999,
      0,
      0,
    ]);

    const result = transformEasyARadar(fixture);
    const professors = result.professors.filter(
      (record) =>
        record.displayName === 'Butler, Elizabeth Annette',
    );
    const professorIds = new Set(
      professors.map((professor) => professor.id),
    );
    const gradeProfessorIds = new Set(
      result.historicalCourseGrades.map(
        (record) => record.professorId,
      ),
    );

    expect(professors).toHaveLength(2);
    expect(professorIds).toHaveLength(2);
    expect([...professors.map((record) => record.rating?.sourceProfessorId)])
      .toEqual(expect.arrayContaining(['1410511', '9999999']));
    expect(gradeProfessorIds).toEqual(professorIds);
  });

  it('converts the upstream unavailable percentage sentinel to null', () => {
    const fixture = createFixture();
    fixture.recs[0][19] = -1;

    const result = transformEasyARadar(fixture);
    const professor = result.professors.find((record) =>
      record.aliases.includes('Libby Butler'),
    );

    expect(professor?.rating?.wouldTakeAgainPercent).toBeNull();
  });

  it('treats an RMP profile with zero ratings as unavailable', () => {
    const fixture = createFixture();
    fixture.recs[1][17] = 0;
    fixture.recs[1][20] = 0;

    const result = transformEasyARadar(fixture);
    const professor = result.professors.find(
      (record) => record.displayName === 'Chadwick Campbell',
    );

    expect(professor?.rating).toBeNull();
  });

  it('rejects snapshots missing a required column', () => {
    const fixture = createFixture();
    fixture.cols = fixture.cols.filter((column) => column !== 'rid');

    expect(() => transformEasyARadar(fixture)).toThrow(
      'Easy-A snapshot is missing required column "rid".',
    );
  });
});
