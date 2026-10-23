import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, Phone, Search, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CONTACT, NAV_LINKS } from '@/lib/constants';
import { ButtonLink } from '@/components/ui/primitives';
import { Logo } from './Logo';

const SERVICES_MENU = [
  { label: 'Architecture résidentielle', to: '/services/architecture-residentielle', desc: 'Maisons, immeubles, lotissements' },
  { label: 'Architecture commerciale', to: '/services/architecture-commerciale', desc: 'Bureaux, commerces, équipements' },
  { label: 'Rénovation et extension', to: '/services/renovation-et-extension', desc: 'Réhabilitation, avant/après' },
  { label: 'Aménagement intérieur', to: '/services/amenagement-interieur', desc: 'Design, matériaux, éclairage' },
  { label: 'Aménagement extérieur', to: '/services/amenagement-exterieur', desc: 'Jardins, terrasses, piscines' },
  { label: 'Suivi de chantier', to: '/services/suivi-de-chantier', desc: 'Pilotage, contrôle, réception' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const servicesRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setServicesOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setServicesOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative py-2 text-sm font-semibold transition-colors duration-200',
      'after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:transition-all after:duration-300 after:ease-fluid',
      isActive
        ? 'text-navy-800 after:w-full after:bg-clay-500'
        : 'text-ink-600 after:w-0 after:bg-clay-500 hover:text-navy-800 hover:after:w-full',
    );

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-navy-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Aller au contenu principal
      </a>

      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-fluid',
          scrolled
            ? 'border-b border-ink-800/[0.07] bg-white/92 shadow-nav backdrop-blur-xl'
            : 'bg-white/70 backdrop-blur-md',
        )}
      >
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center gap-4 px-5 sm:px-8">
          <Link to="/" className="shrink-0" aria-label="B.A. Construction — accueil">
            <Logo />
          </Link>

          <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) =>
              link.label === 'Services' ? (
                <div key={link.to} className="relative" ref={servicesRef}>
                  <button
                    type="button"
                    onClick={() => setServicesOpen((v) => !v)}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                    className={cn(
                      'flex items-center gap-1.5 py-2 text-sm font-semibold transition-colors duration-200',
                      location.pathname.startsWith('/services')
                        ? 'text-navy-800'
                        : 'text-ink-600 hover:text-navy-800',
                    )}
                  >
                    Services
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform duration-200', servicesOpen && 'rotate-180')}
                      aria-hidden
                    />
                  </button>
                  <AnimatePresence>
                    {servicesOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute left-1/2 top-full w-[420px] -translate-x-1/2 pt-3"
                      >
                        <div className="overflow-hidden rounded-2xl border border-ink-800/[0.08] bg-white p-2 shadow-lift">
                          {SERVICES_MENU.map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="block rounded-xl px-4 py-3 transition hover:bg-navy-700/[0.04]"
                            >
                              <span className="block text-sm font-semibold text-navy-800">{item.label}</span>
                              <span className="mt-0.5 block text-xs text-ink-500">{item.desc}</span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink key={link.to} to={link.to} className={navLinkClass} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                requestAnimationFrame(() => searchInputRef.current?.focus());
              }}
              className="hidden rounded-lg p-2.5 text-ink-600 transition hover:bg-navy-700/5 hover:text-navy-800 sm:block"
              aria-label="Rechercher (Ctrl+K)"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <a
              href={CONTACT.phoneHref}
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 transition hover:bg-navy-700/5 xl:flex"
            >
              <Phone className="h-4 w-4 text-clay-500" aria-hidden />
              {CONTACT.phone}
            </a>
            <ButtonLink to="/contact" size="sm" className="hidden sm:inline-flex">
              Demander un devis
            </ButtonLink>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2.5 text-navy-800 transition hover:bg-navy-700/5 lg:hidden"
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="border-t border-ink-800/[0.07] bg-white"
            >
              <form
                action="/rechercher"
                method="get"
                className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-4"
              >
                <Search className="h-5 w-5 shrink-0 text-ink-400" aria-hidden />
                <input
                  ref={searchInputRef}
                  name="q"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un projet, un service, un article…"
                  className="h-10 flex-1 bg-transparent text-[0.95rem] text-ink-800 outline-none placeholder:text-ink-400"
                  aria-label="Terme de recherche"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-lg p-2 text-ink-500 transition hover:bg-navy-700/5"
                  aria-label="Fermer la recherche"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[72px] z-40 overflow-y-auto bg-white lg:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 pb-8 pt-6" aria-label="Navigation mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-3.5 font-display text-lg font-bold transition',
                      isActive ? 'bg-navy-700/5 text-navy-800' : 'text-ink-700',
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="my-3 border-t border-ink-800/[0.08]" />
              <p className="px-4 pb-2 text-xs font-bold uppercase tracking-widest2 text-ink-400">
                Nos services
              </p>
              {SERVICES_MENU.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-navy-700/[0.04] hover:text-navy-800"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-4 border-t border-ink-800/[0.08]" />
              <ButtonLink to="/contact" size="lg" fullWidth className="mx-4 w-[calc(100%-2rem)]">
                Demander un devis
              </ButtonLink>
              <a
                href={CONTACT.phoneHref}
                className="mt-3 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-navy-800"
              >
                <Phone className="h-4 w-4 text-clay-500" aria-hidden />
                {CONTACT.phone}
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
