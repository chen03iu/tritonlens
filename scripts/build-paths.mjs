import { isAbsolute, relative, resolve, sep } from 'node:path';

export function assertSafeBuildOutdir(projectRoot, requestedOutdir) {
  const root = resolve(projectRoot);
  const outdir = resolve(requestedOutdir);
  const rootFromOutdir = relative(outdir, root);
  const outdirContainsProject =
    rootFromOutdir === '' ||
    (!isAbsolute(rootFromOutdir) &&
      rootFromOutdir !== '..' &&
      !rootFromOutdir.startsWith(`..${sep}`));

  if (outdirContainsProject) {
    throw new Error(
      `Refusing unsafe build output directory: ${outdir}`,
    );
  }

  return outdir;
}
