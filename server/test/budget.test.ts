import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { computeEstimate, estimateSchema, formatFcfa } from '../src/modules/budget/tariffs.ts';

describe('formatFcfa', () => {
  test('sépare les milliers par une espace simple', () => {
    // `fr-FR` produit une espace fine insécable (U+202F) qu'il faut normaliser.
    assert.equal(formatFcfa(560_000), '560 000 FCFA');
    assert.equal(formatFcfa(1_234_567), '1 234 567 FCFA');
    assert.equal(formatFcfa(0), '0 FCFA');
  });

  test('n’expose aucun caractère insécable résiduel', () => {
    assert.ok(!/[\u202F\u00A0]/.test(formatFcfa(987_654)));
  });

  test('arrondit les décimales', () => {
    assert.equal(formatFcfa(1000.6), '1 001 FCFA');
  });
});

describe('estimateSchema', () => {
  test('applique les valeurs par défaut', () => {
    const parsed = estimateSchema.parse({ projectType: 'RESIDENTIAL', area: 150 });
    assert.equal(parsed.finish, 'STANDARD');
    assert.deepEqual(parsed.options, []);
    assert.equal(parsed.includeFees, true);
  });

  test('interprète includeFees="false" comme faux', () => {
    // `z.coerce.boolean()` transformait toute chaîne non vide en `true`.
    const parsed = estimateSchema.parse({
      projectType: 'RESIDENTIAL',
      area: 150,
      includeFees: 'false',
    });
    assert.equal(parsed.includeFees, false);
  });

  test('interprète includeFees="true" comme vrai', () => {
    const parsed = estimateSchema.parse({
      projectType: 'RESIDENTIAL',
      area: 150,
      includeFees: 'true',
    });
    assert.equal(parsed.includeFees, true);
  });

  test('refuse une surface hors bornes', () => {
    assert.equal(estimateSchema.safeParse({ projectType: 'RESIDENTIAL', area: 5 }).success, false);
    assert.equal(estimateSchema.safeParse({ projectType: 'RESIDENTIAL', area: 50_000 }).success, false);
  });

  test('refuse un type de projet inconnu', () => {
    assert.equal(estimateSchema.safeParse({ projectType: 'CHATEAU', area: 150 }).success, false);
  });
});

describe('computeEstimate', () => {
  const base = { projectType: 'RESIDENTIAL' as const, area: 200, finish: 'STANDARD' as const, options: [], includeFees: true };

  test('produit une fourchette cohérente et croissante', () => {
    const result = computeEstimate(base);
    assert.ok(result.estimate.min > 0);
    assert.ok(result.estimate.max > result.estimate.min);
    assert.equal(result.area, 200);
    assert.equal(result.projectTypeLabel, 'Construction résidentielle');
  });

  test('une finition supérieure coûte plus cher qu’une finition standard', () => {
    const standard = computeEstimate({ ...base, finish: 'STANDARD' });
    const luxe = computeEstimate({ ...base, finish: 'LUXE' });
    assert.ok(luxe.estimate.min > standard.estimate.min);
  });

  test('les options augmentent l’estimation et apparaissent au détail', () => {
    const without = computeEstimate(base);
    const withPool = computeEstimate({ ...base, options: ['PISCINE'] });
    assert.ok(withPool.estimate.min > without.estimate.min);
    const piscine = withPool.options.find((o) => o.label.toLowerCase().includes('piscine'));
    assert.ok(piscine && piscine.amount > 0);
  });

  test('les frais administratifs majorent le total', () => {
    const withFees = computeEstimate({ ...base, includeFees: true });
    const without = computeEstimate({ ...base, includeFees: false });
    assert.ok(withFees.estimate.min > without.estimate.min);
  });

  test('le prix au m² est une valeur positive formatée', () => {
    const result = computeEstimate(base);
    assert.ok(result.estimate.perSquareMeter > 0);
    assert.match(result.estimate.perSquareMeterFormatted, /FCFA$/);
  });

  test('une surface plus grande coûte plus cher', () => {
    const small = computeEstimate({ ...base, area: 100 });
    const large = computeEstimate({ ...base, area: 400 });
    assert.ok(large.estimate.min > small.estimate.min);
  });
});
