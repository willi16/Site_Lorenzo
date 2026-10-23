# Guide de déploiement — B.A. Construction

Objectif : déployer gratuitement, avec un seul service qui sert l'API + le rendu SSR + le client.

## Architecture recommandée (gratuite)

| Composant | Hébergeur | Gratuit | Notes |
|---|---|---|---|
| Application Node (Express + Vite SSR + assets) | [Render](https://render.com/) (Web Service, Free) | Oui | Un seul service. Build npm, démarre `npm run start`. |
| PostgreSQL | [Neon](https://neon.tech/) (Free Tier) | Oui | Stable, `sslmode=require`. Les bases gratuites Render ont une durée de vie limitée — Neon est plus adapté ici. |

> Si vous préférez tout sur Render, vous pouvez utiliser Render Postgres, mais la gratuité et la pérennité varient. Neon reste gratuit et simple.

## 1) Créer la base de données (Neon)

1. Créer un compte sur [neon.tech](https://neon.tech/) (gratuit).
2. Créer un projet dans la **même région que Render** (le `render.yaml` utilise `ohio` = `us-east-2`) pour limiter la latence des requêtes SSR.
3. Copier la **connection string** fournie : `postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
4. La conserver pour l'étape suivante.

## 2) Déployer l'application (Render)

### Via `render.yaml` (recommandé)

1. Pousser la branche `main` sur GitHub (déjà fait).
2. Aller sur [dashboard.render.com](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Connecter le dépôt `willi16/Site_Lorenzo` et sélectionner la branche `main`.
4. Render détectera `render.yaml`. Valider le déploiement du blueprint.
5. Dans **Environment** du service créé, renseigner :
   - `DATABASE_URL` : la connection string Neon **directe** (sans `-pooler`, avec `sslmode=require`) — **obligatoire avant le premier build**, car les migrations y sont appliquées. La connexion « pooler » de Neon n'est pas fiable pour `prisma migrate deploy`.
   - `APP_URL`, `API_URL`, `CORS_ORIGINS` : **inutiles** par défaut, le serveur les déduit de `RENDER_EXTERNAL_URL` (variable fournie automatiquement par Render). Ne les définir que pour utiliser un domaine personnalisé.
6. Relancer un **Manual Deploy** si des variables ont été ajoutées après la première création.

### Commandes utilisées

- **Build** : `npm ci --include=dev && npm run build && npm run db:deploy`
  - `npm run build` compile le serveur (`prisma generate` + `tsc`) et le client + bundle SSR Vite
  - `npm run db:deploy` applique les migrations Prisma en production
- **Start** : `npm run start` (`node dist/index.js`)
- **Health check** : `GET /api/health`

> Sur le plan gratuit Render, le service se met en veille après inactivité. Le premier appel peut donc prendre 30-60 secondes pour se réveiller.

## 3) Initialiser les données

Le seed n'est **pas** lancé automatiquement par le build pour éviter d'écraser des données existantes. Il peut être exécuté **avant** le déploiement, depuis la machine locale (recommandé : Neon est directement accessible) :

1. Pointer `DATABASE_URL` vers Neon, puis appliquer les migrations et le seed avec des mots de passe forts :
   ```bash
   DATABASE_URL='postgresql://…direct…?sslmode=require' \
   SEED_ADMIN_PASSWORD='…' SEED_EDITOR_PASSWORD='…' \
   npm run db:deploy && npm run db:seed
   ```
2. Alternative : dans Render → votre service → **Shell**, exécuter la même commande.
3. Noter les identifiants et **changer les mots de passe** depuis l'administration après la première connexion.

## 4) Fichier `.env` minimal pour la prod

Reporter dans Render (à ne **jamais** commiter) :

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
TRUST_PROXY=true

DATABASE_URL=postgresql://...neon.tech/...?sslmode=require

# Facultatif : déduits de RENDER_EXTERNAL_URL. À définir uniquement pour un domaine perso.
APP_URL=https://ba-construction.onrender.com
API_URL=https://ba-construction.onrender.com
CORS_ORIGINS=https://ba-construction.onrender.com

JWT_SECRET=<généré par Render ou openssl rand -base64 48>
JWT_REFRESH_SECRET=<différent, même longueur>
CSRF_SECRET=<différent>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7

MAIL_ENABLED=false
UPLOAD_DIR=./storage/uploads
MAX_UPLOAD_MB=10

# Uniquement pour exécuter le seed (jamais nécessaires au runtime).
SEED_ADMIN_EMAIL=admin@ba-construction.tg
SEED_ADMIN_PASSWORD=<fort>
SEED_EDITOR_EMAIL=editeur@ba-construction.tg
SEED_EDITOR_PASSWORD=<fort>
```

Générer des secrets sécurisés :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## 5) Vérification post-déploiement

| Contrôle | Attendu |
|---|---|
| `GET /api/health` | `{"ok":true,...,"database":"up"}` |
| `GET /api/csrf` | Jeton CSRF retourné (cookie posé) |
| Page d'accueil `/` | Rendu sans erreur, assets chargés |
| `/admin/login` | Formulaire accessible |
| Connexion admin | Fonctionnelle avec les identifiants seed |

## Astuces & limites (gratuit)

- **Stockage des uploads** : le disque éphémère de Render Free est réinitialisé à chaque déploiement. Pour des uploads persistants, utiliser [Cloudinary](https://cloudinary.com/) (gratuit) ou [R2](https://developers.cloudflare.com/r2/) (gratuit). Actuellement les uploads vont dans `./storage/uploads`.
- **Sommeil** : Render Free endort le service sans trafic.
- **Build time** : un peu long au premier build (prisma generate + vite build + tsc) — normal.
- **Domaine perso** : Render Free ne permet pas toujours les domaines personnalisés sans contraintes ; vérifier au moment voulu.

## Workflow Git (déjà en place)

- Travailler sur `dev`, pousser, tester localement/build.
- Passer sur `main` uniquement avec votre accord (merge ou pull request) pour déclencher le déploiement Render.
