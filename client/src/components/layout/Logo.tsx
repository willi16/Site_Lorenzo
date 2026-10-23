import { cn } from '@/lib/cn';

export function LogoMark({ className, tone = 'navy' }: { className?: string; tone?: 'navy' | 'light' }) {
  const primary = tone === 'light' ? '#ffffff' : '#1a3751';
  const accent = '#e76836';
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('h-10 w-10', className)}
      role="img"
      aria-label="B.A. Construction"
    >
      <rect x="1.5" y="1.5" width="45" height="45" rx="11" fill={primary} />
      <path d="M12 35V13h13.5c5.2 0 8.5 2.6 8.5 6.8 0 3-1.8 5.2-4.6 6l5.6 9.2h-6.4l-4.9-8.4h-5.4V35H12z" fill="#fff" />
      <path d="M17.2 17.6v4.6h7.4c1.9 0 3.1-1 3.1-2.4 0-1.5-1.2-2.2-3.1-2.2h-7.4z" fill={accent} />
    </svg>
  );
}

export function Logo({
  className,
  tone = 'navy',
  showTagline = true,
}: {
  className?: string;
  tone?: 'navy' | 'light';
  showTagline?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark tone={tone} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-lg font-extrabold tracking-tight',
            tone === 'light' ? 'text-white' : 'text-navy-800',
          )}
        >
          B.A.<span className="text-clay-500">&nbsp;Construction</span>
        </span>
        {showTagline ? (
          <span
            className={cn(
              'mt-1 text-[0.6rem] font-semibold uppercase tracking-widest2',
              tone === 'light' ? 'text-white/60' : 'text-ink-500',
            )}
          >
            Lundi Bâtisseur · Togo
          </span>
        ) : null}
      </span>
    </span>
  );
}
