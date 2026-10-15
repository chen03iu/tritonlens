import * as esbuild from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSafeBuildOutdir } from './scripts/build-paths.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const watch = process.argv.includes('--watch');
const useDevelopmentData = process.argv.includes('--development-data');
const outdirArgument = process.argv.find((argument) =>
  argument.startsWith('--outdir='),
);
const dist = assertSafeBuildOutdir(
  root,
  resolve(root, outdirArgument?.slice('--outdir='.length) || 'dist'),
);
const contentEntry = useDevelopmentData
  ? 'src/content-development.ts'
  : 'src/content.ts';

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await copyFile(resolve(root, 'manifest.json'), resolve(dist, 'manifest.json'));
await mkdir(resolve(dist, 'icons'), { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await copyFile(
    resolve(root, `icons/icon-${size}.png`),
    resolve(dist, `icons/icon-${size}.png`),
  );
}

const buildOptions = {
  entryPoints: [
    { in: resolve(root, contentEntry), out: 'content' },
    { in: resolve(root, 'src/content.css'), out: 'content' },
  ],
  bundle: true,
  outdir: dist,
  target: 'chrome120',
  charset: 'utf8',
  minify: !watch,
  sourcemap: watch,
  logLevel: 'info',
};

if (watch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching TritonLens source files...');
} else {
  await esbuild.build(buildOptions);
}
