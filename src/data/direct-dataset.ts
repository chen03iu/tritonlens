import generated from './direct-source-dataset.generated.json';
import type {LocalDataset} from './types';
import {validateLocalDataset} from './validation';

// Reviewed corrections are applied offline before metrics refresh, not replayed
// against newer numeric values at runtime.
const dataset=generated as unknown as LocalDataset;
if(!validateLocalDataset(dataset).valid)throw new Error('Direct source dataset failed validation.');
export const DIRECT_DATASET:LocalDataset=dataset;
