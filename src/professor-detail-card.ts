import type {
  DataSourceReference,
  HistoricalGradeDistribution,
  ProfessorRating,
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
  return String(value);
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

function appendRatingMetrics(section: HTMLElement, rating: ProfessorRating): void {
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
}

function profileLink(id: string): ExternalDataLink | null {
  return /^\d+$/.test(id) ? {kind:'professor-ratings',label:'RateMyProfessors profile',url:`https://www.ratemyprofessors.com/professor/${id}`} : null;
}

function appendProfessorRating(card: HTMLDivElement, insight: InstructorInsight): void {
  const section=document.createElement('section');
  section.className='tritonlens-detail-section';
  appendTextElement(section,'h4','tritonlens-detail-heading','Professor rating');
  card.append(section);
  const result=insight.professorRating,profiles=result.profiles??[];
  const primary=profiles.find(item=>item.isPrimary),others=profiles.filter(item=>!item.isPrimary);
  if (primary && others.length) {
    appendTextElement(section,'h5','tritonlens-detail-subheading',`Primary RMP profile: ${primary.profile.displayName}`);
    appendTextElement(section,'p','tritonlens-profile-context',[primary.profile.schoolName,primary.profile.department].filter(Boolean).join(' · '));
  }
  if (result.status==='found') {
    appendRatingMetrics(section,result.data.rating);
    appendSource(section,result.data.source,result.data.rating.updatedAt,insight.links.find(link=>link.kind==='professor-ratings')??null);
  } else {
    appendTextElement(section,'p','tritonlens-detail-unavailable',primary?'No ratings reported':'Professor rating unavailable');
    if (primary) appendSource(section,primary.source,primary.profile.updatedAt,profileLink(primary.profile.sourceProfessorId));
  }
  if (!others.length) return;
  const details=document.createElement('details');
  details.className='tritonlens-other-profiles';
  appendTextElement(details,'summary','tritonlens-other-profiles-summary',`Other RMP profiles (${others.length})`);
  appendTextElement(details,'p','tritonlens-detail-note','Each profile is shown separately. Ratings and counts are not combined.');
  for (const {profile,source} of others) {
    const other=document.createElement('section');other.className='tritonlens-other-profile';
    other.setAttribute('aria-label',`Other RMP profile: ${profile.displayName}`);
    appendTextElement(other,'h5','tritonlens-detail-heading',profile.displayName);
    appendTextElement(other,'p','tritonlens-profile-context',[profile.schoolName,profile.department].filter(Boolean).join(' · '));
    if (profile.rating) appendRatingMetrics(other,profile.rating);
    else appendTextElement(other,'p','tritonlens-detail-unavailable','No ratings reported');
    appendSource(other,source,profile.updatedAt,profileLink(profile.sourceProfessorId));
    details.append(other);
  }
  section.append(details);
  details.addEventListener('toggle',()=>{if(activeCard===card&&activeTrigger)positionCard(card,activeTrigger);});
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
    const terms = record.terms;
    const values = document.createElement('div');
    if (terms?.length) {
      const quarterNames = {WI:'Winter',SP:'Spring',FA:'Fall',SU:'Summer',S1:'Summer Session 1',S2:'Summer Session 2'};
      if (terms.length > 1) {
        const label = appendTextElement(section, 'label', 'tritonlens-term-label', 'Historical term');
        const select = document.createElement('select');
        select.className = 'tritonlens-term-select';
        select.setAttribute('aria-label', 'Historical term');
        terms.forEach((term, index) => {
          const option = document.createElement('option');
          option.value = String(index);
          option.textContent = `${quarterNames[term.quarter]} ${term.year}`;
          select.append(option);
        });
        label.append(select);
        select.addEventListener('change', () => {
          renderValues(Number(select.value));
          if (activeTrigger) positionCard(card, activeTrigger);
        });
      } else {
        appendTextElement(section, 'p', 'tritonlens-detail-note', `${quarterNames[terms[0].quarter]} ${terms[0].year}`);
      }
    }
    section.append(values);
    function renderValues(index: number): void {
      values.replaceChildren();
      const selected = terms?.[index] ?? record;
    const metrics = document.createElement('dl');
    metrics.className = 'tritonlens-detail-metrics';
    values.append(metrics);
    appendMetric(metrics, terms ? 'Term GPA' : 'Average GPA', selected.averageGpa === null ? 'Unavailable' : selected.averageGpa.toFixed(2));
    appendMetric(
      metrics,
      'Sample size',
      record.sampleSize === null ? 'Unavailable' : `${record.sampleSize} students`,
    );
    appendMetric(metrics, 'Course offerings', `${record.offeringCount} offerings`);
    appendGradeDistribution(values, selected.gradeDistribution);
    if (terms) {
      const percentages = Object.values(selected.gradeDistribution).filter((value): value is number => value !== null);
      if (!percentages.length) {
        appendTextElement(values, 'p', 'tritonlens-detail-note', 'No grade percentages were reported for this term.');
      } else {
        const total = percentages.reduce((sum, value) => sum + value, 0);
        if (total < 99) appendTextElement(values, 'p', 'tritonlens-detail-note', `Reported percentages total ${Number(total.toFixed(2))}%. The archive does not identify the remaining share.`);
      }
    }
    }
    renderValues(0);
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

function appendSnapshotFallbackLinks(
  card: HTMLDivElement,
  insight: InstructorInsight,
): void {
  if (
    insight.professorRating.status === 'found' ||
    insight.links.length === 0
  ) {
    return;
  }
  const section = document.createElement('section');
  section.className = 'tritonlens-detail-section';
  appendTextElement(
    section,
    'h4',
    'tritonlens-detail-heading',
    'External resources',
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
  if (insight.modeLabel) {
    appendTextElement(
      titleGroup,
      'p',
      'tritonlens-detail-demo-label',
      insight.modeLabel,
    );
  }
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
    appendSnapshotFallbackLinks(card, insight);
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
