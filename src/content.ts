import { enhanceVisibleInstructorLinks } from './instructor-badges';
import { extractCourseOffering } from './tss/dom-parser';

let scanScheduled = false;
let lastCourseOfferingSignature: string | null = null;

function scanTssPage(): void {
  enhanceVisibleInstructorLinks();

  const courseOffering = extractCourseOffering(document);

  if (!courseOffering) {
    lastCourseOfferingSignature = null;
    return;
  }

  const signature = JSON.stringify(courseOffering);

  if (signature === lastCourseOfferingSignature) {
    return;
  }

  lastCourseOfferingSignature = signature;

  console.log(
    'TritonLens parsed course offering:',
    courseOffering,
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
