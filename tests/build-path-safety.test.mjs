import { tmpdir } from 'node:os';
import { dirname, parse, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { assertSafeBuildOutdir } from '../scripts/build-paths.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

describe('build output safety', () => {
  it.each([
    ['project root', root],
    ['project parent', dirname(root)],
    ['drive root', parse(root).root],
    ['source directory', resolve(root, 'src')],
    ['Git metadata', resolve(root, '.git')],
    ['dependencies', resolve(root, 'node_modules')],
    ['system temp root', resolve(tmpdir())],
    ['unrelated user directory', dirname(tmpdir())],
    [
      'another drive root',
      parse(root).root.toUpperCase().startsWith('C:') ? 'D:\\' : 'C:\\',
    ],
  ])('rejects the %s as a recursive-clean target', (_label, target) => {
    expect(() => assertSafeBuildOutdir(root, target)).toThrow(
      /refusing unsafe build output directory/i,
    );
  });

  it('accepts the normal dist directory and an isolated temp directory', () => {
    expect(assertSafeBuildOutdir(root, resolve(root, 'dist'))).toBe(
      resolve(root, 'dist'),
    );
    expect(assertSafeBuildOutdir(root, resolve(tmpdir(), 'tritonlens-safe')))
      .toBe(resolve(tmpdir(), 'tritonlens-safe'));
  });
});
