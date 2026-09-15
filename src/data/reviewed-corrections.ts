import type { DataSourceReference, LocalDataset, ProfessorRating, ProfessorRecord } from './types';

// Explicit identities only. Evidence is recorded in REVIEWED_IDENTITIES.md.
const identities = [
  {
    id: 'easy-a-jones-miles-e-f6900194f3',
    displayName: 'Jones, Miles E',
    aliases: ['Miles Jones', 'Miles Eli Jones'],
  },
  {
    id: 'easy-a-shalev-aaron-d-1ef0bedf0d',
    displayName: 'Shalev, Aaron D',
    aliases: ['Aaron Shalev', 'Aaron Schulman', 'Aron Shalev', 'Aaron Shaleve'],
  },
  {
    id: 'easy-a-wilder-linnea-lorene-d9d040d7f2',
    displayName: 'Wilder, Linnea Lorene',
    aliases: ['Linnea Wilder', 'Linnea L. Wilder'],
  },
  {
    id: 'easy-a-taylor-garcia-daphne-33ba9d49d2',
    displayName: 'Taylor-Garcia, Daphne',
    aliases: ['Daphne Taylor García', 'Daphne Taylor Garcia', 'Daphne Taylor-García'],
  },
] as const;

const aaronSource: DataSourceReference = {
  id: 'reviewed-aaron-rmp',
  label: 'RMP reported totals (UC San Diego Extended Studies; inconsistent review count)',
  category: 'professor-ratings',
  homepageUrl: 'https://www.ratemyprofessors.com/professor/3050657',
  termsUrl: 'https://www.ratemyprofessors.com/terms-of-use',
  retrievedAt: '2026-09-15',
  permissionStatus: 'pending',
  attribution: 'RateMyProfessors, Aaron Schulman profile 3050657; reported aggregate totals, not recomputed from reviews.',
};

const aaronRating: ProfessorRating = {
  overallRating: 5,
  difficulty: 3,
  ratingCount: 3,
  wouldTakeAgainPercent: 100,
  sourceId: aaronSource.id,
  updatedAt: '2026-09-15',
  sourceProfessorId: '3050657',
};

function consolidateIsabella(
  dataset: LocalDataset,
  professors: readonly ProfessorRecord[],
): readonly ProfessorRecord[] {
  const fullId = 'easy-a-maita-isabella-vincenza-4852998842';
  const shortId = 'easy-a-isabella-maita-1cf20dd783';
  const full = professors.filter(professor => professor.displayName === 'Maita, Isabella Vincenza');
  const short = professors.filter(professor => professor.displayName === 'Isabella Maita');
  if (full.length !== 1 || full[0].id !== fullId ||
      professors.filter(professor => professor.id === fullId).length !== 1 ||
      professors.filter(professor => professor.id === shortId).length > 1 ||
      (full[0].rating !== null && full[0].rating.sourceProfessorId !== '2987635')) {
    return professors;
  }

  // Only consolidate the reviewed empty stub. Preserve future substantive data.
  if (short.length > 1 || (short.length === 1 &&
      (short[0].id !== shortId || short[0].rating !== null || short[0].aliases.length !== 0 ||
       dataset.historicalCourseGrades.some(record => record.professorId === shortId)))) {
    return professors;
  }
  // A renamed record under the old ID needs a fresh review, not deletion.
  if (short.length === 0 && professors.some(professor => professor.id === shortId)) return professors;

  return professors
    .filter(professor => professor.id !== shortId)
    .map(professor => professor.id === fullId ? {
      ...professor,
      aliases: [...new Set([...professor.aliases, 'Isabella Maita'])],
    } : professor);
}

export function applyReviewedCorrections(dataset: LocalDataset): LocalDataset {
  // A development observation must never be promoted by changing dataset kind.
  if (dataset.kind !== 'development') return dataset;

  let addedRating = false;
  const professors = dataset.professors.map(professor => {
    const identity = identities.find(entry => entry.id === professor.id && entry.displayName === professor.displayName);
    if (!identity || dataset.professors.filter(entry => entry.displayName === identity.displayName).length !== 1) {
      return professor;
    }

    const canAddRating = identity.id === identities[1].id && professor.rating === null &&
      !dataset.sources.some(source => source.id === aaronSource.id) &&
      !dataset.professors.some(entry => entry.rating?.sourceProfessorId === aaronRating.sourceProfessorId);
    if (canAddRating) addedRating = true;
    return {
      ...professor,
      aliases: [...new Set([...professor.aliases, ...identity.aliases])],
      rating: canAddRating ? aaronRating : professor.rating,
    };
  });

  return {
    ...dataset,
    professors: consolidateIsabella(dataset, professors),
    sources: addedRating ? [...dataset.sources, aaronSource] : dataset.sources,
  };
}
