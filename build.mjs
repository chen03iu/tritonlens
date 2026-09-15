import * as esbuild from 'esbuild';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

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
    resolve(root, 'src/content.ts'),
    resolve(root, 'src/content.css'),
  ],
  bundle: true,
  outdir: dist,
  target: 'chrome120',
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
