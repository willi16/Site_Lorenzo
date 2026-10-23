import { useId, useMemo } from 'react';
import { cn } from '@/lib/cn';

/** Palette de dégradés de repli — cohérente avec la charte (marine, olivier, terracotta). */
type Palette = readonly [string, string, string];

const FALLBACK_PALETTE: Palette = ['#1f3a4d', '#33546b', '#162836'];

const PALETTES: readonly Palette[] = [
  ['#1f3a4d', '#33546b', '#162836'],
  ['#454f31', '#6a7748', '#2a301c'],
  ['#8a4a2d', '#b56a45', '#5a3120'],
  ['#2a4a5e', '#4d7d96', '#1a2f3c'],
  ['#3d4628', '#778a52', '#242a17'],
  ['#223240', '#4f5c39', '#141d26'],
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Visuel de repli lorsqu'aucune photo n'est disponible : composition
 * géométrique déterministe (dégradé + trame de plan) plutôt qu'une image
 * générique, afin de garder une direction artistique homogène.
 */
export function ProjectImage({
  src,
  alt,
  seed,
  className,
  ratio = 'aspect-[4/3]',
  priority,
  children,
}: {
  src?: string | null;
  alt: string;
  seed: string;
  className?: string;
  ratio?: string;
  priority?: boolean;
  children?: React.ReactNode;
}) {
  const palette = useMemo(
    () => PALETTES[hashString(seed) % PALETTES.length] ?? FALLBACK_PALETTE,
    [seed],
  );
  const [a, b, c] = palette;

  // Identifiant unique par instance : plusieurs visuels de repli peuvent
  // coexist dans la page (le même projet est parfois affiché deux fois) et
  // des identifiants dupliqués invalident le HTML et perturbent les trames SVG.
  const patternId = `grid-${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;

  if (src) {
    return (
      <div className={cn('relative overflow-hidden bg-ink-400/10', ratio, className)}>
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-fluid"
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', ratio, className)}
      style={{ background: `linear-gradient(160deg, ${a} 0%, ${b} 65%, ${c} 100%)` }}
      role="img"
      aria-label={alt}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.16]"
        aria-hidden
        preserveAspectRatio="none"
        viewBox="0 0 400 300"
      >
        <defs>
          <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#fff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${patternId})`} />
        <path
          d="M40 240 L40 130 L110 80 L110 240 M110 150 L200 100 L200 240 M200 170 L300 120 L300 240 M300 200 L360 165 L360 240"
          fill="none"
          stroke="#fff"
          strokeWidth="1.2"
        />
        <rect x="40" y="130" width="320" height="110" fill="none" stroke="#fff" strokeWidth="0.8" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-transparent to-transparent" />
      {children}
    </div>
  );
}
