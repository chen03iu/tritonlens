import generatedDataset from './easy-a-dataset.generated.json';
import type { LocalDataset } from './types';
import { validateLocalDataset } from './validation';

const candidateDataset =
  generatedDataset as unknown as LocalDataset;
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
