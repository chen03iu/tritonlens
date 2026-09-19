import { describe, expect, it } from 'vitest';
import { analyzeNameRelationship } from '../src/data/name-variants';

describe('deterministic instructor name relationships', () => {
  it.each([
    ['Justin Paul Opatkiewicz', 'Opatkiewicz, Justin Paul', 'exact-reordered'],
    ['Justin Opatkiewicz', 'Opatkiewicz, Justin Paul', 'middle-omitted'],
    ['Justin P. Opatkiewicz', 'Opatkiewicz, Justin Paul', 'middle-initial'],
    ['Daphne Taylor Garcia', 'Taylor-Garcia, Daphne', 'orthographic-variant'],
    ['Daphne Taylor García', 'Taylor-Garcia, Daphne', 'orthographic-variant'],
    ['Keiko Nomura', 'Nomura, Keiko K.', 'middle-omitted'],
    ['Nuria Gonzalez Prelcic', 'Gonzalez-Prelcic, Nuria', 'orthographic-variant'],
    ["Shaun O Connor", "O'Connor, Shaun", 'orthographic-variant'],
    ['Kenji Nomura', 'Nomura, Keiko K.', 'incompatible'],
    ['Bob Example', 'Example, Robert', 'incompatible'],
    ['Justin Xavier Opatkiewicz', 'Opatkiewicz, Justin Paul', 'fuzzy-only'],
  ] as const)('%s versus %s is %s', (currentName, candidateName, kind) => {
    expect(analyzeNameRelationship(currentName, candidateName)).toEqual({
      kind,
      currentName,
      candidateName,
      compatible: kind !== 'incompatible',
    });
  });

  it.each([
    ['', 'Person, Example'],
    ['J Opatkiewicz', 'Opatkiewicz, Justin Paul'],
    ['Justin O', 'Opatkiewicz, Justin Paul'],
    ['Single', 'Person, Example'],
  ])('rejects incomplete form %j versus %j', (currentName, candidateName) => {
    expect(analyzeNameRelationship(currentName, candidateName).kind).toBe('incompatible');
  });
});
