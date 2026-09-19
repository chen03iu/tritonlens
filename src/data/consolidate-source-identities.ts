import { normalizeInstructorName } from './lookup';
import type { LocalDataset, ProfessorRecord } from './types';

// Same-profile linkage is not enough when the snapshot itself contains a
// possible surname change. Keep this exact reviewed group visible for audit
// until direct identity evidence confirms Natalye Harpin and Natalye Pass.
const reviewedProfileHoldouts = new Set(['2321551']);

function identityNameKeys(record: ProfessorRecord): Set<string> {
  const forms = [record.displayName, ...record.aliases];
  for (const form of [...forms]) {
    const parts = form.split(',').map(part => part.trim());
    if (parts.length !== 2 || !parts[0] || !parts[1]) continue;
    forms.push(`${parts[1]} ${parts[0]}`, `${parts[1].split(/\s+/)[0]} ${parts[0]}`);
  }
  return new Set(forms.map(normalizeInstructorName));
}

/** Consolidate only identities already linked by the snapshot, never fuzzy names. */
export function consolidateSourceIdentities(dataset: LocalDataset): LocalDataset {
  if (dataset.kind !== 'development') return dataset;
  const idCounts = new Map<string, number>();
  const groups = new Map<string, ProfessorRecord[]>();
  const histories = new Map<string, typeof dataset.historicalCourseGrades[number][]>();
  for (const grade of dataset.historicalCourseGrades) {
    if (!histories.has(grade.professorId)) histories.set(grade.professorId, []);
    histories.get(grade.professorId)!.push(grade);
  }
  for (const professor of dataset.professors) {
    idCounts.set(professor.id, (idCounts.get(professor.id) ?? 0) + 1);
    const profile = professor.rating?.sourceProfessorId;
    if (!profile || !/^\d+$/.test(profile)) continue;
    if (!groups.has(profile)) groups.set(profile, []);
    groups.get(profile)!.push(professor);
  }
  const replacementIds = new Map<string, string>();
  const replacements = new Map<string, ProfessorRecord>();
  for (const [profileId, group] of groups) {
    if (reviewedProfileHoldouts.has(profileId)) continue;
    if (group.length < 2 || group.some(record => idCounts.get(record.id) !== 1)) continue;
    const firstRating = group[0].rating!;
    if (group.some(record => {
      const rating = record.rating!;
      return rating.overallRating !== firstRating.overallRating || rating.difficulty !== firstRating.difficulty ||
        rating.ratingCount !== firstRating.ratingCount || rating.wouldTakeAgainPercent !== firstRating.wouldTakeAgainPercent ||
        rating.sourceId !== firstRating.sourceId || rating.updatedAt !== firstRating.updatedAt;
    })) continue;

    // Every record must share an existing exact/normalized name, not an inferred short form.
    const nameSets = group.map(identityNameKeys);
    if (![...nameSets[0]].some(name => name && nameSets.every(names => names.has(name)))) continue;
    // A reused source profile can still be attached to distinct local people.
    // When multiple records carry history, every pair must share a department.
    const historySubjects = group.map(record => new Set(
      (histories.get(record.id) ?? []).map(grade => grade.subjectCode.trim().toUpperCase()),
    )).filter(subjects => subjects.size > 0);
    if (historySubjects.some((subjects, index) => historySubjects.slice(index + 1)
      .some(other => ![...subjects].some(subject => other.has(subject))))) continue;

    const keeper = [...group].sort((a, b) =>
      (histories.get(b.id)?.length ?? 0) - (histories.get(a.id)?.length ?? 0) ||
      Number(b.displayName.includes(',')) - Number(a.displayName.includes(',')) || a.id.localeCompare(b.id, 'en-US'))[0];
    replacements.set(keeper.id, {
      ...keeper,
      aliases: [...new Set(group.flatMap(record => [record.displayName, ...record.aliases]))]
        .filter(name => name !== keeper.displayName),
    });
    group.forEach(record => replacementIds.set(record.id, keeper.id));
  }
  if (!replacements.size) return dataset;
  return {
    ...dataset,
    professors: dataset.professors.filter(record => !replacementIds.has(record.id) || replacementIds.get(record.id) === record.id)
      .map(record => replacements.get(record.id) ?? record),
    historicalCourseGrades: dataset.historicalCourseGrades.map(grade => {
      const professorId = replacementIds.get(grade.professorId);
      return professorId && professorId !== grade.professorId ? { ...grade, professorId } : grade;
    }),
  };
}
