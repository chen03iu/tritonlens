// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceVisibleInstructorLinks } from '../src/instructor-badges';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

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
    expect(card?.textContent).toContain(
      'Historical results are not a prediction.',
    );
    expect(document.activeElement).toBe(
      card?.querySelector('.tritonlens-detail-close'),
    );
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
