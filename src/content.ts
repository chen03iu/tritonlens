import { startTritonLens } from './content-runtime';
import { DIRECT_DATASET } from './data/direct-dataset';
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
    ...createLocalDatasetProviderSet(DIRECT_DATASET),
  }),
);
