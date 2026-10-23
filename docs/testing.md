# Tests

## Vérifications manuelles effectuées
- **Santé API** : `GET /api/health` → `database: up`
- **Contenu** : `GET /api/services` retourne les services publiés
- **SSR** : Routes publiques rendues avec HTML + SEO, code HTTP 200/404 correct
- **CSRF** : Requêtes mutantes refusées sans header `X-CSRF-Token`
- **Authentification admin** : Login, accès protégé, logout
- **Leads** : Création publique + consultation/maj statut en admin
- **Rendez-vous** : Création + liste admin
- **Newsletter** : Inscription + confirmation + liste admin
- **Upload** : Upload multipart avec CSRF, téléchargement protégé du fichier privé
- **Budget** : Calculateur + API `/api/budget/tariffs` et `/api/budget/estimate`
- **SEO** : `robots.txt`, `sitemap.xml`, balises meta uniques

## Commandes de vérification
```bash
# Typecheck
npx tsc --noEmit -p server/tsconfig.json
npx tsc --noEmit -p client/tsconfig.json

# Build
npm run build

# Lint
npm run lint --workspace server
npm run lint --workspace client
```

## Données de test
- Lead de test : Jean Koffi (présent après seed)
- Admin : `admin@ba-construction.tg` / `ChangeMe!2026Secure`
