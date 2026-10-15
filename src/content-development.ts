import { startTritonLens } from './content-runtime';
import { EASY_A_DATASET } from './data/easy-a-dataset';
import {
  createInstructorDataService,
} from './data/providers/instructor-data-service';
import {
  createLocalDatasetProviderSet,
} from './data/providers/local-dataset-providers';

startTritonLens(
  createInstructorDataService({
    mode: 'development-snapshot',
    modeLabel: 'Development snapshot — not for release',
    ...createLocalDatasetProviderSet(EASY_A_DATASET),
  }),
);
