import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, expect, test } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'tritonlens-build-mode-'));

afterAll(() => {
  rmSync(temporaryRoot, { recursive: true, force: true });
});

function build(name, ...flags) {
  const outdir = join(temporaryRoot, name);
  execFileSync(
    process.execPath,
    ['build.mjs', ...flags, `--outdir=${outdir}`],
    { cwd: root },
  );
  return {
    content: readFileSync(join(outdir, 'content.js'), 'utf8'),
    size: statSync(join(outdir, 'content.js')).size,
  };
}

test('default metrics and explicit link-only builds use isolated data graphs', () => {
  const release = build('release');
  expect(release.content).toContain(
    'Data snapshot — source permissions pending',
  );
  expect(release.content).toContain('easy-a-radar-rmp');
  expect(release.content).toContain('Libby Butler');

  const linkOnly = build('link-only', '--link-only');
  expect(linkOnly.content).toContain(
    'Ratings and historical grades are not included in this build.',
  );
  expect(linkOnly.content).not.toContain(
    'Data snapshot — source permissions pending',
  );
  expect(linkOnly.content).not.toContain('easy-a-radar-rmp');
  expect(linkOnly.content).not.toContain('Libby Butler');
  expect(release.size).toBeGreaterThan(linkOnly.size * 2);

  const releaseAgain = build('release-again');
  expect(releaseAgain.content).toContain('easy-a-radar-rmp');
  expect(releaseAgain.content).toBe(release.content);
});
