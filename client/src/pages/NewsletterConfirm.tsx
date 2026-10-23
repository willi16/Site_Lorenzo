import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { ButtonLink, Container, Section, Card, Spinner } from '@/components/ui/primitives';

type State = 'loading' | 'success' | 'error';

export default function NewsletterConfirmPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Lien de confirmation incomplet.');
      return;
    }
    let cancelled = false;
    fetch(`/api/newsletter/confirm?token=${encodeURIComponent(token)}`, {
      credentials: 'same-origin',
    })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && payload?.ok) {
          setState('success');
          setMessage(payload.data?.message ?? 'Votre inscription est confirmée. Bienvenue !');
        } else {
          setState('error');
          setMessage(
            payload?.error?.message ??
              'Lien de confirmation invalide ou déjà utilisé.',
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setState('error');
        setMessage('Impossible de confirmer votre inscription. Réessayez dans un instant.');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <Seo
        title="Confirmation d’inscription à la newsletter — B.A. Construction"
        description="Confirmez votre inscription à la lettre du cabinet B.A. Construction : actualités, conseils et un aperçu de nos réalisations au Togo."
        noindex
      />

      <Section spacing="tight" className="bg-cream-100">
        <Container size="narrow">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Card className="p-9 text-center">
              {state === 'loading' ? (
                <>
                  <Spinner className="mx-auto h-8 w-8" />
                  <h1 className="mt-5 font-display text-2xl font-extrabold text-navy-800">
                    Confirmation en cours…
                  </h1>
                  <p className="mt-2 text-sm text-ink-600">
                    Nous validons votre inscription à la lettre du cabinet.
                  </p>
                </>
              ) : state === 'success' ? (
                <>
                  <CheckCircle2 className="mx-auto h-12 w-12 text-olive-600" aria-hidden />
                  <h1 className="mt-5 font-display text-2xl font-extrabold text-navy-800">
                    Inscription confirmée
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
                    {message}
                  </p>
                  <p className="mt-4 text-sm text-ink-600">
                    Vous recevrez désormais nos actualités, nos conseils et nos appels à projets
                    — jamais plus d’un e-mail par mois.
                  </p>
                  <ButtonLink to="/actualites" className="mt-7">
                    Découvrir nos publications
                  </ButtonLink>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto h-12 w-12 text-red-600" aria-hidden />
                  <h1 className="mt-5 font-display text-2xl font-extrabold text-navy-800">
                    Confirmation impossible
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
                    {message}
                  </p>
                  <p className="mt-4 text-sm text-ink-600">
                    Vous pouvez vous réinscrire directement, ou nous écrire si le problème
                    persiste.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <ButtonLink to="/" icon={<Mail className="h-4 w-4" aria-hidden />}>
                      Retour à l’accueil
                    </ButtonLink>
                    <ButtonLink to="/contact" variant="outline">
                      Nous écrire
                    </ButtonLink>
                  </div>
                  <p className="mt-6 text-xs text-ink-400">
                    Besoin d’aide ?{' '}
                    <Link to="/contact" className="underline">
                      Contactez le cabinet
                    </Link>
                    .
                  </p>
                </>
              )}
            </Card>
          </motion.div>
        </Container>
      </Section>
    </>
  );
}
