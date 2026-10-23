import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { hashPassword, verifyPassword, hashToken, generateSecureToken } from '../src/lib/password.ts';
import { slugify, uniqueSlug } from '../src/lib/slug.ts';
import { AppError, badRequest, notFound, forbidden } from '../src/lib/errors.ts';

describe('password', () => {
  test('vérifie un mot de passe correct', async () => {
    const hash = await hashPassword('MotDePasse!2026');
    assert.equal(await verifyPassword('MotDePasse!2026', hash), true);
  });

  test('rejette un mot de passe incorrect', async () => {
    const hash = await hashPassword('MotDePasse!2026');
    assert.equal(await verifyPassword('MotDePasse!2027', hash), false);
  });

  test('produit des sels distincts pour le même mot de passe', async () => {
    const a = await hashPassword('identique');
    const b = await hashPassword('identique');
    assert.notEqual(a, b);
    assert.equal(await verifyPassword('identique', a), true);
    assert.equal(await verifyPassword('identique', b), true);
  });

  test('rejette un hash malformé sans lever d’erreur', async () => {
    assert.equal(await verifyPassword('x', 'n’importe quoi'), false);
    assert.equal(await verifyPassword('x', 'scrypt$1$2$3$zz$zz'), false);
  });

  test('hashToken est déterministe et distinct par jeton', () => {
    const token = generateSecureToken(32);
    assert.equal(hashToken(token), hashToken(token));
    assert.notEqual(hashToken(token), hashToken(generateSecureToken(32)));
  });
});

describe('slugify', () => {
  test('normalise accents et espaces', () => {
    assert.equal(slugify('Réhabilitation à Kégué'), 'rehabilitation-a-kegue');
  });

  test('remplace apostrophes et caractères spéciaux', () => {
    assert.equal(slugify("L'art de bâtir"), 'l-art-de-batir');
    assert.equal(slugify('Villa — 3 chambres (2026)'), 'villa-3-chambres-2026');
  });

  test('retombe sur un slug par défaut si vide', () => {
    assert.equal(slugify(''), 'sans-titre');
    assert.equal(slugify('!!!'), 'sans-titre');
  });

  test('tronque à 140 caractères', () => {
    const long = 'a'.repeat(300);
    assert.ok(slugify(long).length <= 140);
  });
});

describe('uniqueSlug', () => {
  test('suffixe tant que le slug est pris', async () => {
    const taken = new Set(['villa-bleue', 'villa-bleue-2']);
    const slug = await uniqueSlug(async (s) => taken.has(s), 'Villa bleue');
    assert.equal(slug, 'villa-bleue-3');
  });

  test('renvoie le slug de base s’il est libre', async () => {
    const slug = await uniqueSlug(async () => false, 'Villa bleue');
    assert.equal(slug, 'villa-bleue');
  });
});

describe('AppError', () => {
  test('porte le statut et le code', () => {
    const err = badRequest('Champ invalide');
    assert.ok(err instanceof AppError);
    assert.equal(err.statusCode, 400);
    assert.equal(err.code, 'BAD_REQUEST');
    assert.equal(err.isOperational, true);
  });

  test('les fabriques positionnent les bons statuts', () => {
    assert.equal(notFound().statusCode, 404);
    assert.equal(forbidden().statusCode, 403);
  });
});
