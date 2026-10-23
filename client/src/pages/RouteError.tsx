import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Mail } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { ButtonLink, Container, Section } from '@/components/ui/primitives';
import { AppLayout } from '@/app/App';
import NotFoundPage from '@/pages/NotFound';

/**
 * Filet de sécurité des routes : une erreur de chargement (ressource supprimée,
 * identifiant inconnu, incident ponctuel) affiche une page lisible plutôt que
 * l'écran d'erreur brut du routeur.
 */
export default function RouteError() {
  const error = useRouteError();

  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const status = isRouteErrorResponse(error) ? error.status : 500;

  if (isNotFound) {
    return (
      <AppLayout>
        <NotFoundPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <>
        <Seo
          title="Une erreur est survenue — B.A. Construction"
          description="Le site a rencontré un incident inattendu. Réessayez dans un instant ou contactez-nous."
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
              <p className="font-display text-7xl font-extrabold text-clay-500 sm:text-8xl">
                {status}
              </p>
              <h1 className="mt-4 font-display text-3xl font-extrabold text-navy-800 sm:text-4xl">
                Un incident est survenu
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-ink-600">
                La page demandée n’a pas pu être chargée. Vous pouvez réessayer, revenir à
                l’accueil, ou nous écrire : nous répondrons dans la journée.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink to="/" size="lg" icon={<Home className="h-4 w-4" aria-hidden />}>
                  Retour à l’accueil
                </ButtonLink>
                <ButtonLink
                  to="/contact"
                  size="lg"
                  variant="outline"
                  icon={<Mail className="h-4 w-4" aria-hidden />}
                >
                  Nous écrire
                </ButtonLink>
              </div>

              <p className="mt-8 inline-flex items-center gap-2 text-sm text-ink-500">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Référence : {status} — le journal serveur contient le détail technique.
              </p>
            </motion.div>
          </Container>
        </Section>
      </>
    </AppLayout>
  );
}
