# B.A. Construction

Site web du cabinet d'architecture et de construction B.A. Construction (Lomé, Togo).

## Stack technique
- **Frontend** : React 18 + TypeScript + Vite 6 + React Router 6.30 + Tailwind CSS 3 + Framer Motion
- **Backend** : Node.js 22 + Express 4 + TypeScript (ESM) + Prisma 5 + PostgreSQL 16
- **Monorepo** : npm workspaces (`client/`, `server/`)

## Démarrage rapide
1. Cloner le dépôt
2. Copier `.env.example` vers `.env` à la racine et renseigner les valeurs
3. Lancer PostgreSQL : `docker compose up -d db`
4. Installer les dépendances : `npm install`
5. Initialiser la base : `npm run setup` (génère Prisma, applique les migrations, exécute le seed)
6. Développer : `npm run dev` (client + serveur en parallèle)
7. Production : `npm run build && npm start`

## Scripts principaux (racine)
| Script | Description |
| --- | --- |
| `npm run dev` | Démarrage en développement (client + serveur) |
| `npm run build` | Build client et serveur |
| `npm start` | Démarre le serveur compilé |
| `npm run setup` | Génère Prisma, déploie les migrations, seed la base |
| `npm run db:deploy` | Applique les migrations Prisma depuis la racine |
| `npm run db:seed` | Exécute le seed depuis la racine |
| `npm run prerender` | Pré-rend les pages statiques |

## Structure
```
.
├── client/        # Application React + Vite (CSR + SSR bundle)
├── server/        # API Express + SSR + Prisma
├── docker-compose.yml
├── docs/
└── scripts/
```

## Sécurité
- CSRF obligatoire sur toutes les requêtes mutantes (header `X-CSRF-Token`)
- Authentification par cookies HTTP-only (access + refresh)
- Rate limiting et ralentissement sur les formulaires
- Honeypot sur le formulaire de lead
- Uploads privés dans `storage/private/` (accès authentifié)
- Validation Zod sur toutes les entrées

## Variables d'environnement
Voir `.env.example` pour la liste complète. Les secrets de développement ne doivent **jamais** être commités.

## Comptes de test
- Admin : `admin@ba-construction.tg` / `ChangeMe!2026Secure` (à changer en production)
- Base PostgreSQL locale : `localhost:5433` via Docker
