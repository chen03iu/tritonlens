import { describe, expect, it } from 'vitest';
import {
  classifyDeliveryMode,
  parsePackageLabel,
  parseSeatMetric,
} from '../src/tss/dom-parser';

describe('parsePackageLabel', () => {
  it('parses a TSS package label', () => {
    expect(parsePackageLabel('AAS-010R (P-001-001)')).toEqual({
      subjectCode: 'AAS',
      catalogNumber: '010R',
      packageCode: 'P-001-001',
    });
  });

  it('returns null for an invalid package label', () => {
    expect(parsePackageLabel('invalid')).toBeNull();
  });

  it('rejects extra text after the package label', () => {
    expect(
      parsePackageLabel('AAS-010R (P-001-001) unexpected text'),
    ).toBeNull();
  });
});

describe('parseSeatMetric', () => {
  it('parses seat counts including zero', () => {
    expect(parseSeatMetric('Limit: 38')).toBe(38);
    expect(parseSeatMetric('Available: 0')).toBe(0);
    expect(parseSeatMetric('Waitlisted: 11')).toBe(11);
  });

  it('returns null when no number is available', () => {
    expect(parseSeatMetric('N/A')).toBeNull();
    expect(parseSeatMetric(null)).toBeNull();
  });
});

describe('classifyDeliveryMode', () => {
  it('recognizes a live-online section', () => {
    expect(
      classifyDeliveryMode(
        'Tu, Th 05:00 PM - 06:20 PM Live Online',
        'MC Online',
      ),
    ).toBe('live-online');
  });

  it('recognizes an in-person section', () => {
    expect(
      classifyDeliveryMode(
        'Tu, Th 11:00 AM - 12:20 PM In Person @ Podemos Room 0132',
        'UC San Diego',
      ),
    ).toBe('in-person');
  });

  it('recognizes mixed and unknown delivery modes', () => {
    expect(
      classifyDeliveryMode(
        'Lecture Live Online\nFinal Examination In Person @ Center Hall',
        'MC Online',
      ),
    ).toBe('mixed');

    expect(
      classifyDeliveryMode('Schedule Not Defined', 'UC San Diego'),
    ).toBe('unknown');
  });
});
