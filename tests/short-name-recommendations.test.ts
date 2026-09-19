import { describe, expect, it } from 'vitest';
import type { InstructorAuditEntry } from '../src/data/instructor-audit';
import {
  recommendShortNameMatches,
  summarizeRecommendations,
} from '../src/data/short-name-recommendations';

function entry(
  name: string,
  courses: readonly string[],
  candidate: Partial<InstructorAuditEntry['candidates'][number]> & { displayName: string },
): InstructorAuditEntry {
  return {
    name,
    courses,
    status: 'needs-evidence',
    reviewRequired: true,
    candidates: [{
      id: candidate.id ?? 'candidate-1',
      displayName: candidate.displayName,
      aliases: candidate.aliases ?? [],
      hasRating: candidate.hasRating ?? true,
      rmpUrl: candidate.rmpUrl ?? null,
      historicalCourses: candidate.historicalCourses ?? [],
    }],
  };
}

describe('short-name recommendation evidence', () => {
  it('recommends Justin Opatkiewicz when the CENG subject overlaps', () => {
    const result = recommendShortNameMatches([
      entry('Justin Opatkiewicz', ['CENG 120'], {
        displayName: 'Opatkiewicz, Justin Paul',
        historicalCourses: ['CENG 15', 'CENG 120'],
      }),
    ]);

    expect(result).toEqual([expect.objectContaining({
      currentName: 'Justin Opatkiewicz',
      candidateName: 'Opatkiewicz, Justin Paul',
      relationship: 'middle-omitted',
      sharedSubjects: ['CENG'],
      recommendation: 'recommended',
      reason: 'Compatible name form and a shared course subject provide deterministic support.',
    })]);
  });

  it('recommends Keiko Nomura when the MAE subject overlaps', () => {
    expect(recommendShortNameMatches([
      entry('Keiko Nomura', ['MAE 11'], {
        displayName: 'Nomura, Keiko K.',
        historicalCourses: ['MAE 8'],
      }),
    ])[0]).toEqual(expect.objectContaining({
      relationship: 'middle-omitted',
      sharedSubjects: ['MAE'],
      recommendation: 'recommended',
    }));
  });

  it('keeps a compatible middle omission without subject overlap for review', () => {
    expect(recommendShortNameMatches([
      entry('Justin Opatkiewicz', ['CENG 120'], {
        displayName: 'Opatkiewicz, Justin Paul',
        historicalCourses: ['MAE 8'],
      }),
    ])[0]).toEqual(expect.objectContaining({
      relationship: 'middle-omitted',
      sharedSubjects: [],
      recommendation: 'review',
      reason: 'The name form is compatible, but there is no shared course subject.',
    }));
  });

  it('rejects an incompatible first name', () => {
    expect(recommendShortNameMatches([
      entry('Kenji Nomura', ['MAE 11'], {
        displayName: 'Nomura, Keiko K.',
        historicalCourses: ['MAE 8'],
      }),
    ])[0]).toEqual(expect.objectContaining({
      relationship: 'incompatible',
      recommendation: 'rejected',
    }));
  });

  it('keeps multiple candidates for review', () => {
    const base = entry('Justin Opatkiewicz', ['CENG 120'], {
      id: 'one', displayName: 'Opatkiewicz, Justin Paul', historicalCourses: ['CENG 120'],
    });
    const input: InstructorAuditEntry = {
      ...base,
      candidates: [...base.candidates, {
        id: 'two', displayName: 'Opatkiewicz, Justin Xavier', aliases: [],
        hasRating: true, rmpUrl: null, historicalCourses: ['CENG 120'],
      }],
    };
    expect(recommendShortNameMatches([input])[0]).toEqual(expect.objectContaining({
      candidateId: null,
      recommendation: 'review',
      reason: 'Multiple candidates require human review.',
    }));
  });

  it('omits entries that are not needs-evidence', () => {
    const input = entry('Justin Opatkiewicz', ['CENG 120'], {
      displayName: 'Opatkiewicz, Justin Paul', historicalCourses: ['CENG 120'],
    });
    expect(recommendShortNameMatches([{ ...input, status: 'matched' }])).toEqual([]);
  });

  it.each(['Mark Young', 'Elizabeth Miller', 'Natalye Harpin'])('keeps reviewed holdout %s for review', name => {
    const last = name.split(' ').at(-1)!;
    const first = name.split(' ')[0];
    expect(recommendShortNameMatches([
      entry(name, ['MATH 10'], {
        displayName: `${last}, ${first} Middle`, historicalCourses: ['MATH 10'],
      }),
    ])[0]).toEqual(expect.objectContaining({
      recommendation: 'review',
      reason: 'This name is a reviewed holdout and requires human evidence.',
    }));
  });

  it('sorts output and evidence deterministically without mutating the input', () => {
    const input = [
      entry('Zed Person', ['MATH 20', 'CENG 10'], {
        displayName: 'Person, Zed Middle', historicalCourses: ['MATH 1', 'CENG 2'],
      }),
      entry('Amy Person', ['MAE 1'], {
        displayName: 'Person, Amy Middle', historicalCourses: ['MAE 2'],
      }),
    ];
    const before = JSON.stringify(input);
    const result = recommendShortNameMatches(input);

    expect(result.map(item => item.currentName)).toEqual(['Amy Person', 'Zed Person']);
    expect(result[1].sharedSubjects).toEqual(['CENG', 'MATH']);
    expect(JSON.stringify(input)).toBe(before);
    expect(summarizeRecommendations(result)).toEqual({ recommended: 2, review: 0, rejected: 0, total: 2 });
  });
});
