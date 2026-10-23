import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

// Surface d'import unique pour les composants d'interface : les primitives
// (boutons, cartes, sections) et les champs de formulaire.
export {
  Checkbox,
  Field,
  FormStatus,
  Input,
  Select,
  Textarea,
} from './form';
export type { InputProps, SelectProps, TextareaProps } from './form';

/* ────────────────────────────────── Bouton ──────────────────────────────── */

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-clay-500 text-white shadow-soft hover:bg-clay-600 active:bg-clay-700 focus-visible:outline-clay-600',
  secondary:
    'bg-navy-700 text-white shadow-soft hover:bg-navy-800 active:bg-navy-900 focus-visible:outline-navy-700',
  outline:
    'border border-ink-800/15 text-ink-800 bg-white/60 hover:border-navy-700 hover:text-navy-700 focus-visible:outline-navy-700',
  ghost: 'text-ink-700 hover:bg-navy-700/5 hover:text-navy-700 focus-visible:outline-navy-600',
  light: 'bg-white text-navy-800 shadow-soft hover:bg-cream-100 focus-visible:outline-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5 py-3.5',
};

const BASE =
  'inline-flex items-center justify-center rounded-xl font-semibold tracking-tight transition-all duration-200 ease-fluid disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.985] whitespace-nowrap';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  external?: boolean;
  ariaLabel?: string;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  iconRight,
  fullWidth,
  external,
  ariaLabel,
}: ButtonLinkProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes} aria-label={ariaLabel}>
        {icon}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <Link to={to} className={classes} aria-label={ariaLabel}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

/* ───────────────────────────────── Conteneur ────────────────────────────── */

export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'wide' | 'narrow';
}) {
  const width =
    size === 'wide' ? 'max-w-[88rem]' : size === 'narrow' ? 'max-w-3xl' : 'max-w-7xl';
  return <div className={cn('mx-auto w-full px-5 sm:px-8', width, className)}>{children}</div>;
}

/* ────────────────────────────────── Section ─────────────────────────────── */

export function Section({
  children,
  className,
  id,
  tone = 'white',
  spacing = 'default',
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: 'white' | 'cream' | 'navy' | 'transparent';
  spacing?: 'default' | 'tight' | 'loose';
}) {
  const tones = {
    white: 'bg-white',
    cream: 'bg-cream-100',
    navy: 'bg-navy-700 text-white',
    transparent: '',
  };
  const paddings = {
    tight: 'py-12 sm:py-16',
    default: 'py-16 sm:py-20 lg:py-24',
    loose: 'py-24 sm:py-32',
  };
  return (
    <section id={id} className={cn(tones[tone], paddings[spacing], className)}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest2',
            tone === 'light' ? 'text-sky-200' : 'text-clay-600',
          )}
        >
          <span className={cn('h-px w-8', tone === 'light' ? 'bg-sky-300/60' : 'bg-clay-500/40')} />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          'font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]',
          tone === 'light' ? 'text-white' : 'text-navy-800',
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-base leading-relaxed sm:text-lg',
            tone === 'light' ? 'text-white/70' : 'text-ink-600',
          )}
        >
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}

/* ─────────────────────────────────── Badge ─────────────────────────────── */

export function Badge({
  children,
  tone = 'navy',
  className,
}: {
  children: ReactNode;
  tone?: 'navy' | 'clay' | 'olive' | 'sky' | 'neutral' | 'light';
  className?: string;
}) {
  const tones = {
    navy: 'bg-navy-700/10 text-navy-700',
    clay: 'bg-clay-500/12 text-clay-700',
    olive: 'bg-olive-600/12 text-olive-700',
    sky: 'bg-sky-600/12 text-sky-700',
    neutral: 'bg-ink-500/10 text-ink-600',
    light: 'bg-white/15 text-white',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─────────────────────────────────── Card ──────────────────────────────── */

export function Card({
  children,
  className,
  as: As = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'li';
}) {
  return (
    <As
      className={cn(
        'rounded-2xl border border-ink-800/[0.07] bg-white shadow-soft transition-all duration-300 ease-fluid',
        className,
      )}
    >
      {children}
    </As>
  );
}

/* ───────────────────────────────── Feedback ─────────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-clay-500', className)} aria-hidden />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-[linear-gradient(90deg,rgba(26,55,81,0.06)_25%,rgba(26,55,81,0.12)_50%,rgba(26,55,81,0.06)_75%)] bg-[length:200%_100%]',
        className,
      )}
      aria-hidden
    />
  );
}

export function Rating({
  value,
  className,
  size = 16,
}: {
  value: number;
  className?: string;
  size?: number;
}) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i < value ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
          className={i < value ? 'text-clay-500' : 'text-ink-400/40'}
          aria-hidden
        >
          <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.2l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/* ──────────────────────────────── Séparateur ────────────────────────────── */

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-ink-800/[0.08]', className)} />;
}
