// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceVisibleInstructorLinks } from '../src/instructor-badges';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

function createContext(
  link: HTMLAnchorElement,
): RenderedInstructorContext {
  return {
    link,
    instructor: {
      displayName: 'Libby Butler',
    },
    course: {
      subjectCode: 'AAS',
      catalogNumber: '010R',
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
          displayName: 'Libby Butler',
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

    expect(badge?.textContent).toBe('★ 4.5 demo');
    expect(link.getAttribute('data-tritonlens-enhanced')).toBe('true');
    expect(
      badge?.getAttribute('data-tritonlens-course'),
    ).toBe('AAS-010R');

    expect(
      badge?.getAttribute('data-tritonlens-section'),
    ).toBe('001-000');
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
});