import {
  createLinkOnlyInstructorDataService,
} from './data/providers/link-only';
import { startTritonLens } from './content-runtime';

startTritonLens(createLinkOnlyInstructorDataService());
