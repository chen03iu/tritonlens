// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { extractTerm } from '../src/tss/dom-parser';

describe('extractTerm', () => {
  it('extracts the academic year and period', () => {
    document.body.innerHTML = `
      <input
        id="example::FilterField::AcademicYear-inner-inner"
        value="2026/2027"
      >

      <input
        id="example::FilterField::AcademicPeriod-inner-inner"
        value="Fall Quarter"
      >
    `;

    expect(extractTerm(document)).toEqual({
      academicYear: '2026/2027',
      academicPeriod: 'Fall Quarter',
    });
  });

  it('returns null when part of the term is missing', () => {
    document.body.innerHTML = `
      <input
        id="example::FilterField::AcademicYear-inner-inner"
        value="2026/2027"
      >
    `;

    expect(extractTerm(document)).toBeNull();
  });
});