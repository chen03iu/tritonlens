import type { DataSourceReference, LocalDataset, ProfessorRating } from './types';

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
    professors,
    sources: addedRating ? [...dataset.sources, aaronSource] : dataset.sources,
  };
}
