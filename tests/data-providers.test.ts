import { describe, expect, it } from 'vitest';
import { MOCK_DATASET } from '../src/data/mock-dataset';
import {
  createInstructorDataService,
} from '../src/data/providers/instructor-data-service';
import {
  createLocalDatasetProviderSet,
} from '../src/data/providers/local-dataset-providers';
import type {
  InstructorDataServiceOptions,
  ProfessorIdentity,
} from '../src/data/providers/types';
import type { LocalDataset } from '../src/data/types';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

function createContext(
  displayName: string,
  subjectCode = 'AAS',
  catalogNumber = '010R',
): RenderedInstructorContext {
  return {
    link: null as unknown as HTMLAnchorElement,
    instructor: { displayName },
    section: {
      sectionCode: '001-000',
      eventId: 'E 00000001',
      teachingMethod: 'Lecture',
      scheduleText: 'Schedule Not Defined',
      locationText: 'UC San Diego',
      deliveryMode: 'unknown',
      instructors: [{ displayName }],
    },
    packageCode: 'P-001-001',
    course: {
      subjectCode,
      catalogNumber,
      title: 'Fixture course',
    },
    term: null,
  };
}

function createService(dataset: LocalDataset) {
  return createInstructorDataService({
    mode: 'development-snapshot',
    modeLabel: 'Development snapshot — not for release',
    ...createLocalDatasetProviderSet(dataset),
  });
}

function createIndependentDataset(): LocalDataset {
  const source = MOCK_DATASET.sources[0];
  const grade = MOCK_DATASET.historicalCourseGrades[0];

  return {
    schemaVersion: 1,
    kind: 'development',
    sources: [source],
    professors: [
      {
        id: 'rating-only',
        displayName: 'Rating Only',
        aliases: [],
        rating: {
          ...MOCK_DATASET.professors[0].rating!,
          sourceProfessorId: '12345',
        },
      },
      {
        id: 'grades-only',
        displayName: 'Grades Only',
        aliases: [],
        rating: null,
      },
    ],
    historicalCourseGrades: [
      {
        ...grade,
        professorId: 'grades-only',
      },
    ],
  };
}

describe('local dataset provider adapters', () => {
  it('returns sourced rating and course grades for an exact identity', () => {
    const insight = createService(MOCK_DATASET).getInsight(
      createContext('Libby Butler'),
    );

    expect(insight).toMatchObject({
      mode: 'development-snapshot',
      identity: {
        status: 'found',
        identity: {
          id: 'demo-libby-butler',
          displayName: 'Libby Butler',
          matchMethod: 'exact',
        },
      },
      professorRating: {
        status: 'found',
        data: {
          rating: { overallRating: 4.6 },
          source: { id: 'tritonlens-fictional-demo' },
        },
      },
      historicalGrades: {
        status: 'found',
        data: {
          record: { averageGpa: 3.42 },
          source: { id: 'tritonlens-fictional-demo' },
        },
      },
    });
  });

  it('preserves a known-alias match method', () => {
    expect(
      createService(MOCK_DATASET).getInsight(
        createContext('Butler, Libby'),
      ).identity,
    ).toMatchObject({
      status: 'found',
      identity: { matchMethod: 'known-alias' },
    });
  });

  it('keeps rating-only and grade-only availability independent', () => {
    const service = createService(createIndependentDataset());
    const ratingOnly = service.getInsight(
      createContext('Rating Only'),
    );
    const gradesOnly = service.getInsight(
      createContext('Grades Only'),
    );

    expect(ratingOnly.professorRating.status).toBe('found');
    expect(ratingOnly.historicalGrades.status).toBe('not-found');
    expect(gradesOnly.professorRating.status).toBe('not-found');
    expect(gradesOnly.historicalGrades.status).toBe('found');
  });

  it('exposes neither metric for an ambiguous identity', () => {
    const duplicate = MOCK_DATASET.professors[0];
    const dataset: LocalDataset = {
      ...MOCK_DATASET,
      professors: [
        duplicate,
        { ...duplicate, id: 'duplicate-libby' },
      ],
    };

    const insight = createService(dataset).getInsight(
      createContext('Libby Butler'),
    );

    expect(insight.identity.status).toBe('ambiguous');
    expect(insight.professorRating.status).toBe('not-found');
    expect(insight.historicalGrades.status).toBe('not-found');
  });

  it('rejects metric records whose source is missing', () => {
    const dataset = createIndependentDataset();
    const missingSources: LocalDataset = {
      ...dataset,
      sources: [],
    };

    const ratingOnly = createService(missingSources).getInsight(
      createContext('Rating Only'),
    );
    const gradesOnly = createService(missingSources).getInsight(
      createContext('Grades Only'),
    );

    expect(ratingOnly.professorRating.status).toBe('not-found');
    expect(gradesOnly.historicalGrades.status).toBe('not-found');
  });

  it('creates a direct RMP link only for a numeric source professor ID', () => {
    const service = createService(createIndependentDataset());

    expect(
      service.getInsight(createContext('Rating Only')).links,
    ).toContainEqual({
      kind: 'professor-ratings',
      label: 'RateMyProfessors profile',
      url: 'https://www.ratemyprofessors.com/professor/12345',
    });

    const original = createIndependentDataset();
    const invalid: LocalDataset = {
      ...original,
      professors: [
        {
          ...original.professors[0],
          rating: {
            ...original.professors[0].rating!,
            sourceProfessorId: '12x',
          },
        },
        original.professors[1],
      ],
    };
    expect(
      createService(invalid).getInsight(
        createContext('Rating Only'),
      ).links,
    ).toEqual([]);
  });
});

describe('instructor data service failure containment', () => {
  const identity: ProfessorIdentity = {
    id: 'fixture-professor',
    displayName: 'Fixture Professor',
    matchMethod: 'exact',
  };

  function createOptions(): InstructorDataServiceOptions {
    const source = MOCK_DATASET.sources[0];
    return {
      mode: 'development-snapshot',
      modeLabel: 'Development snapshot — not for release',
      identityProvider: {
        lookup: () => ({ status: 'found', identity }),
      },
      ratingProvider: {
        lookup: () => ({
          status: 'found',
          data: {
            rating: MOCK_DATASET.professors[0].rating!,
            source,
          },
        }),
      },
      gradesProvider: {
        lookup: () => ({
          status: 'found',
          data: {
            record: MOCK_DATASET.historicalCourseGrades[0],
            source,
          },
        }),
      },
      linkProvider: { getLinks: () => [] },
    };
  }

  it('contains an identity-provider exception', () => {
    const options: InstructorDataServiceOptions = {
      ...createOptions(),
      identityProvider: {
        lookup: () => {
          throw new Error('identity unavailable');
        },
      },
    };

    const insight = createInstructorDataService(options).getInsight(
      createContext('Fixture Professor'),
    );

    expect(insight.identity.status).toBe('not-found');
    expect(insight.professorRating.status).toBe('not-found');
    expect(insight.historicalGrades.status).toBe('not-found');
  });

  it('contains rating and grade failures independently', () => {
    const ratingOptions: InstructorDataServiceOptions = {
      ...createOptions(),
      ratingProvider: {
        lookup: () => {
          throw new Error('rating unavailable');
        },
      },
    };
    const ratingFailure = createInstructorDataService(
      ratingOptions,
    ).getInsight(createContext('Fixture Professor'));

    expect(ratingFailure.professorRating.status).toBe('not-found');
    expect(ratingFailure.historicalGrades.status).toBe('found');

    const gradeOptions: InstructorDataServiceOptions = {
      ...createOptions(),
      gradesProvider: {
        lookup: () => {
          throw new Error('grades unavailable');
        },
      },
    };
    const gradeFailure = createInstructorDataService(
      gradeOptions,
    ).getInsight(createContext('Fixture Professor'));

    expect(gradeFailure.professorRating.status).toBe('found');
    expect(gradeFailure.historicalGrades.status).toBe('not-found');
  });

  it('contains an external-link provider exception', () => {
    const options: InstructorDataServiceOptions = {
      ...createOptions(),
      linkProvider: {
        getLinks: () => {
          throw new Error('links unavailable');
        },
      },
    };

    expect(
      createInstructorDataService(options).getInsight(
        createContext('Fixture Professor'),
      ).links,
    ).toEqual([]);
  });
});
