// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  enhanceVisibleInstructorLinks as enhanceWithService,
} from '../src/instructor-badges';
import { MOCK_DATASET } from '../src/data/mock-dataset';
import {
  createInstructorDataService,
} from '../src/data/providers/instructor-data-service';
import {
  createLocalDatasetProviderSet,
} from '../src/data/providers/local-dataset-providers';
import { closeProfessorDetailCard } from '../src/professor-detail-card';
import type { LocalDataset } from '../src/data/types';
import type {
  InstructorDataService,
  ProviderMode,
} from '../src/data/providers/types';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

function createSnapshotService(
  dataset: LocalDataset,
): InstructorDataService {
  const mode: ProviderMode =
    dataset.kind === 'mock'
      ? 'mock'
      : dataset.kind === 'production'
        ? 'production-snapshot'
        : 'development-snapshot';

  return createInstructorDataService({
    mode,
    modeLabel:
      mode === 'mock'
        ? 'Fictional demo data'
        : mode === 'development-snapshot'
          ? 'Development snapshot — not for release'
          : 'Data snapshot',
    ...createLocalDatasetProviderSet(dataset),
  });
}

const MOCK_SERVICE = createSnapshotService(MOCK_DATASET);

function enhanceVisibleInstructorLinks(
  root: ParentNode = document,
  contexts: readonly RenderedInstructorContext[] = [],
  service: InstructorDataService = MOCK_SERVICE,
): void {
  enhanceWithService(root, contexts, service);
}

function createContext(
  link: HTMLAnchorElement,
  instructorName = 'Libby Butler',
  catalogNumber = '010R',
): RenderedInstructorContext {
  return {
    link,
    instructor: {
      displayName: instructorName,
    },
    course: {
      subjectCode: 'AAS',
      catalogNumber,
      title: 'Introduction to African American Studies',
    },
    term: {
      academicYear: '2026/2027',
      academicPeriod: 'Fall Quarter',
    },
    packageCode: 'P-001-001',
    section: {
      sectionCode: '001-000',
      eventId: 'E 00004309',
      teachingMethod: 'Lecture',
      scheduleText: 'Live Online',
      locationText: 'MC Online',
      deliveryMode: 'live-online',
      instructors: [
        {
          displayName: instructorName,
        },
      ],
    },
  };
}

function renderInstructorLink(name: string): HTMLAnchorElement {
  document.body.innerHTML = `
    <table>
      <tbody>
        <tr>
          <td data-sap-ui-column="example-socColInstructor">
            <a id="example-socEventInstructorLink">${name}</a>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const link = document.querySelector<HTMLAnchorElement>(
    'a[id*="socEventInstructorLink"]',
  );

  if (!link) {
    throw new Error('Test instructor link was not created');
  }

  return link;
}

describe('enhanceVisibleInstructorLinks', () => {
  beforeEach(() => {
    closeProfessorDetailCard();
    document.body.replaceChildren();
  });

  it('adds a rating badge for a named instructor', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector('.tritonlens-rating-badge');

    expect(badge?.textContent).toBe('★ 4.6 demo');
    expect(link.getAttribute('data-tritonlens-enhanced')).toBe('true');
    expect(
      badge?.getAttribute('data-tritonlens-course'),
    ).toBe('AAS-010R');

    expect(
      badge?.getAttribute('data-tritonlens-section'),
    ).toBe('001-000');

    expect(
      badge?.getAttribute('data-tritonlens-professor-lookup'),
    ).toBe('found');

    expect(
      badge?.getAttribute('data-tritonlens-professor-match'),
    ).toBe('exact');

    expect(
      badge?.getAttribute('data-tritonlens-grade-lookup'),
    ).toBe('found');

    expect(
      badge?.getAttribute('data-tritonlens-average-gpa'),
    ).toBe('3.42');

    expect(badge).toBeInstanceOf(HTMLButtonElement);
    expect(badge?.getAttribute('type')).toBe('button');
    expect(badge?.getAttribute('aria-expanded')).toBe('false');
    expect(badge?.getAttribute('aria-controls')).toBeTruthy();
  });

  it('does not add duplicate badges after repeated scans', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);
    enhanceVisibleInstructorLinks(document, [context]);

    const badges = document.querySelectorAll('.tritonlens-rating-badge');

    expect(badges).toHaveLength(1);
  });

  it('does not add a badge for an empty instructor link', () => {
    renderInstructorLink('   ');

    enhanceVisibleInstructorLinks(document, []);

    expect(
      document.querySelector('.tritonlens-rating-badge'),
    ).toBeNull();
  });

  it('shows an explicit missing-data state', () => {
    const link = renderInstructorLink('Unknown Instructor');
    const context = createContext(
      link,
      'Unknown Instructor',
    );

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector(
      '.tritonlens-rating-badge',
    );

    expect(badge?.textContent).toBe('Rating unavailable');
    expect(
      badge?.getAttribute('data-tritonlens-professor-lookup'),
    ).toBe('not-found');
    expect(
      badge?.hasAttribute('data-tritonlens-rating'),
    ).toBe(false);
  });

  it('uses an injected development dataset without demo labeling', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);
    const developmentDataset: LocalDataset = {
      ...MOCK_DATASET,
      kind: 'development',
      sources: [
        {
          ...MOCK_DATASET.sources[0],
          id: 'test-rmp',
          label: 'Easy-A Radar RMP snapshot',
          category: 'professor-ratings',
          homepageUrl:
            'https://github.com/Edwardwang66/ucsd-easy-a-radar',
          permissionStatus: 'pending',
        },
        {
          ...MOCK_DATASET.sources[0],
          id: 'test-grades',
          label: 'Easy-A Radar UCSD grade snapshot',
          category: 'historical-grades',
          homepageUrl:
            'https://github.com/Edwardwang66/ucsd-easy-a-radar',
          permissionStatus: 'pending',
        },
      ],
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            overallRating: 1.2,
            sourceId: 'test-rmp',
            sourceProfessorId: '1410511',
          },
        },
      ],
      historicalCourseGrades: [
        {
          ...MOCK_DATASET.historicalCourseGrades[0],
          sampleSize: null,
          sourceId: 'test-grades',
        },
      ],
    };

    enhanceVisibleInstructorLinks(
      document,
      [context],
      createSnapshotService(developmentDataset),
    );

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );
    badge?.click();

    expect(badge?.textContent).toBe('★ 1.2 dev');
    expect(
      document.querySelector('.tritonlens-detail-card')
        ?.textContent,
    ).toContain('Development snapshot — not for release');
    expect(
      document.querySelector('.tritonlens-detail-card')
        ?.textContent,
    ).toContain('Unavailable');
    expect(
      document.querySelector('.tritonlens-detail-card')
        ?.textContent,
    ).not.toContain('Fictional demo data');
    expect(
      document.querySelector('.tritonlens-detail-card')
        ?.textContent,
    ).not.toContain('null students');

    const sourceLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(
        '.tritonlens-detail-source-link',
      ),
    );
    expect(
      sourceLinks.map((link) => ({
        text: link.textContent,
        href: link.href,
      })),
    ).toEqual([
      {
        text: 'Easy-A Radar RMP snapshot',
        href: 'https://github.com/Edwardwang66/ucsd-easy-a-radar',
      },
      {
        text: 'RateMyProfessors profile',
        href: 'https://www.ratemyprofessors.com/professor/1410511',
      },
      {
        text: 'Easy-A Radar UCSD grade snapshot',
        href: 'https://github.com/Edwardwang66/ucsd-easy-a-radar',
      },
    ]);
    expect(
      sourceLinks.every(
        (link) =>
          link.target === '_blank' &&
          link.rel === 'noopener noreferrer',
      ),
    ).toBe(true);
  });

  it('renders unsafe or malformed source URLs as plain text', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);
    const unsafeDataset: LocalDataset = {
      ...MOCK_DATASET,
      kind: 'development',
      sources: [
        {
          ...MOCK_DATASET.sources[0],
          homepageUrl: 'javascript:alert(1)',
        },
      ],
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: {
            ...MOCK_DATASET.professors[0].rating!,
            sourceProfessorId: 'not-numeric',
          },
        },
      ],
    };

    enhanceVisibleInstructorLinks(
      document,
      [context],
      createSnapshotService(unsafeDataset),
    );
    document
      .querySelector<HTMLButtonElement>('.tritonlens-rating-badge')
      ?.click();

    expect(
      document.querySelectorAll('.tritonlens-detail-source-link'),
    ).toHaveLength(0);
    expect(
      document.querySelector('.tritonlens-detail-card')?.textContent,
    ).toContain('TritonLens fictional demo data');
  });

  it('shows historical grades when a matched professor has no rating', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);
    const gradeOnlyDataset: LocalDataset = {
      ...MOCK_DATASET,
      kind: 'development',
      professors: [
        {
          ...MOCK_DATASET.professors[0],
          rating: null,
        },
      ],
      historicalCourseGrades: [
        MOCK_DATASET.historicalCourseGrades[0],
      ],
    };

    enhanceVisibleInstructorLinks(
      document,
      [context],
      createSnapshotService(gradeOnlyDataset),
    );

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );
    badge?.click();

    const cardText = document.querySelector(
      '.tritonlens-detail-card',
    )?.textContent;

    expect(badge?.textContent).toBe('Grades available dev');
    expect(badge?.getAttribute('aria-label')).not.toContain('Demo');
    expect(badge?.getAttribute('aria-label')).toContain(
      'Historical grades available',
    );
    expect(badge?.title).toContain('Historical grades available');
    expect(badge?.title).toContain('not approved for release');
    expect(cardText).toContain('Professor rating unavailable');
    expect(cardText).toContain('Average GPA');
    expect(cardText).toContain('3.42');
  });

  it('keeps professor and course-grade results separate', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(
      link,
      'Libby Butler',
      '170',
    );

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector(
      '.tritonlens-rating-badge',
    );

    expect(badge?.textContent).toBe('★ 4.6 demo');
    expect(
      badge?.getAttribute('data-tritonlens-professor-lookup'),
    ).toBe('found');
    expect(
      badge?.getAttribute('data-tritonlens-grade-lookup'),
    ).toBe('not-found');
    expect(
      badge?.hasAttribute('data-tritonlens-average-gpa'),
    ).toBe(false);

    (badge as HTMLButtonElement).click();
    const cardText = document.querySelector(
      '.tritonlens-detail-card',
    )?.textContent;
    expect(cardText).toContain('4.6 / 5');
    expect(cardText).toContain('Historical grade data unavailable');
  });

  it('removes a stale badge when the instructor becomes empty', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    link.textContent = '';

    enhanceVisibleInstructorLinks(document, []);

    expect(
      document.querySelector('.tritonlens-rating-badge'),
    ).toBeNull();

    expect(
      link.hasAttribute('data-tritonlens-enhanced'),
    ).toBe(false);
  });

  it('opens a detail card with distinct rating and historical-grade data', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );

    badge?.click();

    const card = document.querySelector(
      '.tritonlens-detail-card',
    );

    expect(badge?.getAttribute('aria-expanded')).toBe('true');
    expect(card?.getAttribute('role')).toBe('dialog');
    expect(card?.textContent).toContain('Libby Butler');
    expect(card?.textContent).toContain('Fictional demo data');
    expect(card?.textContent).toContain('Professor rating');
    expect(card?.textContent).toContain('4.6 / 5');
    expect(card?.textContent).toContain('Difficulty');
    expect(card?.textContent).toContain('2.8 / 5');
    expect(card?.textContent).toContain('42 ratings');
    expect(card?.textContent).toContain('86%');
    expect(card?.textContent).toContain(
      'Historical AAS-010R grades',
    );
    expect(card?.textContent).toContain('Average GPA');
    expect(card?.textContent).toContain('3.42');
    expect(card?.textContent).toContain('120 students');
    expect(card?.textContent).toContain('4 offerings');
    expect(card?.textContent).toContain('Grade distribution');
    expect(card?.textContent).toContain('A58%');
    expect(card?.textContent).toContain('W1%');
    expect(card?.textContent).toContain(
      'Historical results are not a prediction.',
    );
    expect(document.activeElement).toBe(
      card?.querySelector('.tritonlens-detail-close'),
    );
  });

  it('renders an accessible proportional bar chart for historical grade percentages', () => {
    const link = renderInstructorLink('Libby Butler');
    enhanceVisibleInstructorLinks(document, [createContext(link)]);

    document
      .querySelector<HTMLButtonElement>('.tritonlens-rating-badge')
      ?.click();

    const chart = document.querySelector<HTMLElement>(
      '.tritonlens-grade-distribution',
    );
    const aBar = chart?.querySelector<HTMLElement>(
      '[data-tritonlens-grade="A"]',
    );
    const aFill = aBar?.querySelector<HTMLElement>(
      '.tritonlens-grade-distribution-fill',
    );

    expect(chart?.getAttribute('role')).toBe('group');
    expect(chart?.getAttribute('aria-label')).toBe(
      'Historical grade distribution',
    );
    expect(chart?.querySelectorAll(
      '.tritonlens-grade-distribution-item',
    )).toHaveLength(6);
    expect(aBar?.getAttribute('tabindex')).toBe('0');
    expect(aBar?.getAttribute('aria-label')).toBe('A: 58%');
    expect(aBar?.title).toBe('A: 58%');
    expect(aFill?.style.getPropertyValue(
      '--tritonlens-grade-percent',
    )).toBe('58%');
    expect(chart?.querySelector('[data-tritonlens-grade="P"]'))
      .toBeNull();
  });

  it('shows unavailable states without inventing data', () => {
    const link = renderInstructorLink('Unknown Instructor');
    const context = createContext(link, 'Unknown Instructor');

    enhanceVisibleInstructorLinks(document, [context]);

    document
      .querySelector<HTMLButtonElement>('.tritonlens-rating-badge')
      ?.click();

    const card = document.querySelector(
      '.tritonlens-detail-card',
    );

    expect(card?.textContent).toContain('Unknown Instructor');
    expect(card?.textContent).toContain(
      'Professor rating unavailable',
    );
    expect(card?.textContent).toContain(
      'Historical grade data unavailable',
    );
    expect(card?.textContent).not.toContain('4.6');
    expect(card?.textContent).not.toContain('3.42');
  });

  it('preserves an open card across unchanged scans with recreated contexts', () => {
    const link = renderInstructorLink('Libby Butler');
    enhanceVisibleInstructorLinks(document, [createContext(link)]);
    const badge = document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!;
    badge.click();
    const card = document.querySelector('.tritonlens-detail-card');
    enhanceVisibleInstructorLinks(document, [createContext(link)]);
    expect(document.querySelector('.tritonlens-detail-card')).toBe(card);
    expect(badge.getAttribute('aria-expanded')).toBe('true');
  });

  it.each(['instructor', 'course', 'term'])(
    'closes a stale card when the %s changes on a reused link',
    (change) => {
      const link = renderInstructorLink('Libby Butler');
      const context = createContext(link);
      enhanceVisibleInstructorLinks(document, [context]);
      const badge = document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!;
      badge.click();
      const next = change === 'term' ? context : createContext(link, 'Libby Butler', '170');
      if (change === 'instructor') {
        link.textContent = 'Chadwick Campbell';
        Object.assign(next.instructor, { displayName: 'Chadwick Campbell' });
        Object.assign(next.section, {
          instructors: [{ displayName: 'Chadwick Campbell' }],
        });
      } else if (change === 'term') {
        Object.assign(next.term!, { academicPeriod: 'Winter Quarter' });
      }
      enhanceVisibleInstructorLinks(document, [next]);
      expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
      expect(badge.getAttribute('aria-expanded')).toBe('false');
      expect(document.querySelectorAll('.tritonlens-rating-badge')).toHaveLength(1);
      badge.click();
      expect(document.querySelector('.tritonlens-detail-title')?.textContent)
        .toBe(change === 'instructor' ? 'Chadwick Campbell' : 'Libby Butler');
      if (change !== 'term') {
        expect(document.querySelector('.tritonlens-detail-card')?.textContent)
          .toContain('Historical AAS-170 grades');
      }
    },
  );

  it('closes an orphaned card when TSS replaces the instructor table', () => {
    const link = renderInstructorLink('Libby Butler');
    enhanceVisibleInstructorLinks(document, [createContext(link)]);
    const badge = document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!;
    badge.click();
    document.querySelector('table')!.remove();
    enhanceVisibleInstructorLinks(document, []);
    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(badge.getAttribute('aria-expanded')).toBe('false');
  });

  it('toggles the detail card when its badge is clicked again', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );

    badge?.click();
    badge?.click();

    expect(
      document.querySelector('.tritonlens-detail-card'),
    ).toBeNull();
    expect(badge?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the detail card on an outside click', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );

    badge?.click();
    document.body.click();

    expect(
      document.querySelector('.tritonlens-detail-card'),
    ).toBeNull();
    expect(badge?.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the detail card when Escape is pressed', () => {
    const link = renderInstructorLink('Libby Butler');
    const context = createContext(link);

    enhanceVisibleInstructorLinks(document, [context]);

    const badge = document.querySelector<HTMLButtonElement>(
      '.tritonlens-rating-badge',
    );

    badge?.click();
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
      }),
    );

    expect(
      document.querySelector('.tritonlens-detail-card'),
    ).toBeNull();
    expect(badge?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(badge);
  });
});
