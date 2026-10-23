import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, LogIn, Mail } from 'lucide-react';
import { Seo } from '@/lib/seo';
import { Button, Card, Input, FormStatus } from '@/components/ui/primitives';
import { AdminAuthError, login } from '@/lib/adminApi';
import { ensureCsrfToken } from '@/lib/data';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ensureCsrfToken();
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(
        err instanceof AdminAuthError
          ? err.message
          : 'Connexion impossible. Vérifiez vos identifiants.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Espace administration — B.A. Construction" noindex />

      <section className="flex min-h-[70vh] items-center bg-navy-800 py-20">
        <div className="mx-auto w-full max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-clay-500 text-white">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="mt-5 font-display text-2xl font-extrabold text-white">
                Espace administration
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Accès réservé à l’équipe du cabinet.
              </p>
            </div>

            <Card className="mt-8 p-7">
              {error ? (
                <div className="mb-5">
                  <FormStatus type="error" message={error} />
                </div>
              ) : null}

              <form onSubmit={submit} className="space-y-4">
                <Input
                  label="Adresse e-mail"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-4 w-4" aria-hidden />}
                />
                <Input
                  label="Mot de passe"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" aria-hidden />}
                />
                <Button type="submit" fullWidth size="lg" loading={loading} icon={<LogIn className="h-4 w-4" aria-hidden />}>
                  Se connecter
                </Button>
              </form>

              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                Le compte est verrouillé après plusieurs tentatives échouées. En cas de blocage,
                contactez l’administrateur du cabinet.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    </>
  );
}
