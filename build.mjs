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

const buildOptions = {
  entryPoints: [
    resolve(root, 'src/content.ts'),
    resolve(root, 'src/content.css'),
  ],
  bundle: true,
  outdir: dist,
  target: 'chrome120',
  sourcemap: true,
  logLevel: 'info',
};

if (watch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log('Watching TritonLens source files...');
} else {
  await esbuild.build(buildOptions);
}
