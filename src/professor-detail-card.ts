import type {
  DataSourceReference,
  HistoricalGradeDistribution,
} from './data/types';
import type {
  ExternalDataLink,
  InstructorInsight,
} from './data/providers/types';
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
  appendTextElement(list, 'dt', 'tritonlens-detail-metric-label', label);
  appendTextElement(list, 'dd', 'tritonlens-detail-metric-value', value);
}

function formatPercentage(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1).replace(/\.0$/, '');
}

function appendGradeDistribution(
  section: HTMLElement,
  distribution: HistoricalGradeDistribution,
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

  appendTextElement(section, 'h5', 'tritonlens-detail-subheading', 'Grade distribution');
  const list = document.createElement('div');
  list.className = 'tritonlens-grade-distribution';
  list.setAttribute('role', 'group');
  list.setAttribute('aria-label', 'Historical grade distribution');
  section.append(list);

  for (const [label, value] of entries) {
    if (value === null) {
      continue;
    }
    const percentage = `${formatPercentage(value)}%`;
    const item = document.createElement('div');
    item.className = 'tritonlens-grade-distribution-item';
    item.dataset.tritonlensGrade = label;
    item.tabIndex = 0;
    item.setAttribute('aria-label', `${label}: ${percentage}`);
    item.title = `${label}: ${percentage}`;
    list.append(item);
    appendTextElement(item, 'span', 'tritonlens-grade-distribution-label', label);
    const track = document.createElement('span');
    track.className = 'tritonlens-grade-distribution-track';
    track.setAttribute('aria-hidden', 'true');
    item.append(track);
    const fill = document.createElement('span');
    fill.className = 'tritonlens-grade-distribution-fill';
    fill.style.setProperty('--tritonlens-grade-percent', percentage);
    track.append(fill);
    appendTextElement(item, 'span', 'tritonlens-grade-distribution-value', percentage);
  }
}

function safeHttpsUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function appendExternalLink(
  parent: HTMLElement,
  label: string,
  url: string | null,
): boolean {
  const safeUrl = safeHttpsUrl(url);
  if (!safeUrl) {
    return false;
  }
  const link = document.createElement('a');
  link.className = 'tritonlens-detail-source-link';
  link.href = safeUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  parent.append(link);
  return true;
}

function appendSource(
  section: HTMLElement,
  source: DataSourceReference,
  updatedAt: string,
  detailLink: ExternalDataLink | null = null,
): void {
  const sourceLine = document.createElement('p');
  sourceLine.className = 'tritonlens-detail-source';
  sourceLine.append(document.createTextNode('Source: '));
  if (!appendExternalLink(sourceLine, source.label, source.homepageUrl)) {
    sourceLine.append(document.createTextNode(source.label));
  }
  if (detailLink) {
    const separator = document.createTextNode(' · ');
    sourceLine.append(separator);
    if (!appendExternalLink(sourceLine, detailLink.label, detailLink.url)) {
      separator.remove();
    }
  }
  sourceLine.append(document.createTextNode(` · Updated ${updatedAt}`));
  section.append(sourceLine);
}

function appendProfessorRating(
  card: HTMLDivElement,
  insight: InstructorInsight,
): void {
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section';
  appendTextElement(section, 'h4', 'tritonlens-detail-heading', 'Professor rating');
  card.append(section);

  if (insight.professorRating.status !== 'found') {
    appendTextElement(section, 'p', 'tritonlens-detail-unavailable', 'Professor rating unavailable');
    return;
  }

  const { rating, source } = insight.professorRating.data;
  const metrics = document.createElement('dl');
  metrics.className = 'tritonlens-detail-metrics';
  section.append(metrics);
  appendMetric(metrics, 'Rating', `${rating.overallRating.toFixed(1)} / 5`);
  appendMetric(
    metrics,
    'Difficulty',
    rating.difficulty === null ? 'Unavailable' : `${rating.difficulty.toFixed(1)} / 5`,
  );
  appendMetric(metrics, 'Rating count', `${rating.ratingCount} ratings`);
  appendMetric(
    metrics,
    'Would take again',
    rating.wouldTakeAgainPercent === null
      ? 'Unavailable'
      : `${rating.wouldTakeAgainPercent}%`,
  );
  appendSource(
    section,
    source,
    rating.updatedAt,
    insight.links.find((link) => link.kind === 'professor-ratings') ?? null,
  );
}

function appendHistoricalGrades(
  card: HTMLDivElement,
  context: RenderedInstructorContext,
  insight: InstructorInsight,
): void {
  const courseCode = `${context.course.subjectCode}-${context.course.catalogNumber}`;
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section';
  appendTextElement(
    section,
    'h4',
    'tritonlens-detail-heading',
    `Historical ${courseCode} grades`,
  );
  card.append(section);

  if (insight.historicalGrades.status !== 'found') {
    appendTextElement(section, 'p', 'tritonlens-detail-unavailable', 'Historical grade data unavailable');
  } else {
    const { record, source } = insight.historicalGrades.data;
    const metrics = document.createElement('dl');
    metrics.className = 'tritonlens-detail-metrics';
    section.append(metrics);
    appendMetric(metrics, 'Average GPA', record.averageGpa.toFixed(2));
    appendMetric(
      metrics,
      'Sample size',
      record.sampleSize === null ? 'Unavailable' : `${record.sampleSize} students`,
    );
    appendMetric(metrics, 'Course offerings', `${record.offeringCount} offerings`);
    appendGradeDistribution(section, record.gradeDistribution);
    appendSource(section, source, record.updatedAt);
  }
  appendTextElement(
    section,
    'p',
    'tritonlens-detail-note',
    'Historical results are not a prediction.',
  );
}

function appendLinkOnlyContent(
  card: HTMLDivElement,
  insight: InstructorInsight,
): void {
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section tritonlens-detail-link-only';
  appendTextElement(
    section,
    'p',
    'tritonlens-detail-unavailable',
    'Ratings and historical grades are not included in this build.',
  );
  const links = document.createElement('div');
  links.className = 'tritonlens-detail-external-links';
  section.append(links);
  for (const link of insight.links) {
    appendExternalLink(links, link.label, link.url);
  }
  card.append(section);
}

function createDetailCard(
  trigger: HTMLButtonElement,
  context: RenderedInstructorContext,
  insight: InstructorInsight,
): HTMLDivElement {
  const card = document.createElement('div');
  card.className = CARD_CLASS;
  card.id = trigger.getAttribute('aria-controls') ?? '';
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
    insight.modeLabel,
  );
  const closeButton = appendTextElement(header, 'button', 'tritonlens-detail-close', '×');
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', 'Close instructor details');
  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    closeProfessorDetailCard();
    trigger.focus();
  });

  if (insight.mode === 'link-only') {
    appendLinkOnlyContent(card, insight);
  } else {
    appendProfessorRating(card, insight);
    appendHistoricalGrades(card, context, insight);
  }
  card.addEventListener('click', (event) => event.stopPropagation());
  return card;
}

function positionCard(card: HTMLDivElement, trigger: HTMLButtonElement): void {
  const triggerRect = trigger.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const maximumLeft = Math.max(
    VIEWPORT_MARGIN,
    window.innerWidth - cardRect.width - VIEWPORT_MARGIN,
  );
  const left = Math.min(Math.max(VIEWPORT_MARGIN, triggerRect.left), maximumLeft);
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

export function closeDetachedProfessorDetailCard(): void {
  if (activeTrigger && (!activeTrigger.isConnected || !activeCard?.isConnected)) {
    closeProfessorDetailCard();
  }
}

export function closeProfessorDetailCardForTrigger(trigger: HTMLElement): void {
  if (activeTrigger === trigger) {
    closeProfessorDetailCard();
  }
}

export function toggleProfessorDetailCard(
  trigger: HTMLButtonElement,
  context: RenderedInstructorContext,
  insight: InstructorInsight,
): void {
  if (activeTrigger === trigger && activeCard?.isConnected) {
    closeProfessorDetailCard();
    return;
  }
  closeProfessorDetailCard();
  const card = createDetailCard(trigger, context, insight);
  document.body.append(card);
  positionCard(card, trigger);
  activeCard = card;
  activeTrigger = trigger;
  trigger.setAttribute('aria-expanded', 'true');
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
  card.querySelector<HTMLButtonElement>('.tritonlens-detail-close')?.focus();
}
