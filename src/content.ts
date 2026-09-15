import { enhanceVisibleInstructorLinks } from './instructor-badges';
import { EASY_A_DATASET } from './data/easy-a-dataset';
import { closeProfessorDetailCard } from './professor-detail-card';
import { extractCourseOffering } from './tss/dom-parser';
import {
  extractInstructorContexts,
} from './tss/instructor-context';

let scanScheduled = false;
let scanFailed = false;

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

function removeFailedScanUi(): void {
  closeProfessorDetailCard();
  document.querySelectorAll(OWN_UI_SELECTOR).forEach((element) => {
    element.remove();
  });
  document.querySelectorAll('[data-tritonlens-enhanced]').forEach((link) => {
    link.removeAttribute('data-tritonlens-enhanced');
  });
}

function scanTssPage(): void {
  const courseOffering = extractCourseOffering(document);

  const instructorContexts = courseOffering
    ? extractInstructorContexts(courseOffering, document)
    : [];

  enhanceVisibleInstructorLinks(
    document,
    instructorContexts,
    EASY_A_DATASET,
  );
}

function scheduleTssScan(): void {
  if (scanScheduled) {
    return;
  }

  scanScheduled = true;

  requestAnimationFrame(() => {
    scanScheduled = false;
    try {
      scanTssPage();
      scanFailed = false;
    } catch {
      // Never log error objects or DOM/session data from an authenticated page.
      if (!scanFailed) {
        console.warn(
          'TritonLens could not update course details; it will retry on the next page change.',
        );
      }
      scanFailed = true;
      try {
        removeFailedScanUi();
      } catch {
        // Cleanup is best-effort if the page's DOM APIs also fail.
      }
    }
  });
}

const tssObserver = new MutationObserver((records) => {
  if (records.some(isTssMutation)) {
    scheduleTssScan();
  }
});

tssObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

scheduleTssScan();
