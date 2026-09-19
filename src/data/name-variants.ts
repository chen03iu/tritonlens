export type NameRelationshipKind =
  | 'exact-reordered'
  | 'middle-omitted'
  | 'middle-initial'
  | 'orthographic-variant'
  | 'fuzzy-only'
  | 'incompatible';

export interface NameRelationship {
  readonly kind: NameRelationshipKind;
  readonly currentName: string;
  readonly candidateName: string;
  readonly compatible: boolean;
}

interface ParsedName {
  readonly given: readonly string[];
  readonly surname: readonly string[];
}

function strictNaturalForm(name: string): string {
  const parts = name.split(',').map(part => part.normalize('NFKC').trim().replace(/\s+/g, ' '));
  const natural = parts.length === 2 && parts.every(Boolean)
    ? `${parts[1]} ${parts[0]}`
    : name.normalize('NFKC').trim().replace(/\s+/g, ' ');
  return natural.toLocaleLowerCase('en-US');
}

function relaxedTokens(name: string): string[] {
  return name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[‐‑‒–—―-]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .toLocaleLowerCase('en-US')
    .split(/\s+/)
    .filter(Boolean);
}

function parseCandidate(name: string): ParsedName | null {
  const commaParts = name.split(',').map(part => part.trim());
  if (commaParts.length === 2 && commaParts.every(Boolean)) {
    const surname = relaxedTokens(commaParts[0]);
    const given = relaxedTokens(commaParts[1]);
    return surname.length && given.length ? { given, surname } : null;
  }

  const tokens = relaxedTokens(name);
  if (tokens.length < 2) return null;
  return { given: tokens.slice(0, -1), surname: tokens.slice(-1) };
}

function parseCurrent(name: string, candidate: ParsedName): ParsedName | null {
  const commaParsed = parseCandidate(name);
  if (name.includes(',')) return commaParsed;

  const tokens = relaxedTokens(name);
  if (tokens.length < 2 || candidate.surname.length >= tokens.length) return null;
  const surnameStart = tokens.length - candidate.surname.length;
  const surname = tokens.slice(surnameStart);
  if (!surname.every((token, index) => token === candidate.surname[index])) return null;
  return { given: tokens.slice(0, surnameStart), surname };
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function isMiddleInitialForm(current: readonly string[], candidate: readonly string[]): boolean {
  if (current.length !== candidate.length || current.length < 2) return false;
  if (current[0] !== candidate[0]) return false;
  let usedInitial = false;
  for (let index = 1; index < current.length; index += 1) {
    if (current[index] === candidate[index]) continue;
    if (current[index].length === 1 && candidate[index].startsWith(current[index])) {
      usedInitial = true;
      continue;
    }
    return false;
  }
  return usedInitial;
}

export function analyzeNameRelationship(
  currentName: string,
  candidateName: string,
): NameRelationship {
  const result = (kind: NameRelationshipKind): NameRelationship => ({
    kind,
    currentName,
    candidateName,
    compatible: kind !== 'incompatible',
  });

  const candidate = parseCandidate(candidateName);
  if (!candidate) return result('incompatible');
  const current = parseCurrent(currentName, candidate);
  if (!current || current.given[0]?.length === 1) {
    return result('incompatible');
  }
  if (!arraysEqual(current.surname, candidate.surname) || current.given[0] !== candidate.given[0]) {
    return result('incompatible');
  }

  if (strictNaturalForm(currentName) === strictNaturalForm(candidateName)) {
    return result('exact-reordered');
  }
  if (arraysEqual(current.given, candidate.given)) {
    return result('orthographic-variant');
  }
  if (current.given.length === 1 && candidate.given.length > 1) {
    return result('middle-omitted');
  }
  if (isMiddleInitialForm(current.given, candidate.given)) {
    return result('middle-initial');
  }
  return result('fuzzy-only');
}
