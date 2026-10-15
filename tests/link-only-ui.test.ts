// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  createLinkOnlyInstructorDataService,
} from '../src/data/providers/link-only';
import { enhanceVisibleInstructorLinks } from '../src/instructor-badges';
import { closeProfessorDetailCard } from '../src/professor-detail-card';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

const LINK_ONLY_SERVICE = createLinkOnlyInstructorDataService();

function renderInstructor(
  displayName: string,
): RenderedInstructorContext {
  document.body.innerHTML = `
    <table><tbody><tr>
      <td data-sap-ui-column="fixture-socColInstructor">
        <a id="fixture-socEventInstructorLink"></a>
      </td>
    </tr></tbody></table>`;
  const link = document.querySelector<HTMLAnchorElement>('a')!;
  link.textContent = displayName;

  return {
    link,
    instructor: { displayName },
    section: {
      sectionCode: '001-000',
      eventId: 'E 00000001',
      teachingMethod: 'Lecture',
      scheduleText: 'Schedule Not Defined',
      locationText: 'UC San Diego',
      deliveryMode: 'unknown',
      instructors: [{ displayName }],
    },
    packageCode: 'P-001-001',
    course: {
      subjectCode: 'CSE',
      catalogNumber: '101',
      title: 'Fixture course',
    },
    term: null,
  };
}

function openCard(displayName = 'Alexandria Example-Surname') {
  const context = renderInstructor(displayName);
  enhanceVisibleInstructorLinks(
    document,
    [context],
    LINK_ONLY_SERVICE,
  );
  const badge = document.querySelector<HTMLButtonElement>(
    '.tritonlens-rating-badge',
  )!;
  badge.click();
  return { badge, context };
}

describe('link-only instructor UI', () => {
  beforeEach(() => {
    closeProfessorDetailCard();
    document.body.replaceChildren();
  });

  it('renders a neutral badge and a card with safe external links only', () => {
    const { badge } = openCard();
    const card = document.querySelector<HTMLElement>(
      '.tritonlens-detail-card',
    )!;

    expect(badge.textContent).toBe('View ratings');
    expect(badge.dataset.tritonlensDatasetKind).toBe('link-only');
    expect(badge.hasAttribute('data-tritonlens-rating')).toBe(false);
    expect(card.textContent).toContain('Alexandria Example-Surname');
    expect(card.textContent).toContain(
      'Ratings and historical grades are not included in this build.',
    );
    expect(card.textContent).not.toMatch(/\d\.\d \/ 5/);
    expect(card.textContent).not.toContain('Average GPA');
    expect(card.textContent).not.toContain('Updated');
    expect(
      card.querySelector('.tritonlens-grade-distribution'),
    ).toBeNull();

    const links = Array.from(
      card.querySelectorAll<HTMLAnchorElement>(
        '.tritonlens-detail-source-link',
      ),
    );
    expect(
      links.map((link) => ({
        text: link.textContent,
        href: link.href,
        target: link.target,
        rel: link.rel,
      })),
    ).toEqual([
      {
        text: 'View ratings on RateMyProfessors',
        href: 'https://www.ratemyprofessors.com/search/professors/1079?q=Alexandria+Example-Surname',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      {
        text: 'Open the UCSD A.S. grade archive',
        href: 'https://dev-as.ucsd.edu/Home/InstructorGradeArchive',
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    ]);
  });

  it('closes from its close button and restores badge focus', () => {
    const { badge } = openCard();

    document
      .querySelector<HTMLButtonElement>('.tritonlens-detail-close')!
      .click();

    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(document.activeElement).toBe(badge);
  });

  it('toggles closed on a repeated badge click', () => {
    const { badge } = openCard();
    badge.click();

    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(badge.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on an outside click', () => {
    openCard();
    document.body.click();

    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
  });

  it('closes on Escape and restores badge focus', () => {
    const { badge } = openCard();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(document.activeElement).toBe(badge);
  });
});
