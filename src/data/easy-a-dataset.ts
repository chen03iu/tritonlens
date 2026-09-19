import generatedDataset from './easy-a-dataset.generated.json';
import type { LocalDataset } from './types';
import { validateLocalDataset } from './validation';
import { applyReviewedCorrections } from './reviewed-corrections';
import { consolidateSourceIdentities } from './consolidate-source-identities';
import { consolidateCurrentInstructorStubs } from './consolidate-current-instructor-stubs';
import currentInstructorEvidence from './current-instructor-evidence.generated.json';

const candidateDataset = consolidateCurrentInstructorStubs(
  consolidateSourceIdentities(applyReviewedCorrections(generatedDataset as unknown as LocalDataset)),
  currentInstructorEvidence.entries,
);
const validationResult = validateLocalDataset(candidateDataset);

if (!validationResult.valid) {
  throw new Error(
    'Generated Easy-A dataset failed validation: ' +
      validationResult.issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; '),
  );
}

export const EASY_A_DATASET: LocalDataset = candidateDataset;
