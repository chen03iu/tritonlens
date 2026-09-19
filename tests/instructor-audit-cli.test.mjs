import { expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

it('runs the offline CLI against instructor input and writes a review report', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tritonlens-audit-test-'));
  try {
    const input = join(directory, 'input.json'); const output = join(directory, 'report.json');
    await writeFile(input, JSON.stringify({ meta: { generated: '2026-07-23' }, fa: { 'MAE 3': ['Nathan Delson'], 'TEST 1': ['Definitely Absent Instructor'] } }));
    execFileSync(process.execPath, ['scripts/audit-instructor-matches.mjs', input, output]);
    const report = JSON.parse(await readFile(output, 'utf8'));
    expect(report.counts).toEqual({ matched: 1, ambiguous: 0, 'needs-evidence': 0, 'no-candidate': 1 });
    expect(report.entries.find(entry => entry.name === 'Nathan Delson')).toMatchObject({ status: 'matched', candidates: [{ rmpUrl: 'https://www.ratemyprofessors.com/professor/258679' }] });
    expect(report.consolidatedIdentities.length).toBeGreaterThan(0);
    expect(report.consolidatedIdentities.find(entry => entry.removedId === 'easy-a-adam-feist-1909e6cec6')).toMatchObject({
      sourceProfessorId: null,
      retainedId: 'easy-a-feist-adam-michael-fb24c72dd7',
    });
  } finally { await rm(directory, { recursive: true, force: true }); }
});

it('does not write a misleading empty report when current-instructor metadata is absent', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tritonlens-audit-test-'));
  try {
    const input = join(directory, 'input.json'); const output = join(directory, 'report.json');
    await writeFile(input, '{}');
    expect(() => execFileSync(process.execPath, ['scripts/audit-instructor-matches.mjs', input, output], { stdio: 'pipe' })).toThrow();
    await expect(access(output)).rejects.toThrow();
  } finally { await rm(directory, { recursive: true, force: true }); }
});

it('refuses an output path that would overwrite the source snapshot', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tritonlens-audit-test-'));
  try {
    const input = join(directory, 'input.json');
    const original = JSON.stringify({ fa: { 'MAE 3': ['Nathan Delson'] } });
    await writeFile(input, original);
    expect(() => execFileSync(process.execPath, ['scripts/audit-instructor-matches.mjs', input, input], { stdio: 'pipe' })).toThrow();
    expect(await readFile(input, 'utf8')).toBe(original);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

it('can refresh matching results from a prior report without losing snapshot provenance', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'tritonlens-audit-test-'));
  try {
    const input = join(directory, 'prior-report.json'); const output = join(directory, 'report.json');
    await writeFile(input, JSON.stringify({
      snapshotGenerated: '2026-07-23', instructorSnapshotSha256: 'original-hash',
      entries: [
        { name: 'Nathan Delson', courses: ['MAE 3'] },
        { name: 'Definitely Absent Instructor', courses: ['TEST 1'] },
      ],
    }));
    execFileSync(process.execPath, ['scripts/audit-instructor-matches.mjs', input, output, '--from-report'], {
      maxBuffer: 16 * 1024 * 1024,
    });
    const report = JSON.parse(await readFile(output, 'utf8'));
    expect(report.counts).toEqual({ matched: 1, ambiguous: 0, 'needs-evidence': 0, 'no-candidate': 1 });
    expect(report.snapshotGenerated).toBe('2026-07-23');
    expect(report.instructorSnapshotSha256).toBe('original-hash');
  } finally { await rm(directory, { recursive: true, force: true }); }
});
