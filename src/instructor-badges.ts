import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
} from './data/lookup';
import { MOCK_DATASET } from './data/mock-dataset';
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
  applyBadgeState(badge, context);
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

function applyLocalDataToBadge(
  badge: HTMLSpanElement,
  context: RenderedInstructorContext,
): void {
  const professorResult = lookupProfessor(
    MOCK_DATASET,
    context.instructor.displayName,
  );

  badge.dataset.tritonlensDatasetKind = MOCK_DATASET.kind;
  badge.dataset.tritonlensProfessorLookup =
    professorResult.status;

  if (professorResult.status !== 'found') {
    badge.textContent = 'Rating unavailable';
    badge.title =
      'Fictional demo rating data unavailable for this instructor';
    badge.setAttribute(
      'aria-label',
      'Demo rating data unavailable',
    );

    delete badge.dataset.tritonlensProfessorId;
    delete badge.dataset.tritonlensProfessorMatch;
    delete badge.dataset.tritonlensRating;
    delete badge.dataset.tritonlensGradeLookup;
    delete badge.dataset.tritonlensAverageGpa;
    return;
  }

  const professor = professorResult.record;
  const rating = professor.rating;

  badge.dataset.tritonlensProfessorId = professor.id;
  badge.dataset.tritonlensProfessorMatch =
    professorResult.matchMethod;

  if (rating) {
    const displayedRating = rating.overallRating.toFixed(1);

    badge.textContent = '★ ' + displayedRating + ' demo';
    badge.title =
      'Fictional demo data — not real RMP or UCSD grade data';
    badge.setAttribute(
      'aria-label',
      'Fictional demo rating: ' +
        displayedRating +
        ' out of 5',
    );
    badge.dataset.tritonlensRating = displayedRating;
  } else {
    badge.textContent = 'Rating unavailable';
    badge.title =
      'Fictional demo rating data unavailable for this instructor';
    badge.setAttribute(
      'aria-label',
      'Demo rating data unavailable',
    );
    delete badge.dataset.tritonlensRating;
  }

  const gradeResult = lookupHistoricalCourseGrades(
    MOCK_DATASET,
    professor.id,
    context.course.subjectCode,
    context.course.catalogNumber,
  );

  badge.dataset.tritonlensGradeLookup = gradeResult.status;

  if (gradeResult.status === 'found') {
    badge.dataset.tritonlensAverageGpa =
      gradeResult.record.averageGpa.toFixed(2);
  } else {
    delete badge.dataset.tritonlensAverageGpa;
  }
}

function applyBadgeState(
  badge: HTMLSpanElement,
  context: RenderedInstructorContext,
): void {
  applyContextToBadge(badge, context);
  applyLocalDataToBadge(badge, context);
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
    applyBadgeState(existingBadge, context);
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
