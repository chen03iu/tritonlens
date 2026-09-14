// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { extractCourseOffering } from '../src/tss/dom-parser';

describe('extractCourseOffering', () => {
  it('extracts a course title and multiple packages', () => {
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
        <div>
          <h2 class="sapMTitle">
            <span>Introduction to African American Studies</span>
          </h2>
        </div>
      </div>

      <div class="socClassSections">
        <div class="socPkgBlock">
          <span class="socPkgName">
            AAS-010R (P-001-001)
          </span>
        </div>

        <div class="socPkgBlock">
          <span class="socPkgName">
            AAS-010R (P-001-002)
          </span>
        </div>
      </div>
    `;

    const result = extractCourseOffering(document);

    expect(result?.course).toEqual({
      subjectCode: 'AAS',
      catalogNumber: '010R',
      title: 'Introduction to African American Studies',
    });

    expect(result?.term).toEqual({
      academicYear: '2026/2027',
      academicPeriod: 'Fall Quarter',
    });

    expect(
      result?.packages.map((coursePackage) => {
        return coursePackage.packageCode;
      }),
    ).toEqual([
      'P-001-001',
      'P-001-002',
    ]);
  });
});
