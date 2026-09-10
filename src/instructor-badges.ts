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

function createMockRatingBadge(): HTMLSpanElement {
  const badge = document.createElement('span');

  badge.className = RATING_BADGE_CLASS;
  badge.textContent = '★ 4.5 demo';
  badge.title = 'Demo data — not a real professor rating';
  badge.setAttribute('aria-label', 'Demo rating: 4.5 out of 5');

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

function enhanceInstructorLink(link: HTMLAnchorElement): void {
  const instructorName = link.textContent?.trim() ?? '';
  const existingBadge = findExistingRatingBadge(link);

  if (!instructorName) {
    existingBadge?.remove();
    link.removeAttribute(ENHANCED_ATTRIBUTE);
    return;
  }

  if (existingBadge) {
    link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
    return;
  }

  link.setAttribute(ENHANCED_ATTRIBUTE, 'true');
  link.insertAdjacentElement('afterend', createMockRatingBadge());
}

export function enhanceVisibleInstructorLinks(
  root: ParentNode = document,
): void {
  findInstructorLinks(root).forEach(enhanceInstructorLink);
}
