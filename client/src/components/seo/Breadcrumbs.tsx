import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({
  items,
  tone = 'light',
  className,
}: {
  items: Crumb[];
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return (
    <nav aria-label="Fil d’Ariane" className={cn('text-sm', className)}>
      <ol className={cn('flex flex-wrap items-center gap-1.5', tone === 'light' ? 'text-white/60' : 'text-ink-500')}>
        <li className="flex items-center gap-1.5">
          <Link
            to="/"
            className={cn(
              'inline-flex items-center gap-1.5 transition hover:underline',
              tone === 'light' ? 'hover:text-white' : 'hover:text-navy-700',
            )}
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            Accueil
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />
            {item.to && index < items.length - 1 ? (
              <Link
                to={item.to}
                className={cn(
                  'transition hover:underline',
                  tone === 'light' ? 'hover:text-white' : 'hover:text-navy-700',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={index === items.length - 1 ? 'page' : undefined}
                className={cn('font-medium', tone === 'light' ? 'text-white' : 'text-navy-800')}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
