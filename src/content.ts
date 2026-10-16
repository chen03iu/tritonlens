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
    mode: 'pending-permission-snapshot',
    modeLabel: 'Data snapshot — source permissions pending',
    ...createLocalDatasetProviderSet(EASY_A_DATASET),
  }),
);
