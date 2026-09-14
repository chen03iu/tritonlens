import type { LocalDataset } from './types';

/**
 * Entirely fictional values used only to exercise the local lookup pipeline.
 * These records are not RateMyProfessors or UCSD grade data.
 */
export const MOCK_DATASET: LocalDataset = {
  schemaVersion: 1,
  kind: 'mock',
  sources: [
    {
      id: 'tritonlens-fictional-demo',
      label: 'TritonLens fictional demo data',
      category: 'mock',
      homepageUrl: null,
      termsUrl: null,
      retrievedAt: null,
      permissionStatus: 'approved',
      attribution: null,
    },
  ],
  professors: [
    {
      id: 'demo-libby-butler',
      displayName: 'Libby Butler',
      aliases: ['Butler, Libby'],
      rating: {
        overallRating: 4.6,
        difficulty: 2.8,
        ratingCount: 42,
        wouldTakeAgainPercent: 86,
        sourceId: 'tritonlens-fictional-demo',
        updatedAt: '2026-09-14',
        sourceProfessorId: null,
      },
    },
    {
      id: 'demo-chadwick-campbell',
      displayName: 'Chadwick Campbell',
      aliases: ['Campbell, Chadwick'],
      rating: {
        overallRating: 4.8,
        difficulty: 2.4,
        ratingCount: 31,
        wouldTakeAgainPercent: 91,
        sourceId: 'tritonlens-fictional-demo',
        updatedAt: '2026-09-14',
        sourceProfessorId: null,
      },
    },
  ],
  historicalCourseGrades: [
    {
      professorId: 'demo-libby-butler',
      subjectCode: 'AAS',
      catalogNumber: '010R',
      averageGpa: 3.42,
      sampleSize: 120,
      offeringCount: 4,
      gradeDistribution: {
        aPercent: 58,
        bPercent: 27,
        cPercent: 10,
        dPercent: 3,
        fPercent: 1,
        wPercent: 1,
        pPercent: null,
        npPercent: null,
      },
      sourceId: 'tritonlens-fictional-demo',
      updatedAt: '2026-09-14',
    },
    {
      professorId: 'demo-chadwick-campbell',
      subjectCode: 'AAS',
      catalogNumber: '170',
      averageGpa: 3.55,
      sampleSize: 88,
      offeringCount: 3,
      gradeDistribution: {
        aPercent: 62,
        bPercent: 24,
        cPercent: 9,
        dPercent: 2,
        fPercent: 1,
        wPercent: 2,
        pPercent: null,
        npPercent: null,
      },
      sourceId: 'tritonlens-fictional-demo',
      updatedAt: '2026-09-14',
    },
  ],
};
