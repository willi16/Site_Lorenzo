import { useEffect, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsent } from '@/components/layout/CookieConsent';

/** Remet la vue en haut à chaque navigation (et à l'ancre si fournie). */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}

/** Gabarit public : en-tête, contenu, pied de page et consentement cookies. */
export function AppLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main id="contenu" className="flex-1">
        {children ?? <Outlet />}
      </main>

      <Footer />
      <CookieConsent />
      <ScrollManager />
    </div>
  );
}
