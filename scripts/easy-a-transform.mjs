import { createHash } from 'node:crypto';

const REQUIRED_COLUMNS = [
  's',
  'c',
  'i',
  'g',
  'gA',
  'gB',
  'gC',
  'gD',
  'gF',
  'gW',
  'gP',
  'gNP',
  'n',
  'rq',
  'rd',
  'rw',
  'rn',
  'rid',
  'src',
];

function stableProfessorId(identityKey, displayName) {
  const slug = displayName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  const hash = createHash('sha256')
    .update(identityKey)
    .digest('hex')
    .slice(0, 10);

  return `easy-a-${slug || 'professor'}-${hash}`;
}

function reorderedName(name) {
  const commaIndex = name.indexOf(',');
  if (commaIndex < 0) {
    return null;
  }

  const familyName = name.slice(0, commaIndex).trim();
  const givenNames = name.slice(commaIndex + 1).trim();
  return givenNames && familyName
    ? `${givenNames} ${familyName}`
    : null;
}

function numberOrNull(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : null;
}

function percentageOrNull(value) {
  const number = numberOrNull(value);
  return number !== null && number >= 0 && number <= 100
    ? number
    : null;
}

function createSources(retrievedAt) {
  return [
    {
      id: 'easy-a-radar-rmp',
      label: 'Easy-A Radar RMP snapshot',
      category: 'professor-ratings',
      homepageUrl:
        'https://github.com/Edwardwang66/ucsd-easy-a-radar',
      termsUrl: 'https://www.ratemyprofessors.com/terms-of-use',
      retrievedAt,
      permissionStatus: 'pending',
      attribution:
        'Easy-A Radar by Edward Wang; source fields derived from RateMyProfessors.',
    },
    {
      id: 'easy-a-radar-grades',
      label: 'Easy-A Radar UCSD grade snapshot',
      category: 'historical-grades',
      homepageUrl:
        'https://github.com/Edwardwang66/ucsd-easy-a-radar',
      termsUrl: 'https://www.ucsd.edu/about/terms-of-use.html',
      retrievedAt,
      permissionStatus: 'pending',
      attribution:
        'Easy-A Radar by Edward Wang; source fields derived from aggregate UCSD grade distributions.',
    },
  ];
}

function requireSnapshotShape(snapshot) {
  if (
    !snapshot ||
    !Array.isArray(snapshot.cols) ||
    !Array.isArray(snapshot.recs)
  ) {
    throw new Error('Expected an Easy-A snapshot with cols and recs arrays.');
  }

  for (const column of REQUIRED_COLUMNS) {
    if (!snapshot.cols.includes(column)) {
      throw new Error(
        `Easy-A snapshot is missing required column "${column}".`,
      );
    }
  }

  if (
    !snapshot.meta ||
    typeof snapshot.meta.generated !== 'string'
  ) {
    throw new Error(
      'Easy-A snapshot is missing meta.generated.',
    );
  }
}

export function transformEasyARadar(snapshot) {
  requireSnapshotShape(snapshot);

  const columns = Object.fromEntries(
    snapshot.cols.map((column, index) => [column, index]),
  );
  const retrievedAt = snapshot.meta.generated;
  const sourceProfessorIdsByName = new Map();

  for (const row of snapshot.recs) {
    const displayName =
      typeof row[columns.i] === 'string'
        ? row[columns.i].trim()
        : '';
    const sourceProfessorId = row[columns.rid];

    if (!displayName || sourceProfessorId === null) {
      continue;
    }

    let sourceProfessorIds = sourceProfessorIdsByName.get(displayName);
    if (!sourceProfessorIds) {
      sourceProfessorIds = new Set();
      sourceProfessorIdsByName.set(displayName, sourceProfessorIds);
    }
    sourceProfessorIds.add(String(sourceProfessorId));
  }

  const groups = new Map();

  for (const row of snapshot.recs) {
    const displayName =
      typeof row[columns.i] === 'string'
        ? row[columns.i].trim()
        : '';

    if (!displayName) {
      continue;
    }

    const sourceProfessorId = row[columns.rid];
    const sourceProfessorIds =
      sourceProfessorIdsByName.get(displayName) ?? new Set();
    const hasMultipleSourceIdentities = sourceProfessorIds.size > 1;

    if (hasMultipleSourceIdentities && sourceProfessorId === null) {
      continue;
    }

    const identityKey = hasMultipleSourceIdentities
      ? `${displayName}\u0000${String(sourceProfessorId)}`
      : displayName;

    let group = groups.get(identityKey);
    if (!group) {
      group = {
        id: stableProfessorId(identityKey, displayName),
        displayName,
        aliases: new Set(),
        ratings: new Map(),
      };
      groups.set(identityKey, group);

      const reordered = reorderedName(displayName);
      if (reordered && reordered !== displayName) {
        group.aliases.add(reordered);
      }

      const reviewedAliases = snapshot.aka?.[displayName];
      if (Array.isArray(reviewedAliases)) {
        reviewedAliases.forEach((alias) => {
          if (typeof alias === 'string' && alias.trim()) {
            group.aliases.add(alias.trim());
          }
        });
      }
    }

    const overallRating = numberOrNull(row[columns.rq]);
    const ratingCount = numberOrNull(row[columns.rn]);

    if (
      sourceProfessorId !== null &&
      overallRating !== null &&
      ratingCount !== null &&
      ratingCount > 0
    ) {
      const rating = {
        overallRating,
        difficulty: numberOrNull(row[columns.rd]),
        ratingCount,
        wouldTakeAgainPercent: percentageOrNull(row[columns.rw]),
        sourceId: 'easy-a-radar-rmp',
        updatedAt: retrievedAt,
        sourceProfessorId: String(sourceProfessorId),
      };
      group.ratings.set(JSON.stringify(rating), rating);

      const rmpAlias = snapshot.rmpAka?.[sourceProfessorId];
      if (typeof rmpAlias === 'string' && rmpAlias.trim()) {
        group.aliases.add(rmpAlias.trim());
      }
    }
  }

  const professors = [...groups.values()]
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((group) => ({
      id: group.id,
      displayName: group.displayName,
      aliases: [...group.aliases]
        .filter((alias) => alias !== group.displayName)
        .sort((a, b) => a.localeCompare(b)),
      rating:
        group.ratings.size === 1
          ? [...group.ratings.values()][0]
          : null,
    }));

  const professorIds = new Map(
    [...groups.entries()].map(([identityKey, group]) => [
      identityKey,
      group.id,
    ]),
  );
  const historicalCourseGrades = [];

  for (const row of snapshot.recs) {
    if (row[columns.src] !== 0) {
      continue;
    }

    const displayName =
      typeof row[columns.i] === 'string'
        ? row[columns.i].trim()
        : '';
    const sourceProfessorId = row[columns.rid];
    const sourceProfessorIds =
      sourceProfessorIdsByName.get(displayName) ?? new Set();
    const hasMultipleSourceIdentities = sourceProfessorIds.size > 1;

    if (hasMultipleSourceIdentities && sourceProfessorId === null) {
      continue;
    }

    const identityKey = hasMultipleSourceIdentities
      ? `${displayName}\u0000${String(sourceProfessorId)}`
      : displayName;
    const professorId = professorIds.get(identityKey);
    const averageGpa = numberOrNull(row[columns.g]);
    const offeringCount = numberOrNull(row[columns.n]);
    const subjectCode =
      typeof row[columns.s] === 'string'
        ? row[columns.s].trim().toUpperCase()
        : '';
    const catalogNumber =
      typeof row[columns.c] === 'string'
        ? row[columns.c].trim().toUpperCase()
        : String(row[columns.c] ?? '').trim().toUpperCase();

    if (
      !professorId ||
      averageGpa === null ||
      !Number.isInteger(offeringCount) ||
      offeringCount <= 0 ||
      !subjectCode ||
      !catalogNumber
    ) {
      continue;
    }

    historicalCourseGrades.push({
      professorId,
      subjectCode,
      catalogNumber,
      averageGpa,
      sampleSize: null,
      offeringCount,
      gradeDistribution: {
        aPercent: numberOrNull(row[columns.gA]),
        bPercent: numberOrNull(row[columns.gB]),
        cPercent: numberOrNull(row[columns.gC]),
        dPercent: numberOrNull(row[columns.gD]),
        fPercent: numberOrNull(row[columns.gF]),
        wPercent: numberOrNull(row[columns.gW]),
        pPercent: numberOrNull(row[columns.gP]),
        npPercent: numberOrNull(row[columns.gNP]),
      },
      sourceId: 'easy-a-radar-grades',
      updatedAt: retrievedAt,
    });
  }

  return {
    schemaVersion: 1,
    kind: 'development',
    sources: createSources(retrievedAt),
    professors,
    historicalCourseGrades,
  };
}
