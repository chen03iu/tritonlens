import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CLI = 'scripts/recommend-name-matches.mjs';

function auditFixture() {
  return {
    schemaVersion: 1,
    instructorSnapshotSha256: 'snapshot-hash',
    entries: [
      {
        name: 'Justin Opatkiewicz', courses: ['CENG 120'], status: 'needs-evidence', reviewRequired: true,
        candidates: [{
          id: 'justin', displayName: 'Opatkiewicz, Justin Paul', aliases: [], hasRating: true,
          rmpUrl: null, historicalCourses: ['CENG 15'],
        }],
      },
      {
        name: 'Kenji Nomura', courses: ['MAE 11'], status: 'needs-evidence', reviewRequired: true,
        candidates: [{
          id: 'keiko', displayName: 'Nomura, Keiko K.', aliases: [], hasRating: true,
          rmpUrl: null, historicalCourses: ['MAE 8'],
        }],
      },
      {
        name: 'Already Matched', courses: ['TEST 1'], status: 'matched', reviewRequired: false,
        candidates: [],
      },
    ],
  };
}

async function absent(path) {
  await expect(access(path)).rejects.toThrow();
}

describe('offline name-match recommendation CLI', () => {
  it('writes deterministic JSON and Markdown reports with provenance', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'tritonlens-recommend-test-'));
    try {
      const input = join(directory, 'audit.json');
      const outputJson = join(directory, 'recommendations.json');
      const outputMarkdown = join(directory, 'recommendations.md');
      const inputText = JSON.stringify(auditFixture());
      await writeFile(input, inputText);

      execFileSync(process.execPath, [CLI, input, outputJson, outputMarkdown]);
      const firstJson = await readFile(outputJson, 'utf8');
      const firstMarkdown = await readFile(outputMarkdown, 'utf8');
      const report = JSON.parse(firstJson);

      expect(report).toMatchObject({
        schemaVersion: 1,
        sourceAuditSha256: createHash('sha256').update(inputText).digest('hex'),
        sourceSnapshotSha256: 'snapshot-hash',
        counts: { recommended: 1, review: 0, rejected: 1, total: 2 },
      });
      expect(report.entries.map(entry => entry.currentName)).toEqual(['Justin Opatkiewicz', 'Kenji Nomura']);
      expect(firstMarkdown).toContain('# Instructor Name-Match Recommendations');
      expect(firstMarkdown).toContain('## Recommended');
      expect(firstMarkdown).toContain('Justin Opatkiewicz');
      expect(firstMarkdown).toContain('## Rejected');
      expect(firstMarkdown).toContain('Kenji Nomura');

      execFileSync(process.execPath, [CLI, input, outputJson, outputMarkdown]);
      expect(await readFile(outputJson, 'utf8')).toBe(firstJson);
      expect(await readFile(outputMarkdown, 'utf8')).toBe(firstMarkdown);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('creates neither output when the audit input is malformed', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'tritonlens-recommend-test-'));
    try {
      const input = join(directory, 'audit.json');
      const outputJson = join(directory, 'out', 'recommendations.json');
      const outputMarkdown = join(directory, 'out', 'recommendations.md');
      await writeFile(input, JSON.stringify({ schemaVersion: 1, entries: 'invalid' }));
      expect(() => execFileSync(process.execPath, [CLI, input, outputJson, outputMarkdown], { stdio: 'pipe' })).toThrow();
      await absent(outputJson);
      await absent(outputMarkdown);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it('refuses outputs that alias the input or each other', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'tritonlens-recommend-test-'));
    try {
      const input = join(directory, 'audit.json');
      const other = join(directory, 'other.md');
      const original = JSON.stringify(auditFixture());
      await writeFile(input, original);
      expect(() => execFileSync(process.execPath, [CLI, input, input, other], { stdio: 'pipe' })).toThrow();
      expect(() => execFileSync(process.execPath, [CLI, input, other, other], { stdio: 'pipe' })).toThrow();
      expect(await readFile(input, 'utf8')).toBe(original);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  it.each([
    'src/data/easy-a-dataset.generated.json',
    'src/data/reviewed-corrections.ts',
  ])('protects %s from report output', async protectedPath => {
    const directory = await mkdtemp(join(tmpdir(), 'tritonlens-recommend-test-'));
    try {
      const input = join(directory, 'audit.json');
      const other = join(directory, 'other.md');
      await writeFile(input, JSON.stringify(auditFixture()));
      expect(() => execFileSync(process.execPath, [CLI, input, resolve(protectedPath), other], { stdio: 'pipe' })).toThrow();
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
