import { motion } from 'framer-motion';
import { ArrowRight, Compass, Home, Search } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { ButtonLink, Container, Section, Card } from '@/components/ui/primitives';
import { NAV_LINKS } from '@/lib/constants';

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page introuvable (404) — B.A. Construction"
        description="La page demandée n’existe pas ou a été déplacée. Retrouvez nos prestations, nos réalisations et le formulaire de contact."
        noindex
      />

      <Section spacing="tight" className="bg-cream-100">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="font-display text-7xl font-extrabold text-clay-500 sm:text-8xl">404</p>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-navy-800 sm:text-4xl">
              Cette page n’existe pas
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-600">
              Le lien est peut-être obsolète, ou la page a été déplacée lors de la refonte du site.
              Voici par où reprendre.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink to="/" size="lg" icon={<Home className="h-4 w-4" aria-hidden />}>
                Retour à l’accueil
              </ButtonLink>
              <ButtonLink
                to="/rechercher"
                size="lg"
                variant="outline"
                icon={<Search className="h-4 w-4" aria-hidden />}
              >
                Rechercher
              </ButtonLink>
            </div>
          </motion.div>

          <Card className="mt-14 p-7">
            <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-800">
              <Compass className="h-5 w-5 text-clay-500" aria-hidden />
              Destinations populaires
            </h2>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <ButtonLink
                    to={link.to}
                    variant="ghost"
                    className="w-full justify-between"
                    iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                  >
                    {link.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>
          </Card>
        </Container>
      </Section>
    </>
  );
}
