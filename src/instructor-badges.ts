import type {
  RenderedInstructorContext,
} from './tss/instructor-context';

const INSTRUCTOR_LINK_SELECTOR =
  'td[data-sap-ui-column*="socColInstructor"] a[id*="socEventInstructorLink"]';
const ENHANCED_ATTRIBUTE = 'data-tritonlens-enhanced';
const RATING_BADGE_CLASS = 'tritonlens-rating-badge';

function findInstructorLinks(
  root: ParentNode = document,
): HTMLAnchorElement[] {
  const links =
    root.querySelectorAll<HTMLAnchorElement>(INSTRUCTOR_LINK_SELECTOR);

  return Array.from(links);
}

function createMockRatingBadge(
  context: RenderedInstructorContext,
): HTMLSpanElement {
  const badge = document.createElement('span');

  badge.className = RATING_BADGE_CLASS;
  badge.textContent = '★ 4.5 demo';
  badge.title = 'Demo data — not a real professor rating';
  badge.setAttribute('aria-label', 'Demo rating: 4.5 out of 5');

  applyContextToBadge(badge, context);
  return badge;
}

function findExistingRatingBadge(
  link: HTMLAnchorElement,
): HTMLSpanElement | null {
  const sibling = link.nextElementSibling;

  if (
    sibling instanceof HTMLSpanElement &&
    sibling.classList.contains(RATING_BADGE_CLASS)
  ) {
    return sibling;
  }

  return null;
}

function applyContextToBadge(
  badge: HTMLSpanElement,
  context: RenderedInstructorContext,
): void {
  badge.dataset.tritonlensInstructor =
    context.instructor.displayName;

  badge.dataset.tritonlensCourse =
    `${context.course.subjectCode}-${context.course.catalogNumber}`;

  badge.dataset.tritonlensPackage =
    context.packageCode;

  badge.dataset.tritonlensSection =
    context.section.sectionCode;

  if (context.term) {
    badge.dataset.tritonlensAcademicYear =
      context.term.academicYear;

    badge.dataset.tritonlensAcademicPeriod =
      context.term.academicPeriod;
  } else {
    delete badge.dataset.tritonlensAcademicYear;
    delete badge.dataset.tritonlensAcademicPeriod;
  }
}

function enhanceInstructorLink(
  link: HTMLAnchorElement,
  context: RenderedInstructorContext | null,
): void {
  const instructorName = link.textContent?.trim() ?? '';
  const existingBadge = findExistingRatingBadge(link);

  if (!instructorName || !context) {
    existingBadge?.remove();
    link.removeAttribute(ENHANCED_ATTRIBUTE);
    return;
  }

  if (existingBadge) {
    applyContextToBadge(existingBadge, context);
    link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    return;
  }

  link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
  link.insertAdjacentElement(
    'afterend',
    createMockRatingBadge(context),
  );
}

export function enhanceVisibleInstructorLinks(
  root: ParentNode = document,
  contexts: readonly RenderedInstructorContext[] = [],
): void {
  const contextByLink = new Map(
    contexts.map((context) => {
      return [context.link, context] as const;
    }),
  );

  findInstructorLinks(root).forEach((link) => {
    enhanceInstructorLink(
      link,
      contextByLink.get(link) ?? null,
    );
  });
}
