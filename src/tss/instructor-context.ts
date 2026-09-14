import type {
  Course,
  CourseOffering,
  Instructor,
  Section,
  Term,
} from '../domain/types';

import {
  extractSection,
  parsePackageLabel,
} from './dom-parser';

const PACKAGE_SELECTOR = '.socPkgBlock';
const PACKAGE_NAME_SELECTOR = '.socPkgName';
const SECTION_ROW_SELECTOR = 'tr[id*="socEventRow"]';

const INSTRUCTOR_LINK_SELECTOR =
  'td[data-sap-ui-column*="socColInstructor"] ' +
  'a[id*="socEventInstructorLink"]';

export interface RenderedInstructorContext {
  readonly link: HTMLAnchorElement;
  readonly instructor: Instructor;
  readonly section: Section;
  readonly packageCode: string;
  readonly course: Course;
  readonly term: Term | null;
}

export function extractInstructorContexts(
  courseOffering: CourseOffering,
  root: ParentNode = document,
): RenderedInstructorContext[] {
  const contexts: RenderedInstructorContext[] = [];

  const packageElements =
    root.querySelectorAll<Element>(PACKAGE_SELECTOR);

  for (const packageElement of Array.from(packageElements)) {
    const packageLabel =
      packageElement
        .querySelector(PACKAGE_NAME_SELECTOR)
        ?.textContent
        ?.trim();

    const parsedPackage = packageLabel
      ? parsePackageLabel(packageLabel)
      : null;

    if (!parsedPackage) {
      continue;
    }

    if (
      parsedPackage.subjectCode !==
        courseOffering.course.subjectCode ||
      parsedPackage.catalogNumber !==
        courseOffering.course.catalogNumber
    ) {
      continue;
    }

    const coursePackage = courseOffering.packages.find(
      (candidate) => {
        return candidate.packageCode === parsedPackage.packageCode;
      },
    );

    if (!coursePackage) {
      continue;
    }

    const rows =
      packageElement.querySelectorAll<Element>(
        SECTION_ROW_SELECTOR,
      );

    for (const row of Array.from(rows)) {
      const parsedSection = extractSection(row);

      if (!parsedSection) {
        continue;
      }

      const section = coursePackage.sections.find(
        (candidate) => {
          if (parsedSection.eventId) {
            return candidate.eventId === parsedSection.eventId;
          }

          return (
            candidate.sectionCode ===
            parsedSection.sectionCode
          );
        },
      );

      if (!section) {
        continue;
      }

      const links =
        row.querySelectorAll<HTMLAnchorElement>(
          INSTRUCTOR_LINK_SELECTOR,
        );

      for (const link of Array.from(links)) {
        const displayName = link.textContent?.trim();

        if (!displayName) {
          continue;
        }

        const instructor = section.instructors.find(
          (candidate) => {
            return candidate.displayName === displayName;
          },
        );

        if (!instructor) {
          continue;
        }

        contexts.push({
          link,
          instructor,
          section,
          packageCode: coursePackage.packageCode,
          course: courseOffering.course,
          term: courseOffering.term,
        });
      }
    }
  }

  return contexts;
}
