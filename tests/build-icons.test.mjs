import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

// Catches missing manifest registration, omitted build copies, and wrong sizes.
test('build packages every registered icon at its declared PNG size', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  execFileSync(process.execPath, ['build.mjs'], { cwd: root });
  const manifest = JSON.parse(readFileSync(new URL('../dist/manifest.json', import.meta.url), 'utf8'));

  expect(Object.keys(manifest.icons ?? {}).sort()).toEqual(['128', '16', '32', '48']);
  for (const size of [16, 32, 48, 128]) {
    const path = manifest.icons[String(size)];
    const packaged = readFileSync(new URL(`../dist/${path}`, import.meta.url));
    const source = readFileSync(new URL(`../${path}`, import.meta.url));
    expect(packaged).toEqual(source);
    expect(packaged.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(packaged.toString('ascii', 12, 16)).toBe('IHDR');
    expect(packaged.readUInt32BE(16)).toBe(size);
    expect(packaged.readUInt32BE(20)).toBe(size);
  }
}, 30000);
