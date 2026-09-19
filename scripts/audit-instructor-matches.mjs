import { readFile, mkdir, writeFile, realpath } from 'node:fs/promises';
import { dirname, resolve, basename, join } from 'node:path';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';

// Offline developer tool: no scraping, no runtime requests, no dataset writes.
const inputPath = process.argv[2];
if (!inputPath) throw new Error('Usage: npm.cmd run audit:instructors -- <Easy-A data.json> [report.json]');
const outputPath = resolve(process.argv[3] ?? 'reports/instructor-audit.json');
const fromReport = process.argv[4] === '--from-report';
const pathKey = path => process.platform === 'win32' ? path.toLowerCase() : path;
const protectedPaths = [resolve(inputPath), resolve('src/data/easy-a-dataset.generated.json')];
if (protectedPaths.some(path => pathKey(path) === pathKey(outputPath))) throw new Error('Report output must not overwrite an input or generated dataset.');
const snapshotText = await readFile(resolve(inputPath), 'utf8');
const snapshot = JSON.parse(snapshotText);
const instructorMap = fromReport ? (() => {
  if (!Array.isArray(snapshot.entries) || snapshot.entries.some(entry =>
    typeof entry?.name !== 'string' || !Array.isArray(entry.courses) ||
    entry.courses.some(course => typeof course !== 'string'))) {
    throw new Error('Expected a prior instructor audit report with name and courses entries.');
  }
  const reconstructed = {};
  for (const entry of snapshot.entries) for (const course of entry.courses) {
    (reconstructed[course] ??= []).push(entry.name);
  }
  return reconstructed;
})() : snapshot.fa;
const bundle = await build({
  stdin: {
    contents: "export { auditInstructors } from './src/data/instructor-audit.ts'; export { EASY_A_DATASET } from './src/data/easy-a-dataset.ts'; export { applyReviewedCorrections } from './src/data/reviewed-corrections.ts'; export { default as RAW_DATASET } from './src/data/easy-a-dataset.generated.json';",
    resolveDir: resolve('.'), loader: 'ts',
  },
  bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
});
let auditModule;
try {
  auditModule = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
} catch (error) {
  throw new Error(`Unable to load the audited dataset: ${error instanceof Error ? error.message : String(error)}`);
}
const { auditInstructors, EASY_A_DATASET, RAW_DATASET, applyReviewedCorrections } = auditModule;
const before = applyReviewedCorrections(RAW_DATASET);
const entries = auditInstructors(EASY_A_DATASET, instructorMap);
const countStatuses = items => Object.fromEntries(['matched', 'ambiguous', 'needs-evidence', 'no-candidate'].map(status => [status, items.filter(entry => entry.status === status).length]));
const counts = countStatuses(entries);
const consolidatedIdentities = before.professors.filter(record => !EASY_A_DATASET.professors.some(current => current.id === record.id))
  .map(record => {
    const sourceProfessorId = record.rating?.sourceProfessorId ?? null;
    const retained = sourceProfessorId
      ? EASY_A_DATASET.professors.find(current => current.rating?.sourceProfessorId === sourceProfessorId)
      : EASY_A_DATASET.professors.find(current => current.aliases.includes(record.displayName));
    return { removedId: record.id, removedName: record.displayName, sourceProfessorId, retainedId: retained?.id };
  });
const report = {
  schemaVersion: 1, instructorSource: 'Easy-A Radar fa current-instructor snapshot',
  snapshotGenerated: fromReport ? snapshot.snapshotGenerated ?? null : snapshot.meta?.generated ?? null,
  instructorSnapshotSha256: fromReport
    ? snapshot.instructorSnapshotSha256 ?? null
    : createHash('sha256').update(snapshotText).digest('hex'),
  note: 'Snapshot names, not observed live TSS failures. Candidates are not verified identities. Matched does not imply ratings or course-specific history exist.',
  datasetSourceDate: RAW_DATASET.sources[0]?.retrievedAt ?? null,
  countsBeforeConsolidation: countStatuses(auditInstructors(before, instructorMap)),
  additionalCandidateReviews: entries.filter(entry => entry.status === 'matched' && entry.reviewRequired).length,
  counts, consolidatedIdentities, entries,
};
await mkdir(dirname(outputPath), { recursive: true });
// Resolve existing symlinks/junctions as well as lexical path aliases before writing.
const realOutput = await realpath(outputPath).catch(async error => {
  if (error.code !== 'ENOENT') throw error;
  return join(await realpath(dirname(outputPath)), basename(outputPath));
});
const realProtected = await Promise.all(protectedPaths.map(path => realpath(path)));
if (realProtected.some(path => pathKey(path) === pathKey(realOutput))) throw new Error('Report output resolves to a protected dataset.');
await writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(counts));
console.log(`Wrote ${entries.length} instructor entries to ${outputPath}. No aliases or records were changed.`);
