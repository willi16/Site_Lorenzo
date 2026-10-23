import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

/**
 * Reproduit la fabrique `booleanFromEnv` de `config/env.ts`.
 *
 * Le module `env.ts` appelle `process.exit(1)` au chargement si la configuration
 * est invalide : il n'est pas importable directement dans un test. On vérifie
 * donc ici le comportement du schéma, qui est la partie qui posait problème.
 */
function booleanFromEnv(defaultValue: boolean) {
  return z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined || value.trim() === '') return defaultValue;
      const normalized = value.trim().toLowerCase();
      if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
      if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
      return defaultValue;
    });
}

describe('booleanFromEnv', () => {
  test('interprète "false" comme faux (régression z.coerce.boolean)', () => {
    // `z.coerce.boolean().parse('false')` renvoie `true` car JS applique
    // `Boolean('false')`. C'était la cause d'une activation involontaire de
    // TRUST_PROXY, MAIL_ENABLED et SMTP_SECURE.
    assert.equal(booleanFromEnv(false).parse('false'), false);
    assert.equal(z.coerce.boolean().parse('false'), true);
  });

  test('interprète les chaînes vraies', () => {
    for (const value of ['true', 'TRUE', '1', 'yes', 'on', ' true ']) {
      assert.equal(booleanFromEnv(false).parse(value), true, `« ${value} » devrait être vrai`);
    }
  });

  test('interprète les chaînes fausses', () => {
    for (const value of ['false', 'FALSE', '0', 'no', 'off', ' false ']) {
      assert.equal(booleanFromEnv(true).parse(value), false, `« ${value} » devrait être faux`);
    }
  });

  test('retombe sur la valeur par défaut si absente ou vide', () => {
    assert.equal(booleanFromEnv(true).parse(undefined), true);
    assert.equal(booleanFromEnv(false).parse(undefined), false);
    assert.equal(booleanFromEnv(true).parse(''), true);
    assert.equal(booleanFromEnv(false).parse('   '), false);
  });

  test('retombe sur la valeur par défaut si non reconnue', () => {
    assert.equal(booleanFromEnv(true).parse('peut-être'), true);
    assert.equal(booleanFromEnv(false).parse('peut-être'), false);
  });
});
