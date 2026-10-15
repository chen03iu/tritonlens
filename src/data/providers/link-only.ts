import {
  createInstructorDataService,
} from './instructor-data-service';
import type {
  InstructorDataService,
} from './types';

const RMP_UCSD_SEARCH_URL =
  'https://www.ratemyprofessors.com/search/professors/1079';
const UCSD_GRADE_ARCHIVE_URL =
  'https://dev-as.ucsd.edu/Home/InstructorGradeArchive';

export function createLinkOnlyInstructorDataService(): InstructorDataService {
  return createInstructorDataService({
    mode: 'link-only',
    modeLabel: 'External links only',
    identityProvider: {
      lookup: () => ({ status: 'not-found' }),
    },
    ratingProvider: {
      lookup: () => ({ status: 'not-found' }),
    },
    gradesProvider: {
      lookup: () => ({ status: 'not-found' }),
    },
    linkProvider: {
      getLinks(context) {
        const rmpSearchUrl = new URL(RMP_UCSD_SEARCH_URL);
        rmpSearchUrl.searchParams.set(
          'q',
          context.instructor.displayName,
        );

        return [
          {
            kind: 'professor-ratings',
            label: 'View ratings on RateMyProfessors',
            url: rmpSearchUrl.href,
          },
          {
            kind: 'historical-grades',
            label: 'Open the UCSD A.S. grade archive',
            url: UCSD_GRADE_ARCHIVE_URL,
          },
        ];
      },
    },
  });
}
