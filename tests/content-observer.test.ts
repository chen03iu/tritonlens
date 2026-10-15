// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const NativeObserver = window.MutationObserver;
let observers: MutationObserver[];
let frames: FrameRequestCallback[];

function renderCourse(): void {
  document.body.innerHTML = `
    <div class="socPkgBlock">
      <span class="socPkgName">AAS-010R (P-001-001)</span>
      <table><tbody><tr id="fixture-socEventRow">
        <td data-sap-ui-column="socColSection">
          <span id="fixture-socEventKeyText">001-000</span>
          <span id="fixture-socEventIdText">E 00004309</span>
        </td>
        <td data-sap-ui-column="socColInstructor">
          <a id="fixture-socEventInstructorLink">Libby Butler</a>
        </td>
      </tr></tbody></table>
    </div>
    <button id="tss-action">TSS fixture action</button>`;
}

async function flushFrame(): Promise<void> {
  const callback = frames.shift();
  if (!callback) throw new Error('Expected a scheduled scan');
  callback(0);
  await Promise.resolve();
}

describe('TSS content observer', () => {
  beforeEach(() => {
    vi.resetModules();
    observers = [];
    frames = [];
    renderCourse();
    // Keep the real observer; track instances only for test teardown.
    vi.stubGlobal('MutationObserver', class extends NativeObserver {
      constructor(callback: MutationCallback) {
        super(callback);
        observers.push(this);
      }
    });
    // Drive animation frames deterministically without replacing DOM behavior.
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
  });

  afterEach(() => {
    observers.forEach((observer) => observer.disconnect());
    vi.restoreAllMocks();
    document.body.click();
    vi.unstubAllGlobals();
  });

  it('settles after badge injection instead of scheduling itself forever', async () => {
    await import('../src/content');
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('View ratings');
    expect(frames).toHaveLength(0);
  });

  it('keeps the Easy-A snapshot behind the development entry', async () => {
    await import('../src/content-development');
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('★ 2.7 dev');
    expect(frames).toHaveLength(0);
  });

  it('disconnects its observer and removes extension UI on cleanup', async () => {
    const { startTritonLens } = await import('../src/content-runtime');
    const { createLinkOnlyInstructorDataService } = await import(
      '../src/data/providers/link-only'
    );
    const stop = startTritonLens(
      createLinkOnlyInstructorDataService(),
    );
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')).not.toBeNull();

    stop();
    expect(document.querySelector('.tritonlens-rating-badge')).toBeNull();
    document.querySelector('a')!.textContent = 'Changed Instructor';
    await Promise.resolve();
    expect(frames).toHaveLength(0);
  });

  it('processes TSS changes even when the mutation batch includes badge changes', async () => {
    await import('../src/content-development');
    await flushFrame();
    document.querySelector('.tritonlens-rating-badge')!.textContent = 'Temporary UI update';
    document.querySelector('a')!.textContent = 'Unknown Instructor';
    await Promise.resolve();
    expect(frames).toHaveLength(1);
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('Rating unavailable');
    expect(frames).toHaveLength(0);
  });

  it('does not rescan for detail-card insertion or removal', async () => {
    await import('../src/content-development');
    await flushFrame();
    document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!.click();
    await Promise.resolve();
    expect(document.querySelector('.tritonlens-detail-card')).not.toBeNull();
    expect(frames).toHaveLength(0);
    document.body.click();
    await Promise.resolve();
    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(frames).toHaveLength(0);
  });

  it('contains a failed scan and recovers on the next TSS mutation', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../src/content-development');
    vi.spyOn(document, 'querySelectorAll').mockImplementationOnce(() => {
      throw new Error('Sensitive fixture detail must not be logged');
    });
    expect(() => frames.shift()!(0)).not.toThrow();
    await Promise.resolve();
    const action = document.querySelector<HTMLButtonElement>('#tss-action')!;
    let clicks = 0;
    action.addEventListener('click', () => { clicks += 1; });
    action.click();
    expect(clicks).toBe(1);
    expect(warning.mock.calls).toEqual([['TritonLens could not update course details; it will retry on the next page change.']]);
    document.querySelector('a')!.textContent = 'Libby Butler ';
    await Promise.resolve();
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('★ 2.7 dev');
    expect(frames).toHaveLength(0);
  });

  it('contains cleanup failures and retries without repeated warning spam', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../src/content-development');
    const failingDom = vi.spyOn(document, 'querySelectorAll').mockImplementation(() => {
      throw new Error('Persistent fixture DOM failure');
    });
    expect(() => frames.shift()!(0)).not.toThrow();
    await Promise.resolve();
    expect(frames).toHaveLength(0);
    document.getElementById('tss-action')!.append('Page update');
    await Promise.resolve();
    expect(() => frames.shift()!(0)).not.toThrow();
    await Promise.resolve();
    expect(warning).toHaveBeenCalledTimes(1);
    expect(frames).toHaveLength(0);
    failingDom.mockRestore();
    document.getElementById('tss-action')!.append('Page recovered');
    await Promise.resolve();
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('★ 2.7 dev');
  });

  it('removes stale extension UI after a scan fails without removing TSS nodes', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../src/content-development');
    await flushFrame();
    document.querySelector<HTMLButtonElement>('.tritonlens-rating-badge')!.click();
    const link = document.querySelector('a')!;
    link.textContent = 'Unknown Instructor';
    await Promise.resolve();
    vi.spyOn(document, 'querySelectorAll').mockImplementationOnce(() => {
      throw new Error('Injected scan failure');
    });
    expect(() => frames.shift()!(0)).not.toThrow();
    await Promise.resolve();
    expect(document.querySelector('.tritonlens-detail-card')).toBeNull();
    expect(document.querySelector('.tritonlens-rating-badge')).toBeNull();
    expect(link.textContent).toBe('Unknown Instructor');
    expect(document.querySelector('#tss-action')).not.toBeNull();
    expect(frames).toHaveLength(0);
    link.textContent = 'Libby Butler';
    await Promise.resolve();
    await flushFrame();
    expect(document.querySelector('.tritonlens-rating-badge')?.textContent).toBe('★ 2.7 dev');
  });
});
