import { useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ensureCsrfToken } from '@/lib/data';

export function NewsletterForm({
  compact,
  className,
  source = 'footer',
}: {
  compact?: boolean;
  className?: string;
  source?: string;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    try {
      await ensureCsrfToken();
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getCookieToken() ? { 'X-CSRF-Token': getCookieToken() } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email,
          name: name || undefined,
          source,
          csrfToken: getCookieToken(),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error?.message ?? 'Une erreur est survenue');
      setStatus('success');
      setMessage(payload?.data?.message ?? 'Inscription enregistrée. Vérifiez votre boîte e-mail.');
      setEmail('');
      setName('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.');
    }
  };

  if (status === 'success') {
    return (
      <div className={cn('flex items-start gap-3 rounded-xl border border-olive-600/25 bg-olive-50 p-4', className)}>
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-olive-600" aria-hidden />
        <p className="text-sm leading-relaxed text-olive-800">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn('space-y-2.5', className)} noValidate>
      <div className={cn('flex', compact ? 'flex-col sm:flex-row' : 'flex-col sm:flex-row sm:gap-2.5')}>
        {!compact ? (
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
            autoComplete="given-name"
            className="h-12 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-clay-400 focus:ring-2 focus:ring-clay-400/25"
          />
        ) : null}
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.tg"
          autoComplete="email"
          aria-label="Adresse e-mail"
          className="h-12 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/45 focus:border-clay-400 focus:ring-2 focus:ring-clay-400/25"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-clay-500 px-5 text-sm font-semibold text-white transition hover:bg-clay-600 disabled:opacity-60"
        >
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <>
              S’abonner
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>
      {status === 'error' ? (
        <p role="alert" className="text-xs font-medium text-red-300">
          {message}
        </p>
      ) : null}
    </form>
  );
}

function getCookieToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)ba_csrf=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : '';
}
