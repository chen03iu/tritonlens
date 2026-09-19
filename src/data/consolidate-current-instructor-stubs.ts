import { normalizeInstructorName } from './lookup';
import type { LocalDataset, ProfessorRecord } from './types';

export interface CurrentInstructorEvidence {
  readonly name: string;
  readonly courses: readonly string[];
}

function subjectCode(course: string): string {
  return course.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
}

function evidenceNameKey(name: string): string {
  return normalizeInstructorName(name.normalize('NFKD').replace(/\p{M}/gu, ''));
}

function canonicalNameForms(displayName: string): { full: string; short: string } | null {
  const parts = displayName.split(',').map(part => part.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const firstName = parts[1].split(/\s+/)[0];
  return firstName ? { full: `${parts[1]} ${parts[0]}`, short: `${firstName} ${parts[0]}` } : null;
}

/**
 * Consolidate an empty current-term name stub only when one fuller snapshot
 * identity has the same first/last name and historical courses in the same
 * subject. The evidence list is generated offline and reviewed in Git.
 */
export function consolidateCurrentInstructorStubs(
  dataset: LocalDataset,
  evidence: readonly CurrentInstructorEvidence[],
): LocalDataset {
  if (dataset.kind !== 'development') return dataset;

  const histories = new Map<string, typeof dataset.historicalCourseGrades>();
  for (const grade of dataset.historicalCourseGrades) {
    histories.set(grade.professorId, [...(histories.get(grade.professorId) ?? []), grade]);
  }

  const recordsByDisplayKey = new Map<string, ProfessorRecord[]>();
  const fullTargetsByKey = new Map<string, ProfessorRecord[]>();
  const shortTargetsByKey = new Map<string, ProfessorRecord[]>();
  for (const record of dataset.professors) {
    const displayKey = evidenceNameKey(record.displayName);
    recordsByDisplayKey.set(displayKey, [...(recordsByDisplayKey.get(displayKey) ?? []), record]);
    const names = canonicalNameForms(record.displayName);
    if (!names) continue;
    const fullKey = evidenceNameKey(names.full);
    const shortKey = evidenceNameKey(names.short);
    fullTargetsByKey.set(fullKey, [...(fullTargetsByKey.get(fullKey) ?? []), record]);
    shortTargetsByKey.set(shortKey, [...(shortTargetsByKey.get(shortKey) ?? []), record]);
  }

  const removals = new Set<string>();
  const aliasesByTarget = new Map<string, Set<string>>();
  for (const item of evidence) {
    const lookupName = evidenceNameKey(item.name);
    const stubs = (recordsByDisplayKey.get(lookupName) ?? []).filter(record =>
      record.aliases.length === 0 && record.rating === null &&
      !histories.has(record.id),
    );
    if (stubs.length !== 1) continue;

    const currentSubjects = new Set(item.courses.map(subjectCode).filter(Boolean));
    const fullTargets = (fullTargetsByKey.get(lookupName) ?? [])
      .filter(record => record.id !== stubs[0].id);
    const targets = fullTargets.length > 0 ? fullTargets : (shortTargetsByKey.get(lookupName) ?? []).filter(record =>
      record.id !== stubs[0].id && (histories.get(record.id) ?? []).some(grade =>
        currentSubjects.has(grade.subjectCode.trim().toUpperCase()),
      ),
    );
    if (targets.length !== 1) continue;

    const stub = stubs[0];
    const target = targets[0];
    removals.add(stub.id);
    if (!aliasesByTarget.has(target.id)) aliasesByTarget.set(target.id, new Set(target.aliases));
    aliasesByTarget.get(target.id)!.add(stub.displayName);
  }

  if (!removals.size) return dataset;
  return {
    ...dataset,
    professors: dataset.professors
      .filter(record => !removals.has(record.id))
      .map(record => aliasesByTarget.has(record.id)
        ? { ...record, aliases: [...aliasesByTarget.get(record.id)!] }
        : record),
  };
}
