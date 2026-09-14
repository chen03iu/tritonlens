import {
  lookupHistoricalCourseGrades,
  lookupProfessor,
} from './data/lookup';
import type {
  DataSourceReference,
  LocalDataset,
} from './data/types';
import type {
  RenderedInstructorContext,
} from './tss/instructor-context';

const CARD_CLASS = 'tritonlens-detail-card';
const VIEWPORT_MARGIN = 8;
const CARD_GAP = 6;

let activeCard: HTMLDivElement | null = null;
let activeTrigger: HTMLButtonElement | null = null;

function appendTextElement<K extends keyof HTMLElementTagNameMap>(
  parent: HTMLElement,
  tagName: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function appendMetric(
  list: HTMLDListElement,
  label: string,
  value: string,
): void {
  appendTextElement(
    list,
    'dt',
    'tritonlens-detail-metric-label',
    label,
  );
  appendTextElement(
    list,
    'dd',
    'tritonlens-detail-metric-value',
    value,
  );
}

function formatPercentage(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(/\.0$/, '');
}

function appendGradeDistribution(
  section: HTMLElement,
  distribution: LocalDataset['historicalCourseGrades'][number]['gradeDistribution'],
): void {
  const entries = [
    ['A', distribution.aPercent],
    ['B', distribution.bPercent],
    ['C', distribution.cPercent],
    ['D', distribution.dPercent],
    ['F', distribution.fPercent],
    ['W', distribution.wPercent],
    ['P', distribution.pPercent],
    ['NP', distribution.npPercent],
  ] as const;
  if (!entries.some(([, value]) => value !== null)) {
    return;
  }

  appendTextElement(
    section,
    'h5',
    'tritonlens-detail-subheading',
    'Grade distribution',
  );

  const list = document.createElement('div');
  list.className = 'tritonlens-grade-distribution';
  section.append(list);

  for (const [label, value] of entries) {
    if (value === null) {
      continue;
    }

    appendTextElement(
      list,
      'span',
      'tritonlens-grade-distribution-item',
      `${label}${formatPercentage(value)}%`,
    );
  }
}

function findSource(
  dataset: LocalDataset,
  sourceId: string,
): DataSourceReference | null {
  return (
    dataset.sources.find((source) => source.id === sourceId) ??
    null
  );
}

function appendSource(
  section: HTMLElement,
  dataset: LocalDataset,
  sourceId: string,
  updatedAt: string,
): void {
  const source = findSource(dataset, sourceId);
  const sourceLabel = source?.label ?? 'Unknown source';

  appendTextElement(
    section,
    'p',
    'tritonlens-detail-source',
    `Source: ${sourceLabel} · Updated ${updatedAt}`,
  );
}

function appendProfessorRating(
  card: HTMLDivElement,
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): string | null {
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section';
  appendTextElement(
    section,
    'h4',
    'tritonlens-detail-heading',
    'Professor rating',
  );
  card.append(section);

  const result = lookupProfessor(
    dataset,
    context.instructor.displayName,
  );

  if (result.status !== 'found') {
    appendTextElement(
      section,
      'p',
      'tritonlens-detail-unavailable',
      'Professor rating unavailable',
    );
    return null;
  }

  if (!result.record.rating) {
    appendTextElement(
      section,
      'p',
      'tritonlens-detail-unavailable',
      'Professor rating unavailable',
    );
    return result.record.id;
  }

  const rating = result.record.rating;
  const metrics = document.createElement('dl');
  metrics.className = 'tritonlens-detail-metrics';
  section.append(metrics);

  appendMetric(
    metrics,
    'Rating',
    `${rating.overallRating.toFixed(1)} / 5`,
  );
  appendMetric(
    metrics,
    'Difficulty',
    rating.difficulty === null
      ? 'Unavailable'
      : `${rating.difficulty.toFixed(1)} / 5`,
  );
  appendMetric(
    metrics,
    'Rating count',
    `${rating.ratingCount} ratings`,
  );
  appendMetric(
    metrics,
    'Would take again',
    rating.wouldTakeAgainPercent === null
      ? 'Unavailable'
      : `${rating.wouldTakeAgainPercent}%`,
  );
  appendSource(
    section,
    dataset,
    rating.sourceId,
    rating.updatedAt,
  );

  return result.record.id;
}

function appendHistoricalGrades(
  card: HTMLDivElement,
  context: RenderedInstructorContext,
  professorId: string | null,
  dataset: LocalDataset,
): void {
  const courseCode =
    `${context.course.subjectCode}-${context.course.catalogNumber}`;
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section';
  appendTextElement(
    section,
    'h4',
    'tritonlens-detail-heading',
    `Historical ${courseCode} grades`,
  );
  card.append(section);

  const result = professorId
    ? lookupHistoricalCourseGrades(
        dataset,
        professorId,
        context.course.subjectCode,
        context.course.catalogNumber,
      )
    : { status: 'not-found' as const };

  if (result.status !== 'found') {
    appendTextElement(
      section,
      'p',
      'tritonlens-detail-unavailable',
      'Historical grade data unavailable',
    );
  } else {
    const record = result.record;
    const metrics = document.createElement('dl');
    metrics.className = 'tritonlens-detail-metrics';
    section.append(metrics);

    appendMetric(
      metrics,
      'Average GPA',
      record.averageGpa.toFixed(2),
    );
    appendMetric(
      metrics,
      'Sample size',
      record.sampleSize === null
        ? 'Unavailable'
        : `${record.sampleSize} students`,
    );
    appendMetric(
      metrics,
      'Course offerings',
      `${record.offeringCount} offerings`,
    );
    appendGradeDistribution(section, record.gradeDistribution);
    appendSource(
      section,
      dataset,
      record.sourceId,
      record.updatedAt,
    );
  }

  appendTextElement(
    section,
    'p',
    'tritonlens-detail-note',
    'Historical results are not a prediction.',
  );
}

function createDetailCard(
  trigger: HTMLButtonElement,
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): HTMLDivElement {
  const card = document.createElement('div');
  const cardId = trigger.getAttribute('aria-controls');

  card.className = CARD_CLASS;
  card.id = cardId ?? '';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-modal', 'false');

  const header = document.createElement('div');
  header.className = 'tritonlens-detail-header';
  card.append(header);

  const titleGroup = document.createElement('div');
  titleGroup.className = 'tritonlens-detail-title-group';
  header.append(titleGroup);

  const title = appendTextElement(
    titleGroup,
    'h3',
    'tritonlens-detail-title',
    context.instructor.displayName,
  );
  title.id = `${card.id}-title`;
  card.setAttribute('aria-labelledby', title.id);

  appendTextElement(
    titleGroup,
    'p',
    'tritonlens-detail-demo-label',
    dataset.kind === 'mock'
      ? 'Fictional demo data'
      : dataset.kind === 'development'
        ? 'Development snapshot — not for release'
        : 'Data snapshot',
  );

  const closeButton = appendTextElement(
    header,
    'button',
    'tritonlens-detail-close',
    '×',
  );
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close instructor details');
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closeProfessorDetailCard();
    trigger.focus();
  });

  const professorId = appendProfessorRating(
    card,
    context,
    dataset,
  );
  appendHistoricalGrades(
    card,
    context,
    professorId,
    dataset,
  );

  card.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  return card;
}

function positionCard(
  card: HTMLDivElement,
  trigger: HTMLButtonElement,
): void {
  const triggerRect = trigger.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const maximumLeft = Math.max(
    VIEWPORT_MARGIN,
    window.innerWidth - cardRect.width - VIEWPORT_MARGIN,
  );
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, triggerRect.left),
    maximumLeft,
  );
  let top = triggerRect.bottom + CARD_GAP;

  if (
    top + cardRect.height > window.innerHeight - VIEWPORT_MARGIN &&
    triggerRect.top - cardRect.height - CARD_GAP >= VIEWPORT_MARGIN
  ) {
    top = triggerRect.top - cardRect.height - CARD_GAP;
  }

  const maximumTop = Math.max(
    VIEWPORT_MARGIN,
    window.innerHeight - cardRect.height - VIEWPORT_MARGIN,
  );

  card.style.left = `${Math.round(left)}px`;
  card.style.top = `${Math.round(Math.min(top, maximumTop))}px`;
}

function handleDocumentClick(): void {
  closeProfessorDetailCard();
}

function handleDocumentKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    const trigger = activeTrigger;
    closeProfessorDetailCard();
    trigger?.focus();
  }
}

export function closeProfessorDetailCard(): void {
  activeCard?.remove();
  activeTrigger?.setAttribute('aria-expanded', 'false');
  activeCard = null;
  activeTrigger = null;

  document.removeEventListener('click', handleDocumentClick);
  document.removeEventListener('keydown', handleDocumentKeydown);
}

export function closeProfessorDetailCardForTrigger(
  trigger: HTMLElement,
): void {
  if (activeTrigger === trigger) {
    closeProfessorDetailCard();
  }
}

export function toggleProfessorDetailCard(
  trigger: HTMLButtonElement,
  context: RenderedInstructorContext,
  dataset: LocalDataset,
): void {
  if (activeTrigger === trigger && activeCard?.isConnected) {
    closeProfessorDetailCard();
    return;
  }

  closeProfessorDetailCard();

  const card = createDetailCard(trigger, context, dataset);
  document.body.append(card);
  positionCard(card, trigger);

  activeCard = card;
  activeTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);

  card
    .querySelector<HTMLButtonElement>('.tritonlens-detail-close')
    ?.focus();
}
