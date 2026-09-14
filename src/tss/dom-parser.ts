import type {
  CourseOffering,
  CoursePackage,
  DeliveryMode,
  Instructor,
  Section,
  Term,
} from '../domain/types';

const COURSE_TITLE_SELECTOR =
  '[id$="--fe::ObjectPage-headerTitle"] h2.sapMTitle > span';

const ACADEMIC_YEAR_SELECTOR =
  'input[id$="::FilterField::AcademicYear-inner-inner"]';

const ACADEMIC_PERIOD_SELECTOR =
  'input[id$="::FilterField::AcademicPeriod-inner-inner"]';

const PACKAGE_SELECTOR = '.socPkgBlock';
const PACKAGE_NAME_SELECTOR = '.socPkgName';
const SECTION_ROW_SELECTOR = 'tr[id*="socEventRow"]';

const LIMIT_SELECTOR =
  '[data-sap-ui*="socSeatLimitStatus"] > .sapMObjStatusText';

const AVAILABLE_SELECTOR =
  '[data-sap-ui*="socSeatAvailableStatus"] > .sapMObjStatusText';

const WAITLIST_SELECTOR =
  '[data-sap-ui*="socSeatWaitlistStatus"] > .sapMObjStatusText';

const SECTION_CODE_SELECTOR =
  'td[data-sap-ui-column*="socColSection"] [id*="socEventKeyText"]';

const EVENT_ID_SELECTOR =
  'td[data-sap-ui-column*="socColSection"] [id*="socEventIdText"]';

const METHOD_CELL_SELECTOR =
  'td[data-sap-ui-column*="socColMethod"]';

const SCHEDULE_CELL_SELECTOR =
  'td[data-sap-ui-column*="socColSched"]';

const LOCATION_CELL_SELECTOR =
  'td[data-sap-ui-column*="socColLocation"]';

const INSTRUCTOR_LINK_SELECTOR =
  'td[data-sap-ui-column*="socColInstructor"] a[id*="socEventInstructorLink"]';

function readText(
  root: ParentNode,
  selector: string,
): string | null {
  const text = root.querySelector(selector)?.textContent?.trim();

  return text || null;
}

function readInputValue(
  root: ParentNode,
  selector: string,
): string | null {
  const input = root.querySelector<HTMLInputElement>(selector);
  const value = input?.value.trim();

  return value || null;
}

export function extractCourseOffering(
  root: ParentNode = document,
): CourseOffering | null {
  const packageElements =
    root.querySelectorAll<Element>(PACKAGE_SELECTOR);
  const firstPackageElement = packageElements.item(0);

  if (!firstPackageElement) {
    return null;
  }

  const firstPackageLabel = readText(
    firstPackageElement,
    PACKAGE_NAME_SELECTOR,
  );
  const parsedCourseLabel = firstPackageLabel
    ? parsePackageLabel(firstPackageLabel)
    : null;

  if (!parsedCourseLabel) {
    return null;
  }

  const packages: CoursePackage[] = [];

  for (const packageElement of Array.from(packageElements)) {
    const packageLabel = readText(
      packageElement,
      PACKAGE_NAME_SELECTOR,
    );
    const parsedPackageLabel = packageLabel
      ? parsePackageLabel(packageLabel)
      : null;

    if (
      !parsedPackageLabel ||
      parsedPackageLabel.subjectCode !==
        parsedCourseLabel.subjectCode ||
      parsedPackageLabel.catalogNumber !==
        parsedCourseLabel.catalogNumber
    ) {
      continue;
    }

    const coursePackage =
      extractCoursePackage(packageElement);

    if (coursePackage) {
      packages.push(coursePackage);
    }
  }

  if (packages.length === 0) {
    return null;
  }

  return {
    course: {
      subjectCode: parsedCourseLabel.subjectCode,
      catalogNumber: parsedCourseLabel.catalogNumber,
      title: readText(root, COURSE_TITLE_SELECTOR),
    },
    term: extractTerm(root),
    packages,
  };
}

export function extractCoursePackage(
  packageElement: Element,
): CoursePackage | null {
  const packageLabel = readText(
    packageElement,
    PACKAGE_NAME_SELECTOR,
  );

  if (!packageLabel) {
    return null;
  }

  const parsedLabel = parsePackageLabel(packageLabel);

  if (!parsedLabel) {
    return null;
  }

  const sectionRows =
    packageElement.querySelectorAll(SECTION_ROW_SELECTOR);

  const sections: Section[] = [];

  for (const row of Array.from(sectionRows)) {
    const section = extractSection(row);

    if (section) {
      sections.push(section);
    }
  }

  return {
    packageCode: parsedLabel.packageCode,
    enrollment: {
      enrollmentLimit: parseSeatMetric(
        readText(packageElement, LIMIT_SELECTOR),
      ),

      availableSeats: parseSeatMetric(
        readText(packageElement, AVAILABLE_SELECTOR),
      ),

      waitlistCount: parseSeatMetric(
        readText(packageElement, WAITLIST_SELECTOR),
      ),
    },
    sections,
  };
}

export function extractSection(
  row: Element,
): Section | null {
  const sectionCode = readText(row, SECTION_CODE_SELECTOR);
  if (!sectionCode) {
    return null;
  }

  const eventId = readText(row, EVENT_ID_SELECTOR);
  const teachingMethod = readText(row, METHOD_CELL_SELECTOR);
  const scheduleText = readText(row, SCHEDULE_CELL_SELECTOR);
  const locationText = readText(row, LOCATION_CELL_SELECTOR);

  const instructorLinks =
    row.querySelectorAll<HTMLAnchorElement>(
      INSTRUCTOR_LINK_SELECTOR,
    );

  const instructors: Instructor[] = [];

  for (const link of Array.from(instructorLinks)) {
    const displayName = link.textContent?.trim();

    if (displayName) {
      instructors.push({
        displayName,
      });
    }
  }

  return {
    sectionCode,
    eventId,
    teachingMethod,
    scheduleText,
    locationText,
    deliveryMode: classifyDeliveryMode(
      scheduleText,
      locationText,
    ),
    instructors,
  };
}

export function extractTerm(
  root: ParentNode = document,
): Term | null {
  const academicYear = readInputValue(
    root,
    ACADEMIC_YEAR_SELECTOR,
  );

  const academicPeriod = readInputValue(
    root,
    ACADEMIC_PERIOD_SELECTOR,
  );

  if (!academicYear || !academicPeriod) {
    return null;
  }

  return {
    academicYear,
    academicPeriod,
  };
}

export interface ParsedPackageLabel {
  readonly subjectCode: string;
  readonly catalogNumber: string;
  readonly packageCode: string;
}

export function parsePackageLabel(
  label: string,
): ParsedPackageLabel | null {
  const match = label.trim().match(/^([A-Z]+)-([A-Z0-9]+)\s+\(([^)]+)\)$/);
  if (!match) {
    return null;
  }
  return {
    subjectCode: match[1],
    catalogNumber: match[2],
    packageCode: match[3],
  };
}

export function parseSeatMetric(
  text: string | null,
): number | null {
  const value = text?.match(/:\s*(\d+)/)?.[1];

  if (!value) {
    return null;
  }

  return Number.parseInt(value, 10);
}

export function classifyDeliveryMode(
  scheduleText: string | null,
  locationText: string | null,
): DeliveryMode {
  const combinedText = `${scheduleText ?? ''} ${locationText ?? ''}`;
  const hasOnline = /\bonline\b/i.test(combinedText);
  const hasInPerson = /\bin person\b/i.test(combinedText);

  if (hasOnline && hasInPerson) {
    return 'mixed';
  }

  if (hasOnline) {
    return 'live-online';
  }

  if (hasInPerson) {
    return 'in-person';
  }

  return 'unknown';
}
