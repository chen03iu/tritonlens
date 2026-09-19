import { lookupProfessor, normalizeInstructorName } from './lookup';
import type { LocalDataset, ProfessorRecord } from './types';

export interface InstructorAuditEntry {
  readonly name: string;
  readonly courses: readonly string[];
  readonly status: 'matched' | 'ambiguous' | 'needs-evidence' | 'no-candidate';
  readonly reviewRequired: boolean;
  readonly candidates: readonly {
    id: string;
    displayName: string;
    aliases: readonly string[];
    hasRating: boolean;
    rmpUrl: string | null;
    historicalCourses: readonly string[];
  }[];
}

// Candidate discovery ONLY. This relaxed key is never used by runtime lookup.
function candidateKey(name: string): string {
  return normalizeInstructorName(name.normalize('NFKD').replace(/\p{M}/gu, '').replace(/[-‐‑–—]/g, ' '));
}

export function auditInstructors(
  dataset: LocalDataset,
  current: Readonly<Record<string, readonly string[]>>,
): readonly InstructorAuditEntry[] {
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    throw new Error('Expected a current-instructor course-to-names object.');
  }
  const coursesByName = new Map<string, Set<string>>();
  for (const [course, names] of Object.entries(current)) {
    if (!course.trim() || !Array.isArray(names) || names.some(name => typeof name !== 'string' || !name.trim())) {
      throw new Error('Expected course keys and arrays of nonempty instructor names.');
    }
    for (const rawName of names) {
      const name = rawName.trim().replace(/\s+/g, ' ');
      if (!coursesByName.has(name)) coursesByName.set(name, new Set());
      coursesByName.get(name)!.add(course.trim());
    }
  }

  const candidatesByKey = new Map<string, Set<ProfessorRecord>>();
  const recordsByLookupKey = new Map<string, Set<ProfessorRecord>>();
  const histories = new Map<string, Set<string>>();
  for (const grade of dataset.historicalCourseGrades) {
    if (!histories.has(grade.professorId)) histories.set(grade.professorId, new Set());
    histories.get(grade.professorId)!.add(`${grade.subjectCode} ${grade.catalogNumber}`);
  }
  for (const professor of dataset.professors) {
    const forms = [professor.displayName, ...professor.aliases];
    for (const form of forms) {
      const key = normalizeInstructorName(form);
      if (!recordsByLookupKey.has(key)) recordsByLookupKey.set(key, new Set());
      recordsByLookupKey.get(key)!.add(professor);
    }
    for (const name of [...forms]) {
      const parts = name.split(',').map(part => part.trim());
      if (parts.length === 2 && parts.every(Boolean)) {
        forms.push(`${parts[1]} ${parts[0]}`, `${parts[1].split(/\s+/)[0]} ${parts[0]}`);
      }
    }
    for (const form of forms) {
      const key = candidateKey(form);
      if (!candidatesByKey.has(key)) candidatesByKey.set(key, new Set());
      candidatesByKey.get(key)!.add(professor);
    }
  }

  return [...coursesByName].sort(([a], [b]) => a.localeCompare(b, 'en-US')).map(([name, courses]) => {
    // Narrow by the same strict normalization, then use the real lookup policy.
    const match = lookupProfessor({ ...dataset, professors: [...(recordsByLookupKey.get(normalizeInstructorName(name)) ?? [])] }, name);
    const direct = match.status === 'found' ? [match.record] : match.status === 'ambiguous' ? [...match.candidates] : [];
    const possible = [...new Set([...direct, ...(candidatesByKey.get(candidateKey(name)) ?? [])])];
    const matchedHasData = match.status === 'found' && (match.record.rating !== null || histories.has(match.record.id));
    const status = match.status === 'ambiguous' ? 'ambiguous' :
      match.status === 'found' && (matchedHasData || possible.length === 1) ? 'matched' :
      possible.length > 1 ? 'ambiguous' : possible.length === 1 ? 'needs-evidence' : 'no-candidate';
    return {
      name, courses: [...courses].sort(), status, reviewRequired: status !== 'matched' || possible.length > 1,
      candidates: possible.map(professor => ({
        id: professor.id, displayName: professor.displayName, aliases: professor.aliases,
        hasRating: professor.rating !== null,
        rmpUrl: professor.rating?.sourceProfessorId && /^\d+$/.test(professor.rating.sourceProfessorId)
          ? `https://www.ratemyprofessors.com/professor/${professor.rating.sourceProfessorId}` : null,
        historicalCourses: [...(histories.get(professor.id) ?? [])].sort(),
      })),
    };
  });
}
