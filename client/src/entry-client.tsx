import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HeadProvider } from '@/lib/seo';
import { routes } from './app/routes';
import './styles/index.css';

/**
 * Point d'entrée navigateur.
 *
 * En production, le serveur a déjà rendu la page : on hydrate le markup
 * existant avec les données de navigation sérialisées (hydrationData) afin
 * d'éviter tout aller-retour réseau au premier affichage.
 */
declare global {
  interface Window {
    __reactRouterContext?: unknown;
  }
}

const router = createBrowserRouter(routes, {
  hydrationData: window.__reactRouterContext as never,
});

// Le serveur a rendu le contenu dans <div id="root"> : on l'hydrate à cet
// endroit (et non sur `document`, qui ne correspond pas au balisage rendu).
const container = document.getElementById('root');
if (!container) {
  throw new Error('Élément #root introuvable : le gabarit HTML est incomplet.');
}

hydrateRoot(
  container,
  <StrictMode>
    <HeadProvider>
      <RouterProvider router={router} />
    </HeadProvider>
  </StrictMode>,
);
