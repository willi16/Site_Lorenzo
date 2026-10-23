import { Container } from '@/components/ui/primitives';
import { Breadcrumbs, type Crumb } from '@/components/seo/Breadcrumbs';
import { motion } from 'framer-motion';

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
  compact,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  children?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-navy-800 text-white ${
        compact ? 'pb-12 pt-32 sm:pb-14 sm:pt-36' : 'pb-16 pt-32 sm:pb-20 sm:pt-40'
      }`}
    >
      <div className="absolute inset-0 bg-grid-fine bg-grid opacity-[0.08]" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-clay-500/10 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

      <Container size="wide" className="relative">
        {breadcrumbs ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-7"
          >
            <Breadcrumbs items={breadcrumbs} tone="light" />
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 text-clay-300">
              <span className="h-px w-8 bg-clay-300/60" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-[1.1] tracking-tight [text-shadow:0_1px_16px_rgba(4,12,20,0.5)] sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {description}
            </p>
          ) : null}
          {children}
        </motion.div>
      </Container>
    </section>
  );
}
