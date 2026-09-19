import { createHash } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { build } from 'esbuild';

// Offline developer tool: no scraping, network requests, or dataset writes.
const inputArgument = process.argv[2];
if (!inputArgument) {
  throw new Error('Usage: npm.cmd run recommend:names -- <audit.json> [output.json] [output.md]');
}

const inputPath = resolve(inputArgument);
const outputJsonPath = resolve(process.argv[3] ?? 'reports/name-match-recommendations.json');
const outputMarkdownPath = resolve(process.argv[4] ?? 'reports/name-match-recommendations.md');
const pathKey = path => process.platform === 'win32' ? path.toLocaleLowerCase('en-US') : path;
const protectedPaths = [
  inputPath,
  resolve('src/data/easy-a-dataset.generated.json'),
  resolve('src/data/reviewed-corrections.ts'),
];

const lexicalTargets = [outputJsonPath, outputMarkdownPath].map(pathKey);
if (new Set(lexicalTargets).size !== lexicalTargets.length ||
    protectedPaths.some(path => lexicalTargets.includes(pathKey(path)))) {
  throw new Error('Report outputs must be distinct and must not overwrite inputs or protected datasets.');
}

const inputText = await readFile(inputPath, 'utf8');
const audit = JSON.parse(inputText);
validateAudit(audit);

const bundle = await build({
  stdin: {
    contents: "export { recommendShortNameMatches, summarizeRecommendations } from './src/data/short-name-recommendations.ts';",
    resolveDir: resolve('.'),
    loader: 'ts',
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  logLevel: 'silent',
});
const evaluator = await import(
  'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64')
);
const entries = evaluator.recommendShortNameMatches(audit.entries);
const counts = evaluator.summarizeRecommendations(entries);
const report = {
  schemaVersion: 1,
  sourceAuditSha256: createHash('sha256').update(inputText).digest('hex'),
  sourceSnapshotSha256: audit.instructorSnapshotSha256,
  counts,
  entries,
};
const jsonText = JSON.stringify(report, null, 2) + '\n';
const markdownText = renderMarkdown(report);

await Promise.all([
  mkdir(dirname(outputJsonPath), { recursive: true }),
  mkdir(dirname(outputMarkdownPath), { recursive: true }),
]);
const realTargets = await Promise.all([
  canonicalTarget(outputJsonPath),
  canonicalTarget(outputMarkdownPath),
]);
const realProtected = await Promise.all(protectedPaths.map(path => realpath(path)));
const realTargetKeys = realTargets.map(pathKey);
if (new Set(realTargetKeys).size !== realTargetKeys.length ||
    realProtected.some(path => realTargetKeys.includes(pathKey(path)))) {
  throw new Error('Report output resolves to an input or protected dataset.');
}

await Promise.all([
  writeFile(outputJsonPath, jsonText),
  writeFile(outputMarkdownPath, markdownText),
]);
console.log(JSON.stringify(counts));
console.log(`Wrote ${entries.length} review entries. No aliases, corrections, or datasets were changed.`);

function validateAudit(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.schemaVersion !== 1 ||
      typeof value.instructorSnapshotSha256 !== 'string' || !value.instructorSnapshotSha256 ||
      !Array.isArray(value.entries)) {
    throw new Error('Expected a schema-version 1 instructor audit report with snapshot provenance and entries.');
  }
  const statuses = new Set(['matched', 'ambiguous', 'needs-evidence', 'no-candidate']);
  for (const entry of value.entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) ||
        typeof entry.name !== 'string' || !entry.name.trim() ||
        !Array.isArray(entry.courses) || entry.courses.some(item => typeof item !== 'string' || !item.trim()) ||
        !statuses.has(entry.status) || typeof entry.reviewRequired !== 'boolean' ||
        !Array.isArray(entry.candidates)) {
      throw new Error('Audit entries must contain valid names, courses, statuses, review flags, and candidates.');
    }
    for (const candidate of entry.candidates) {
      if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate) ||
          typeof candidate.id !== 'string' || !candidate.id ||
          typeof candidate.displayName !== 'string' || !candidate.displayName.trim() ||
          !Array.isArray(candidate.aliases) || candidate.aliases.some(item => typeof item !== 'string') ||
          typeof candidate.hasRating !== 'boolean' ||
          !(candidate.rmpUrl === null || typeof candidate.rmpUrl === 'string') ||
          !Array.isArray(candidate.historicalCourses) ||
          candidate.historicalCourses.some(item => typeof item !== 'string' || !item.trim())) {
        throw new Error('Audit candidates must contain valid identity, rating, and historical-course fields.');
      }
    }
  }
}

async function canonicalTarget(path) {
  return realpath(path).catch(async error => {
    if (error.code !== 'ENOENT') throw error;
    return join(await realpath(dirname(path)), basename(path));
  });
}

function markdown(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function renderMarkdown(value) {
  const lines = [
    '# Instructor Name-Match Recommendations',
    '',
    '> Offline deterministic recommendations only. These entries are not verified aliases and no source data was changed.',
    '',
    `- Source audit SHA-256: \`${value.sourceAuditSha256}\``,
    `- Source instructor snapshot SHA-256: \`${value.sourceSnapshotSha256}\``,
    '',
    '| Result | Count |',
    '| --- | ---: |',
    `| Recommended | ${value.counts.recommended} |`,
    `| Review | ${value.counts.review} |`,
    `| Rejected | ${value.counts.rejected} |`,
    `| Total | ${value.counts.total} |`,
    '',
  ];

  for (const [recommendation, heading] of [
    ['recommended', 'Recommended'],
    ['review', 'Review'],
    ['rejected', 'Rejected'],
  ]) {
    lines.push(`## ${heading}`, '');
    const items = value.entries.filter(entry => entry.recommendation === recommendation);
    if (items.length === 0) {
      lines.push('_None._', '');
      continue;
    }
    lines.push('| Current instructor | Candidate | Relationship | Shared subjects | Reason |',
      '| --- | --- | --- | --- | --- |');
    for (const entry of items) {
      lines.push(`| ${markdown(entry.currentName)} | ${markdown(entry.candidateName ?? '—')} | ${markdown(entry.relationship ?? '—')} | ${markdown(entry.sharedSubjects.join(', ') || '—')} | ${markdown(entry.reason)} |`);
    }
    lines.push('');
  }
  return lines.join('\n') + '\n';
}
