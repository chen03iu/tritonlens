import { enhanceVisibleInstructorLinks } from './instructor-badges';

let scanScheduled = false;

function scheduleInstructorScan(): void {
  if (scanScheduled) {
    return;
  }

  scanScheduled = true;

  requestAnimationFrame(() => {
    scanScheduled = false;
    enhanceVisibleInstructorLinks();
  });
}

const instructorObserver = new MutationObserver(scheduleInstructorScan);

instructorObserver.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
});

scheduleInstructorScan();