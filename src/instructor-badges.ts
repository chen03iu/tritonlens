import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
} from './data/lookup';
import { MOCK_DATASET } from './data/mock-dataset';
import type { LocalDataset } from './data/types';
import type {
  RenderedInstructorContext,
} from './tss/instructor-context';
import {
  closeDetachedProfessorDetailCard,
  closeProfessorDetailCardForTrigger,
  toggleProfessorDetailCard,
} from './professor-detail-card';

const INSTRUCTOR_LINK_SELECTOR =
  'td[data-sap-ui-column*="socColInstructor"] a[id*="socEventInstructorLink"]';
const ENHANCED_ATTRIBUTE = 'data-tritonlens-enhanced';
const RATING_BADGE_CLASS = 'tritonlens-rating-badge';
const DETAIL_CARD_ID_PREFIX = 'tritonlens-detail-card-';

let nextDetailCardId = 1;

const stateByBadge = new WeakMap<
  HTMLButtonElement,
  {
    readonly context: RenderedInstructorContext;
    readonly contextKey: string;
    readonly dataset: LocalDataset;
  }
>();

function findInstructorLinks(
  root: ParentNode = document,
): HTMLAnchorElement[] {
  const links =
    root.querySelectorAll<HTMLAnchorElement>(INSTRUCTOR_LINK_SELECTOR);

  return Array.from(links);
}

function createRatingBadge(
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): HTMLButtonElement {
  const badge = document.createElement('button');

  badge.type = 'button';
  badge.className = RATING_BADGE_CLASS;
  badge.setAttribute('aria-expanded', 'false');
  badge.setAttribute(
    'aria-controls',
    DETAIL_CARD_ID_PREFIX + nextDetailCardId,
  );
  nextDetailCardId += 1;

  badge.addEventListener('click', (event) => {
    event.stopPropagation();

    const currentState = stateByBadge.get(badge);
    if (currentState) {
      toggleProfessorDetailCard(
        badge,
        currentState.context,
        currentState.dataset,
      );
    }
  });

  applyBadgeState(badge, context, dataset);
  return badge;
}

function findExistingRatingBadge(
  link: HTMLAnchorElement,
): HTMLElement | null {
  const sibling = link.nextElementSibling;

  if (
    sibling instanceof HTMLElement &&
    sibling.classList.contains(RATING_BADGE_CLASS)
  ) {
    return sibling;
  }

  return null;
}

function applyContextToBadge(
  badge: HTMLButtonElement,
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
  badge: HTMLButtonElement,
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): void {
  const professorResult = lookupProfessor(
    dataset,
    context.instructor.displayName,
  );

  badge.dataset.tritonlensDatasetKind = dataset.kind;
  badge.dataset.tritonlensProfessorLookup =
    professorResult.status;

  if (professorResult.status !== 'found') {
    badge.textContent = 'Rating unavailable';
    badge.title =
      dataset.kind === 'mock'
        ? 'Fictional demo rating data unavailable for this instructor'
        : 'Rating data unavailable for this instructor';
    badge.setAttribute(
      'aria-label',
      dataset.kind === 'mock'
        ? 'Demo rating data unavailable'
        : 'Instructor rating unavailable',
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

    const suffix =
      dataset.kind === 'mock'
        ? ' demo'
        : dataset.kind === 'development'
          ? ' dev'
          : '';

    badge.textContent = '★ ' + displayedRating + suffix;
    badge.title =
      dataset.kind === 'mock'
        ? 'Fictional demo data — not real RMP or UCSD grade data'
        : dataset.kind === 'development'
          ? 'Development data snapshot — not approved for release'
          : 'Instructor rating';
    badge.setAttribute(
      'aria-label',
      (dataset.kind === 'mock'
        ? 'Fictional demo rating: '
        : 'Instructor rating: ') +
        displayedRating +
        ' out of 5',
    );
    badge.dataset.tritonlensRating = displayedRating;
  } else {
    badge.textContent = 'Rating unavailable';
    badge.title =
      dataset.kind === 'mock'
        ? 'Fictional demo rating data unavailable for this instructor'
        : 'Rating data unavailable for this instructor';
    badge.setAttribute(
      'aria-label',
      dataset.kind === 'mock'
        ? 'Demo rating data unavailable'
        : 'Instructor rating unavailable',
    );
    delete badge.dataset.tritonlensRating;
  }

  const gradeResult = lookupHistoricalCourseGrades(
    dataset,
    professor.id,
    context.course.subjectCode,
    context.course.catalogNumber,
  );

  badge.dataset.tritonlensGradeLookup = gradeResult.status;

  if (gradeResult.status === 'found') {
    badge.dataset.tritonlensAverageGpa =
      gradeResult.record.averageGpa.toFixed(2);

    if (!rating) {
      if (dataset.kind === 'mock') {
        badge.textContent = 'Grades available demo';
        badge.title =
          'Fictional demo historical grades available; open instructor details';
        badge.setAttribute(
          'aria-label',
          'Rating unavailable; Demo historical grades available; open instructor details',
        );
      } else if (dataset.kind === 'development') {
        badge.textContent = 'Grades available dev';
        badge.title =
          'Historical grades available from a development snapshot — not approved for release; open instructor details';
        badge.setAttribute(
          'aria-label',
          'Rating unavailable; Historical grades available from a development snapshot not approved for release; open instructor details',
        );
      } else {
        badge.textContent = 'Grades available';
        badge.title =
          'Rating unavailable; Historical grades available; open instructor details';
        badge.setAttribute(
          'aria-label',
          'Rating unavailable; Historical grades available; open instructor details',
        );
      }
    }
  } else {
    delete badge.dataset.tritonlensAverageGpa;
  }
}

function applyBadgeState(
  badge: HTMLButtonElement,
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): void {
  // Compare values, not object references: TSS scans recreate contexts.
  // Keeping a snapshot also detects changes to a reused context object.
  const contextKey = JSON.stringify([
    context.instructor.displayName,
    context.course.subjectCode,
    context.course.catalogNumber,
    context.course.title,
    context.term?.academicYear ?? null,
    context.term?.academicPeriod ?? null,
    context.packageCode,
    context.section.sectionCode,
    context.section.eventId,
  ]);
  const previousState = stateByBadge.get(badge);

  if (
    previousState &&
    (previousState.contextKey !== contextKey ||
      previousState.dataset !== dataset)
  ) {
    closeProfessorDetailCardForTrigger(badge);
  }

  stateByBadge.set(badge, {
    context,
    contextKey,
    dataset,
  });
  applyContextToBadge(badge, context);
  applyLocalDataToBadge(badge, context, dataset);
}

function enhanceInstructorLink(
  link: HTMLAnchorElement,
  context: RenderedInstructorContext | null,
  dataset: LocalDataset,
): void {
  const instructorName = link.textContent?.trim() ?? '';
  const existingBadge = findExistingRatingBadge(link);

  if (!instructorName || !context) {
    if (existingBadge) {
      closeProfessorDetailCardForTrigger(existingBadge);
    }
    existingBadge?.remove();
    link.removeAttribute(ENHANCED_ATTRIBUTE);
    return;
  }

  if (existingBadge instanceof HTMLButtonElement) {
    applyBadgeState(existingBadge, context, dataset);
    link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    return;
  }

  existingBadge?.remove();

  link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
  link.insertAdjacentElement(
    'afterend',
    createRatingBadge(context, dataset),
  );
}

export function enhanceVisibleInstructorLinks(
  root: ParentNode = document,
  contexts: readonly RenderedInstructorContext[] = [],
  dataset: LocalDataset = MOCK_DATASET,
): void {
  closeDetachedProfessorDetailCard();

  const contextByLink = new Map(
    contexts.map((context) => {
      return [context.link, context] as const;
    }),
  );

  findInstructorLinks(root).forEach((link) => {
    enhanceInstructorLink(
      link,
      contextByLink.get(link) ?? null,
      dataset,
    );
  });
}
