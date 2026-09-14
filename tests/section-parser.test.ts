// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { extractSection } from '../src/tss/dom-parser';

describe('extractSection', () => {
  it('extracts an online TSS section row', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr id="example-socEventRow">
            <td data-sap-ui-column="example-socColSection">
              <span id="example-socEventKeyText">001-000</span>
              <span id="example-socEventIdText">E 00004309</span>
            </td>

            <td data-sap-ui-column="example-socColMethod">
              Lecture
            </td>

            <td data-sap-ui-column="example-socColSched">
              Tu, Th 05:00 PM - 06:20 PM Live Online
            </td>

            <td data-sap-ui-column="example-socColInstructor">
              <a id="example-socEventInstructorLink">
                Libby Butler
              </a>
              <span class="tritonlens-rating-badge">
                ★ 4.5 demo
              </span>
            </td>

            <td data-sap-ui-column="example-socColLocation">
              MC Online
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');

    if (!row) {
      throw new Error('Test section row was not created');
    }

    expect(extractSection(row)).toEqual({
      sectionCode: '001-000',
      eventId: 'E 00004309',
      teachingMethod: 'Lecture',
      scheduleText: 'Tu, Th 05:00 PM - 06:20 PM Live Online',
      locationText: 'MC Online',
      deliveryMode: 'live-online',
      instructors: [
        {
          displayName: 'Libby Butler',
        },
      ],
    });
  });

  it('handles a section without an assigned instructor', () => {
    document.body.innerHTML = `
      <table>
        <tbody>
          <tr id="example-socEventRow">
            <td data-sap-ui-column="example-socColSection">
              <span id="example-socEventKeyText">001-000</span>
              <span id="example-socEventIdText">EL00004107</span>
            </td>

            <td data-sap-ui-column="example-socColMethod">
              Lecture
            </td>

            <td data-sap-ui-column="example-socColSched">
              Schedule Not Defined
            </td>

            <td data-sap-ui-column="example-socColInstructor">
              <a id="example-socEventInstructorLink"></a>
            </td>

            <td data-sap-ui-column="example-socColLocation">
              UC San Diego
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const row = document.querySelector('tr');

    if (!row) {
      throw new Error('Test section row was not created');
    }

    const result = extractSection(row);

    expect(result?.instructors).toEqual([]);
    expect(result?.deliveryMode).toBe('unknown');
    expect(result?.scheduleText).toBe('Schedule Not Defined');
  });
});
