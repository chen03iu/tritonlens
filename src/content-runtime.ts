import type {
  InstructorDataService,
} from './data/providers/types';
import { enhanceVisibleInstructorLinks } from './instructor-badges';
import { closeProfessorDetailCard } from './professor-detail-card';
import { extractCourseOffering } from './tss/dom-parser';
import {
  extractInstructorContexts,
} from './tss/instructor-context';

const OWN_UI_SELECTOR =
  '.tritonlens-rating-badge, .tritonlens-detail-card';

function isOwnUiNode(node: Node): boolean {
  const element = node instanceof Element ? node : node.parentElement;
  return !!element?.closest(OWN_UI_SELECTOR);
}

function isTssMutation(record: MutationRecord): boolean {
  if (isOwnUiNode(record.target)) {
    return false;
  }
  if (record.type === 'childList') {
    return Array.from(record.addedNodes)
      .concat(Array.from(record.removedNodes))
      .some((node) => !isOwnUiNode(node));
  }
  return true;
}

function removeExtensionUi(): void {
  closeProfessorDetailCard();
  document.querySelectorAll(OWN_UI_SELECTOR).forEach((element) => {
    element.remove();
  });
  document.querySelectorAll('[data-tritonlens-enhanced]').forEach((link) => {
    link.removeAttribute('data-tritonlens-enhanced');
  });
}

export function startTritonLens(
  service: InstructorDataService,
): () => void {
  let scanScheduled = false;
  let scanFailed = false;
  let stopped = false;

  function scanTssPage(): void {
    const courseOffering = extractCourseOffering(document);
    const instructorContexts = courseOffering
      ? extractInstructorContexts(courseOffering, document)
      : [];
    enhanceVisibleInstructorLinks(document, instructorContexts, service);
  }

  function scheduleTssScan(): void {
    if (scanScheduled || stopped) {
      return;
    }
    scanScheduled = true;
    requestAnimationFrame(() => {
      scanScheduled = false;
      if (stopped) {
        return;
      }
      try {
        scanTssPage();
        scanFailed = false;
      } catch {
        if (!scanFailed) {
          console.warn(
            'TritonLens could not update course details; it will retry on the next page change.',
          );
        }
        scanFailed = true;
        try {
          removeExtensionUi();
        } catch {
          // Cleanup is best-effort if the page's DOM APIs also fail.
        }
      }
    });
  }

  const observer = new MutationObserver((records) => {
    if (records.some(isTssMutation)) {
      scheduleTssScan();
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  scheduleTssScan();

  return () => {
    stopped = true;
    observer.disconnect();
    removeExtensionUi();
  };
}
