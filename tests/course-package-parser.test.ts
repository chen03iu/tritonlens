// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { extractCoursePackage } from '../src/tss/dom-parser';

describe('extractCoursePackage', () => {
  it('extracts package metadata, seats, and section rows', () => {
    document.body.innerHTML = `
      <div class="socPkgBlock">
        <span class="socPkgName">
          CSE-003 (P-001-002)
        </span>

        <div data-sap-ui="example-socSeatLimitStatus">
          <span class="sapMObjStatusText">Limit: 50</span>
        </div>

        <div data-sap-ui="example-socSeatAvailableStatus">
          <span class="sapMObjStatusText">Available: 18</span>
          <span class="sapUiPseudoInvisibleText">Success</span>
        </div>

        <div data-sap-ui="example-socSeatWaitlistStatus">
          <span class="sapMObjStatusText">Waitlisted: 3</span>
        </div>

        <table>
          <tbody>
            <tr id="first-socEventRow">
              <td data-sap-ui-column="example-socColSection">
                <span id="first-socEventKeyText">001-000</span>
              </td>
            </tr>

            <tr id="second-socEventRow">
              <td data-sap-ui-column="example-socColSection">
                <span id="second-socEventKeyText">001-001</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    const packageElement =
      document.querySelector('.socPkgBlock');

    if (!packageElement) {
      throw new Error('Test package element was not created');
    }

    const result = extractCoursePackage(packageElement);

    expect(result?.packageCode).toBe('P-001-002');

    expect(result?.enrollment).toEqual({
      enrollmentLimit: 50,
      availableSeats: 18,
      waitlistCount: 3,
    });

    expect(
      result?.sections.map((section) => section.sectionCode),
    ).toEqual([
      '001-000',
      '001-001',
    ]);
  });
});