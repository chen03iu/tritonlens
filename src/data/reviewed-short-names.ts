import batch from './reviewed-short-names.json';
import { normalizeInstructorName } from './lookup';
import type { LocalDataset, ProfessorRecord } from './types';

// Each entry was individually checked against external evidence recorded in the JSON.
// Source changes invalidate the review; a recommendation alone never enters this list.
export function applyReviewedShortNames(dataset: LocalDataset): LocalDataset {
  if (dataset.kind !== 'development') return dataset;
  let changed = false;
  const professors = dataset.professors.map(record => {
    const review = batch.entries.find(entry => entry.expectedRecord.id === record.id);
    if (!review || dataset.professors.filter(p => p.id === record.id).length !== 1) return record;
    const expected = review.expectedRecord as ProfessorRecord;
    const aliases = record.aliases.filter(alias => alias !== review.alias);
    if (record.displayName !== expected.displayName ||
        JSON.stringify(record.rating) !== JSON.stringify(expected.rating) ||
        JSON.stringify(aliases) !== JSON.stringify(expected.aliases)) return record;
    const key = normalizeInstructorName(review.alias);
    if (dataset.professors.some(other => other.id !== record.id &&
        [other.displayName, ...other.aliases].some(name => normalizeInstructorName(name) === key))) return record;
    if (record.aliases.includes(review.alias)) return record;
    changed = true;
    return { ...record, aliases: [...record.aliases, review.alias] };
  });
  return changed ? { ...dataset, professors } : dataset;
}
