// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import { enhanceVisibleInstructorLinks } from '../src/instructor-badges';

function renderInstructorLink(name: string): HTMLAnchorElement {
  document.body.innerHTML = `
    <table>
      <tbody>
        <tr>
          <td data-sap-ui-column="example-socColInstructor">
            <a id="example-socEventInstructorLink">${name}</a>
          </td>
        </tr>
      </tbody>
    </table>
  `;

  const link = document.querySelector<HTMLAnchorElement>(
    'a[id*="socEventInstructorLink"]',
  );

  if (!link) {
    throw new Error('Test instructor link was not created');
  }

  return link;
}

describe('enhanceVisibleInstructorLinks', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('adds a rating badge for a named instructor', () => {
    const link = renderInstructorLink('Libby Butler');

    enhanceVisibleInstructorLinks(document);

    const badge = document.querySelector('.tritonlens-rating-badge');

    expect(badge?.textContent).toBe('★ 4.5 demo');
    expect(link.getAttribute('data-tritonlens-enhanced')).toBe('true');
  });

  it('does not add duplicate badges after repeated scans', () => {
    renderInstructorLink('Libby Butler');

    enhanceVisibleInstructorLinks(document);
    enhanceVisibleInstructorLinks(document);

    const badges = document.querySelectorAll('.tritonlens-rating-badge');

    expect(badges).toHaveLength(1);
  });

  it('does not add a badge for an empty instructor link', () => {
    renderInstructorLink('   ');

    enhanceVisibleInstructorLinks(document);

    expect(
      document.querySelector('.tritonlens-rating-badge'),
    ).toBeNull();
  });

  it('removes a stale badge when the instructor becomes empty', () => {
    const link = renderInstructorLink('Libby Butler');

    enhanceVisibleInstructorLinks(document);
    link.textContent = '';
    enhanceVisibleInstructorLinks(document);

    expect(
      document.querySelector('.tritonlens-rating-badge'),
    ).toBeNull();

    expect(
      link.hasAttribute('data-tritonlens-enhanced'),
    ).toBe(false);
  });
});