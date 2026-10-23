# Variables d'environnement

## Obligatoires
| Variable | Description | Exemple |
| --- | --- | --- |
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@localhost:5433/ba_construction?schema=public` |
| `JWT_SECRET` | Secret pour les tokens JWT | Chaîne aléatoire (min 32 caractères) |
| `JWT_REFRESH_SECRET` | Secret pour les refresh tokens | Chaîne aléatoire (min 32 caractères) |
| `CSRF_SECRET` | Secret pour la signature CSRF | Chaîne aléatoire (min 32 caractères) |
| `SESSION_SECRET` | Secret de session | Chaîne aléatoire (min 32 caractères) |

## Optionnelles
| Variable | Description | Défaut |
| --- | --- | --- |
| `PORT` | Port du serveur | `4000` |
| `NODE_ENV` | Environnement | `development` |
| `APP_URL` | URL publique de l'application | `http://localhost:5173` |
| `CORS_ORIGINS` | Origines CORS autorisées (séparées par virgule) | `http://localhost:5173,http://localhost:4000` |
| `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` | Configuration SMTP | (non requis en dev) |
| `MAIL_FROM` | Expéditeur des emails | `B.A. Construction <no-reply@ba-construction.tg>` |

## Notes
- Le fichier `.env` doit être à la racine du projet (lu par Prisma et par le serveur)
- Prisma doit être exécuté depuis la racine avec `--schema server/prisma/schema.prisma`
- En développement local avec Docker, PostgreSQL est exposé sur le port **5433**
