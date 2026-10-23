import { Link } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Linkedin, Lock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { CONTACT, FOOTER_LINKS } from '@/lib/constants';
import { Logo } from './Logo';
import { Container } from '@/components/ui/primitives';
import { NewsletterForm } from '@/components/sections/NewsletterForm';

const SOCIAL_ICONS = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin } as const;

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white/70">
      <div className="border-b border-white/10">
        <Container size="wide" className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                Parlons de votre projet
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed">
                Un terrain, un local, une envie de construire ? Nos architectes vous accompagnent
                de la première esquisse à la réception de votre chantier.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-clay-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-clay-600"
                >
                  Demander un devis gratuit
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-white">
                Recevez nos réalisations & nos conseils
              </h3>
              <p className="mt-1.5 text-sm">
                Une lettre d’architecture par mois : projets, budgets, réglementations togolaises.
              </p>
              <NewsletterForm compact className="mt-5" />
              <p className="mt-3 text-xs text-white/45">
                Pas de spam. Désinscription en un clic. Conforme au RGPD.
              </p>
            </div>
          </div>
        </Container>
      </div>

      <Container size="wide" className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Cabinet d’architecture et de construction basé à Lomé, Togo. Nous concevons,
              construisons et rénovons des bâtiments durables adaptés au climat ouest-africain.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-clay-400" aria-hidden />
                <span>
                  {CONTACT.address}
                  <br />
                  {CONTACT.city}, {CONTACT.country}
                </span>
              </li>
              <li>
                <a href={CONTACT.phoneHref} className="flex items-center gap-3 transition hover:text-white">
                  <Phone className="h-4 w-4 shrink-0 text-clay-400" aria-hidden />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 transition hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-clay-400" aria-hidden />
                  {CONTACT.email}
                </a>
              </li>
            </ul>

            <div className="mt-6 flex gap-2">
              {CONTACT.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.icon as keyof typeof SOCIAL_ICONS];
                if (!Icon) return null;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-white/70 transition hover:border-clay-500 hover:bg-clay-500 hover:text-white"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-8">
            <FooterColumn title="Nos services" links={FOOTER_LINKS.services} />
            <FooterColumn title="Le cabinet" links={FOOTER_LINKS.cabinet} />
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-widest2 text-white">
                Outils
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {FOOTER_LINKS.tools.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 font-display text-sm font-bold uppercase tracking-widest2 text-white">
                Légal
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container size="wide" className="flex flex-col items-center justify-between gap-3 py-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} {CONTACT.legalName}. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/45">
            <span className="inline-flex items-center gap-1">
              <Send className="h-3 w-3" aria-hidden />
              Conçu et développé en Afrique de l’Ouest
            </span>
            <span aria-hidden>·</span>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1 transition hover:text-white"
            >
              <Lock className="h-3 w-3" aria-hidden />
              Espace admin
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-widest2 text-white">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="transition hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
