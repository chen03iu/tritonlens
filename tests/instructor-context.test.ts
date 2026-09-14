// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { extractCourseOffering } from '../src/tss/dom-parser';
import {
  extractInstructorContexts,
} from '../src/tss/instructor-context';

function renderCourseOffering(
  instructorName: string,
): void {
  document.body.innerHTML = `
    <input
      id="example::FilterField::AcademicYear-inner-inner"
      value="2026/2027"
    >

    <input
      id="example::FilterField::AcademicPeriod-inner-inner"
      value="Fall Quarter"
    >

    <div id="example--fe::ObjectPage-headerTitle">
      <h2 class="sapMTitle">
        <span>Introduction to African American Studies</span>
      </h2>
    </div>

    <div class="socPkgBlock">
      <span class="socPkgName">
        AAS-010R (P-001-001)
      </span>

      <table>
        <tbody>
          <tr id="example-socEventRow">
            <td data-sap-ui-column="example-socColSection">
              <span id="example-socEventKeyText">
                001-000
              </span>

              <span id="example-socEventIdText">
                E 00004309
              </span>
            </td>

            <td data-sap-ui-column="example-socColMethod">
              Lecture
            </td>

            <td data-sap-ui-column="example-socColSched">
              Live Online
            </td>

            <td data-sap-ui-column="example-socColInstructor">
              <a id="example-socEventInstructorLink">
                ${instructorName}
              </a>
            </td>

            <td data-sap-ui-column="example-socColLocation">
              MC Online
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

describe('extractInstructorContexts', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('connects a rendered link to its normalized context', () => {
    renderCourseOffering('Libby Butler');

    const courseOffering =
      extractCourseOffering(document);

    if (!courseOffering) {
      throw new Error('Course offering was not extracted');
    }

    const contexts = extractInstructorContexts(
      courseOffering,
      document,
    );

    const link =
      document.querySelector<HTMLAnchorElement>(
        'a[id*="socEventInstructorLink"]',
      );

    expect(contexts).toHaveLength(1);
    expect(contexts[0]?.link).toBe(link);

    expect(contexts[0]).toMatchObject({
      instructor: {
        displayName: 'Libby Butler',
      },
      course: {
        subjectCode: 'AAS',
        catalogNumber: '010R',
      },
      term: {
        academicYear: '2026/2027',
        academicPeriod: 'Fall Quarter',
      },
      packageCode: 'P-001-001',
      section: {
        sectionCode: '001-000',
        eventId: 'E 00004309',
      },
    });
  });

  it('ignores an empty instructor link', () => {
    renderCourseOffering('   ');

    const courseOffering =
      extractCourseOffering(document);

    if (!courseOffering) {
      throw new Error('Course offering was not extracted');
    }

    expect(
      extractInstructorContexts(
        courseOffering,
        document,
      ),
    ).toEqual([]);
  });

  it('ignores a stale package from another course', () => {
    renderCourseOffering('Libby Butler');

    const courseOffering =
      extractCourseOffering(document);

    if (!courseOffering) {
      throw new Error('Course offering was not extracted');
    }

    const stalePackage = document.createElement('div');
    stalePackage.className = 'socPkgBlock';
    stalePackage.innerHTML = `
      <span class="socPkgName">
        CSE-011 (P-001-001)
      </span>

      <table>
        <tbody>
          <tr id="stale-socEventRow">
            <td data-sap-ui-column="stale-socColSection">
              <span id="stale-socEventKeyText">001-000</span>
              <span id="stale-socEventIdText">E 00004309</span>
            </td>

            <td data-sap-ui-column="stale-socColInstructor">
              <a id="stale-socEventInstructorLink">
                Libby Butler
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    document.body.prepend(stalePackage);

    const contexts = extractInstructorContexts(
      courseOffering,
      document,
    );

    expect(contexts).toHaveLength(1);
    expect(contexts[0]?.course.subjectCode).toBe('AAS');
    expect(contexts[0]?.link.id).toBe(
      'example-socEventInstructorLink',
    );
  });
});
