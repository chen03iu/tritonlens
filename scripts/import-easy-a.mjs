import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { transformEasyARadar } from './easy-a-transform.mjs';

const inputPath = process.argv[2];
const outputPath = resolve(
  process.argv[3] ?? 'src/data/easy-a-dataset.generated.json',
);

if (!inputPath) {
  throw new Error(
    'Usage: npm run import:easy-a -- <data.json> [output.json]',
  );
}

const snapshot = JSON.parse(
  await readFile(resolve(inputPath), 'utf8'),
);
const dataset = transformEasyARadar(snapshot);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(dataset), 'utf8');

console.log(
  `Imported ${dataset.professors.length} professors and ` +
    `${dataset.historicalCourseGrades.length} historical grade records.`,
);
