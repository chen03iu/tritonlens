import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createLinkOnlyInstructorDataService,
} from '../src/data/providers/link-only';
import type {
  RenderedInstructorContext,
} from '../src/tss/instructor-context';

function createContext(displayName: string): RenderedInstructorContext {
  return {
    link: null as unknown as HTMLAnchorElement,
    instructor: { displayName },
    section: {
      sectionCode: '001-000',
      eventId: 'E 00000001',
      teachingMethod: 'Lecture',
      scheduleText: 'Schedule Not Defined',
      locationText: 'UC San Diego',
      deliveryMode: 'unknown',
      instructors: [{ displayName }],
    },
    packageCode: 'P-001-001',
    course: {
      subjectCode: 'CSE',
      catalogNumber: '101',
      title: 'Fixture course',
    },
    term: null,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('link-only instructor data service', () => {
  it('returns external links without professor or grade metrics', () => {
    const insight = createLinkOnlyInstructorDataService().getInsight(
      createContext('Libby Butler'),
    );

    expect(insight).toEqual({
      mode: 'link-only',
      identity: { status: 'not-found' },
      professorRating: { status: 'not-found' },
      historicalGrades: { status: 'not-found' },
      links: [
        {
          kind: 'professor-ratings',
          label: 'View ratings on RateMyProfessors',
          url: 'https://www.ratemyprofessors.com/search/professors/1079?q=Libby+Butler',
        },
        {
          kind: 'historical-grades',
          label: 'Open the UCSD A.S. grade archive',
          url: 'https://dev-as.ucsd.edu/Home/InstructorGradeArchive',
        },
      ],
    });
  });

  it('encodes an unusual instructor name exactly once', () => {
    const [ratingsLink] =
      createLinkOnlyInstructorDataService().getInsight(
        createContext("Zoë O'Neil & 李"),
      ).links;

    expect(ratingsLink.url).toBe(
      'https://www.ratemyprofessors.com/search/professors/1079?q=Zo%C3%AB+O%27Neil+%26+%E6%9D%8E',
    );
    expect(decodeURIComponent(ratingsLink.url)).toContain(
      "q=Zoë+O'Neil+&+李",
    );
  });

  it('returns only HTTPS destinations', () => {
    const links = createLinkOnlyInstructorDataService().getInsight(
      createContext('Libby Butler'),
    ).links;

    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(new URL(link.url).protocol).toBe('https:');
    }
  });

  it('performs no network request while producing links', () => {
    const fetch = vi.fn();
    const XMLHttpRequest = vi.fn();
    const sendBeacon = vi.fn();
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('XMLHttpRequest', XMLHttpRequest);
    vi.stubGlobal('navigator', { sendBeacon });

    const links = createLinkOnlyInstructorDataService().getInsight(
      createContext('Libby Butler'),
    ).links;
    links.map((link) => new URL(link.url).href);

    expect(fetch).not.toHaveBeenCalled();
    expect(XMLHttpRequest).not.toHaveBeenCalled();
    expect(sendBeacon).not.toHaveBeenCalled();
  });
});
