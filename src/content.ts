import { enhanceVisibleInstructorLinks } from './instructor-badges';
import { extractCourseOffering } from './tss/dom-parser';
import {
  extractInstructorContexts,
} from './tss/instructor-context';

let scanScheduled = false;

function scanTssPage(): void {
  const courseOffering = extractCourseOffering(document);

  const instructorContexts = courseOffering
    ? extractInstructorContexts(courseOffering, document)
    : [];

  enhanceVisibleInstructorLinks(
    document,
    instructorContexts,
  );
}

function scheduleTssScan(): void {
  if (scanScheduled) {
    return;
  }

  scanScheduled = true;

  requestAnimationFrame(() => {
    scanScheduled = false;
    scanTssPage();
  });
}

const tssObserver = new MutationObserver(scheduleTssScan);

tssObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

scheduleTssScan();
