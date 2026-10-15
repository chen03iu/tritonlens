import { existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'node:path';

function canonicalizeProspectivePath(value) {
  let existingAncestor = resolve(value);
  const missingSegments = [];

  while (!existsSync(existingAncestor)) {
    const parent = dirname(existingAncestor);
    if (parent === existingAncestor) {
      break;
    }
    missingSegments.unshift(basename(existingAncestor));
    existingAncestor = parent;
  }

  const canonicalAncestor = existsSync(existingAncestor)
    ? realpathSync.native(existingAncestor)
    : existingAncestor;
  return resolve(canonicalAncestor, ...missingSegments);
}

function isSameOrDescendant(parent, candidate) {
  const childPath = relative(parent, candidate);
  return (
    childPath === '' ||
    (!isAbsolute(childPath) &&
      childPath !== '..' &&
      !childPath.startsWith(`..${sep}`))
  );
}

export function assertSafeBuildOutdir(
  projectRoot,
  requestedOutdir,
  systemTempRoot = tmpdir(),
) {
  const outdir = canonicalizeProspectivePath(requestedOutdir);
  const ownedDist = resolve(projectRoot, 'dist');
  const tempRoot = canonicalizeProspectivePath(systemTempRoot);
  const isOwnedDist = isSameOrDescendant(ownedDist, outdir);
  const isIsolatedTemp =
    outdir !== tempRoot && isSameOrDescendant(tempRoot, outdir);

  if (!isOwnedDist && !isIsolatedTemp) {
    throw new Error(
      `Refusing unsafe build output directory: ${outdir}`,
    );
  }

  return outdir;
}
