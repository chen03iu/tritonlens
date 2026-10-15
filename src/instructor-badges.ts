import type {
  InstructorDataService,
  InstructorInsight,
} from './data/providers/types';
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
    readonly service: InstructorDataService;
    readonly insight: InstructorInsight;
  }
>();

function findInstructorLinks(root: ParentNode): HTMLAnchorElement[] {
  return Array.from(
    root.querySelectorAll<HTMLAnchorElement>(INSTRUCTOR_LINK_SELECTOR),
  );
}

function clearMetricAttributes(badge: HTMLButtonElement): void {
  delete badge.dataset.tritonlensProfessorId;
  delete badge.dataset.tritonlensProfessorMatch;
  delete badge.dataset.tritonlensProfessorLookup;
  delete badge.dataset.tritonlensRating;
  delete badge.dataset.tritonlensGradeLookup;
  delete badge.dataset.tritonlensAverageGpa;
}

function applyContextToBadge(
  badge: HTMLButtonElement,
  context: RenderedInstructorContext,
): void {
  badge.dataset.tritonlensInstructor = context.instructor.displayName;
  badge.dataset.tritonlensCourse =
    `${context.course.subjectCode}-${context.course.catalogNumber}`;
  badge.dataset.tritonlensPackage = context.packageCode;
  badge.dataset.tritonlensSection = context.section.sectionCode;

  if (context.term) {
    badge.dataset.tritonlensAcademicYear = context.term.academicYear;
    badge.dataset.tritonlensAcademicPeriod = context.term.academicPeriod;
  } else {
    delete badge.dataset.tritonlensAcademicYear;
    delete badge.dataset.tritonlensAcademicPeriod;
  }
}

function applyLinkOnlyBadge(badge: HTMLButtonElement): void {
  clearMetricAttributes(badge);
  badge.textContent = 'View ratings';
  badge.title = 'Open external professor rating and grade resources';
  badge.setAttribute(
    'aria-label',
    'Open external professor rating and historical grade resources',
  );
}

function unavailableRatingCopy(
  badge: HTMLButtonElement,
  insight: InstructorInsight,
): void {
  badge.textContent = 'Rating unavailable';
  badge.title =
    insight.mode === 'mock'
      ? 'Fictional demo rating data unavailable for this instructor'
      : 'Rating data unavailable for this instructor';
  badge.setAttribute(
    'aria-label',
    insight.mode === 'mock'
      ? 'Demo rating data unavailable'
      : 'Instructor rating unavailable',
  );
  delete badge.dataset.tritonlensRating;
}

function applySnapshotBadge(
  badge: HTMLButtonElement,
  insight: InstructorInsight,
): void {
  badge.dataset.tritonlensProfessorLookup = insight.identity.status;

  if (insight.identity.status !== 'found') {
    unavailableRatingCopy(badge, insight);
    delete badge.dataset.tritonlensProfessorId;
    delete badge.dataset.tritonlensProfessorMatch;
    delete badge.dataset.tritonlensGradeLookup;
    delete badge.dataset.tritonlensAverageGpa;
    return;
  }

  badge.dataset.tritonlensProfessorId = insight.identity.identity.id;
  badge.dataset.tritonlensProfessorMatch =
    insight.identity.identity.matchMethod;

  if (insight.professorRating.status === 'found') {
    const displayedRating =
      insight.professorRating.data.rating.overallRating.toFixed(1);
    const suffix =
      insight.mode === 'mock'
        ? ' demo'
        : insight.mode === 'development-snapshot'
          ? ' dev'
          : '';

    badge.textContent = `★ ${displayedRating}${suffix}`;
    badge.title =
      insight.mode === 'mock'
        ? 'Fictional demo data — not real RMP or UCSD grade data'
        : insight.mode === 'development-snapshot'
          ? 'Development data snapshot — not approved for release'
          : 'Instructor rating';
    badge.setAttribute(
      'aria-label',
      (insight.mode === 'mock'
        ? 'Fictional demo rating: '
        : 'Instructor rating: ') + `${displayedRating} out of 5`,
    );
    badge.dataset.tritonlensRating = displayedRating;
  } else {
    unavailableRatingCopy(badge, insight);
  }

  badge.dataset.tritonlensGradeLookup = insight.historicalGrades.status;
  if (insight.historicalGrades.status !== 'found') {
    delete badge.dataset.tritonlensAverageGpa;
    return;
  }

  badge.dataset.tritonlensAverageGpa =
    insight.historicalGrades.data.record.averageGpa.toFixed(2);
  if (insight.professorRating.status === 'found') {
    return;
  }

  if (insight.mode === 'mock') {
    badge.textContent = 'Grades available demo';
    badge.title =
      'Fictional demo historical grades available; open instructor details';
    badge.setAttribute(
      'aria-label',
      'Rating unavailable; Demo historical grades available; open instructor details',
    );
  } else if (insight.mode === 'development-snapshot') {
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

function applyBadgeState(
  badge: HTMLButtonElement,
  context: RenderedInstructorContext,
  service: InstructorDataService,
): void {
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
      previousState.service !== service)
  ) {
    closeProfessorDetailCardForTrigger(badge);
  }

  const insight = service.getInsight(context);
  stateByBadge.set(badge, { context, contextKey, service, insight });
  applyContextToBadge(badge, context);
  badge.dataset.tritonlensDatasetKind = insight.mode;

  if (insight.mode === 'link-only') {
    applyLinkOnlyBadge(badge);
  } else {
    applySnapshotBadge(badge, insight);
  }
}

function createRatingBadge(
  context: RenderedInstructorContext,
  service: InstructorDataService,
): HTMLButtonElement {
  const badge = document.createElement('button');
  badge.type = 'button';
  badge.className = RATING_BADGE_CLASS;
  badge.setAttribute('aria-expanded', 'false');
  badge.setAttribute('aria-controls', DETAIL_CARD_ID_PREFIX + nextDetailCardId);
  nextDetailCardId += 1;

  badge.addEventListener('click', (event) => {
    event.stopPropagation();
    const state = stateByBadge.get(badge);
    if (state) {
      toggleProfessorDetailCard(badge, state.context, state.insight);
    }
  });

  applyBadgeState(badge, context, service);
  return badge;
}

function findExistingRatingBadge(
  link: HTMLAnchorElement,
): HTMLElement | null {
  const sibling = link.nextElementSibling;
  return sibling instanceof HTMLElement &&
    sibling.classList.contains(RATING_BADGE_CLASS)
    ? sibling
    : null;
}

function enhanceInstructorLink(
  link: HTMLAnchorElement,
  context: RenderedInstructorContext | null,
  service: InstructorDataService,
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
    applyBadgeState(existingBadge, context, service);
    link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    return;
  }

  existingBadge?.remove();
  link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
  link.insertAdjacentElement('afterend', createRatingBadge(context, service));
}

export function enhanceVisibleInstructorLinks(
  root: ParentNode,
  contexts: readonly RenderedInstructorContext[],
  service: InstructorDataService,
): void {
  closeDetachedProfessorDetailCard();
  const contextByLink = new Map(
    contexts.map((context) => [context.link, context] as const),
  );
  findInstructorLinks(root).forEach((link) => {
    enhanceInstructorLink(link, contextByLink.get(link) ?? null, service);
  });
}
