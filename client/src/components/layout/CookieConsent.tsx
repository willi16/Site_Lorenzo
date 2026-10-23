import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'ba_cookie_consent';

type Consent = 'all' | 'analytics' | 'none';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const timer = window.setTimeout(() => setVisible(true), 1200);
        return () => window.clearTimeout(timer);
      }
    } catch {
      /* stockage indisponible */
    }
    return undefined;
  }, []);

  const persist = (consent: Consent) => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ consent, analytics: consent === 'all' || (consent === 'analytics' && analytics), at: Date.now() }),
      );
    } catch {
      /* stockage indisponible */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-5"
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-ink-800/10 bg-white p-5 shadow-lift sm:p-6">
        <div className="flex items-start gap-4">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700 sm:flex">
            <Cookie className="h-5 w-5" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-base font-bold text-navy-800">
              Votre confidentialité nous tient à cœur
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              Nous utilisons des cookies pour mesurer l’audience du site (statistiques anonymisées) et
              améliorer votre expérience. Aucun cookie publicitaire ni traçage tiers sans votre accord.
              {' '}
              <Link to="/cookies" className="font-semibold text-navy-700 underline underline-offset-2">
                En savoir plus
              </Link>
            </p>

            {showSettings ? (
              <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-ink-800/10 bg-cream-100/60 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-ink-800">
                    Mesure d’audience anonymisée
                  </span>
                  <span className="block text-xs text-ink-500">Google Analytics 4 — sans identifiant publicitaire</span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-5 w-5 accent-clay-500"
                />
              </label>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-800/5 hover:text-ink-700"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          {showSettings ? (
            <Button variant="ghost" size="sm" onClick={() => persist('none')}>
              Refuser tout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => persist('none')}>
              Refuser
            </Button>
          )}
          {showSettings ? (
            <Button variant="secondary" size="sm" onClick={() => persist('analytics')}>
              Enregistrer mes choix
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
              Personnaliser
            </Button>
          )}
          <Button size="sm" onClick={() => persist('all')}>
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
