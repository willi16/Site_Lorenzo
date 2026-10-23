import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Maximize } from 'lucide-react';
import type { ProjectDTO } from '@/lib/data';
import { CATEGORY_LABELS, STATUS_LABELS, formatArea } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';

export function ProjectCard({
  project,
  className,
  compact,
  priority,
}: {
  project: ProjectDTO;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-800/[0.07] bg-white shadow-soft transition-all duration-400 ease-fluid hover:-translate-y-1 hover:shadow-lift',
        className,
      )}
    >
      <Link
        to={`/realisations/${project.slug}`}
        className="relative block overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <ProjectImage
          src={project.coverImage}
          alt={project.title}
          seed={project.slug}
          ratio={compact ? 'aspect-[16/10]' : 'aspect-[4/3]'}
          priority={priority}
          className="transition-transform duration-[900ms] ease-fluid group-hover:scale-[1.04]"
        >
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
            <Badge tone="light" className="backdrop-blur-sm">
              {CATEGORY_LABELS[project.category] ?? project.category}
            </Badge>
            {project.status !== 'COMPLETED' ? (
              <Badge tone="clay" className="backdrop-blur-sm">
                {STATUS_LABELS[project.status]}
              </Badge>
            ) : null}
          </div>
        </ProjectImage>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold leading-snug text-navy-800">
            <Link
              to={`/realisations/${project.slug}`}
              className="transition-colors after:absolute after:inset-0 hover:text-clay-600"
            >
              {project.title}
            </Link>
          </h3>
          <ArrowUpRight
            className="mt-0.5 h-5 w-5 shrink-0 text-ink-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-clay-500"
            aria-hidden
          />
        </div>

        {project.subtitle ? (
          <p className="mt-1.5 text-sm font-medium text-ink-500">{project.subtitle}</p>
        ) : null}

        {!compact ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-600">{project.excerpt}</p>
        ) : null}

        <dl className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1.5 pt-5 text-xs font-medium text-ink-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-clay-500" aria-hidden />
            <dt className="sr-only">Localisation</dt>
            <dd>{project.location}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="h-3.5 w-3.5 text-clay-500" aria-hidden />
            <dt className="sr-only">Superficie</dt>
            <dd>{formatArea(project.area)}</dd>
          </div>
          <div className="ml-auto text-ink-400">{project.year}</div>
        </dl>
      </div>
    </article>
  );
}
