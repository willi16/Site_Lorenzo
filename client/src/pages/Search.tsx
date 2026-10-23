import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, FolderKanban, Search as SearchIcon, Sparkles } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema, websiteSchema } from '@/lib/seo';
import { formatDateShort } from '@/lib/format';
import { Button, ButtonLink, Container, Section, Card, Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { searchLoader, useLoaderDataOf } from '@/app/loaders';

export default function SearchPage() {
  const { q, projects, posts, services } = useLoaderDataOf<typeof searchLoader>();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(q);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTerm(q);
  }, [q]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (term.trim()) next.set('q', term.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const total = projects.length + posts.length + services.length;

  return (
    <>
      <Seo
        title={q ? `Recherche « ${q} » — B.A. Construction` : 'Recherche — B.A. Construction Togo'}
        description="Cherchez parmi nos réalisations, nos prestations et nos publications : architecture, construction, rénovation et tendances architecturales au Togo."
        canonical="/rechercher"
        noindex={!q}
        jsonLd={[
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Recherche', url: '/rechercher' },
          ]),
        ]}
      />

      <section className="bg-navy-800 py-16 sm:py-20">
        <Container>
          <p className="text-xs font-bold uppercase tracking-widest2 text-clay-400">Recherche</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
            Que recherchez-vous ?
          </h1>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                aria-hidden
              />
              <input
                ref={inputRef}
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Ex. villa, rénovation, béton, devis…"
                aria-label="Terme de recherche"
                className="w-full rounded-xl border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-base text-white placeholder:text-white/40 outline-none transition focus:border-clay-400 focus:bg-white/15"
              />
            </div>
            <Button type="submit" size="lg" variant="primary" className="shrink-0">
              Rechercher
            </Button>
          </form>

          {q ? (
            <p className="mt-5 text-sm text-white/60">
              {total} résultat{total > 1 ? 's' : ''} pour « {q} »
            </p>
          ) : null}
        </Container>
      </section>

      <Section spacing="tight">
        <Container size="wide">
          <AnimatePresence mode="wait">
            {!q ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-ink-800/15 bg-white px-8 py-16 text-center"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700/6 text-navy-700">
                  <Sparkles className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="mt-5 font-display text-xl font-bold text-navy-800">
                  Un mot-clé suffit
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
                  Tapez un mot-clé pour retrouver une réalisation, une prestation ou un conseil
                  publié par notre cabinet.
                </p>
              </motion.div>
            ) : total === 0 ? (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-dashed border-ink-800/15 bg-white px-8 py-16 text-center"
              >
                <h2 className="font-display text-xl font-bold text-navy-800">
                  Aucun résultat pour « {q} »
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
                  Essayez un terme plus général, ou écrivez-nous directement : nous répondons à
                  toutes les demandes, même celles qui ne figurent pas encore en ligne.
                </p>
                <ButtonLink to="/contact" className="mt-6">
                  Nous écrire
                </ButtonLink>
              </motion.div>
            ) : (
              <motion.div
                key={`results-${q}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-14"
              >
                {services.length > 0 ? (
                  <section>
                    <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-800">
                      <Sparkles className="h-5 w-5 text-clay-500" aria-hidden />
                      Prestations ({services.length})
                    </h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {services.map((service) => (
                        <Card key={service.id} className="p-6 transition hover:shadow-lift">
                          <Badge tone="olive">{service.eyebrow ?? 'Prestation'}</Badge>
                          <h3 className="mt-3 font-display text-base font-bold text-navy-800">
                            <a href={`/services/${service.slug}`} className="hover:text-clay-600">
                              {service.title}
                            </a>
                          </h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
                            {service.excerpt}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </section>
                ) : null}

                {projects.length > 0 ? (
                  <section>
                    <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-800">
                      <FolderKanban className="h-5 w-5 text-clay-500" aria-hidden />
                      Réalisations ({projects.length})
                    </h2>
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <a
                          key={project.id}
                          href={`/realisations/${project.slug}`}
                          className="group overflow-hidden rounded-2xl border border-ink-800/[0.07] bg-white shadow-soft transition hover:shadow-lift"
                        >
                          <ProjectImage
                            src={project.coverImage}
                            alt={project.title}
                            seed={project.slug}
                            ratio="aspect-[16/10]"
                          />
                          <div className="p-5">
                            <h3 className="font-display text-base font-bold text-navy-800 group-hover:text-clay-600">
                              {project.title}
                            </h3>
                            <p className="mt-1.5 text-xs text-ink-500">
                              {project.location} · {project.year}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}

                {posts.length > 0 ? (
                  <section>
                    <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-800">
                      <FileText className="h-5 w-5 text-clay-500" aria-hidden />
                      Publications ({posts.length})
                    </h2>
                    <div className="mt-5 space-y-3">
                      {posts.map((post) => (
                        <a
                          key={post.id}
                          href={`/actualites/${post.slug}`}
                          className="flex items-start justify-between gap-4 rounded-xl border border-ink-800/[0.07] bg-white px-5 py-4 transition hover:border-navy-700/25 hover:shadow-soft"
                        >
                          <span>
                            <span className="block font-display text-sm font-bold text-navy-800">
                              {post.title}
                            </span>
                            <span className="mt-1 block text-xs text-ink-500">
                              {post.category} · {formatDateShort(post.publishedAt)} ·{' '}
                              {post.readMinutes} min de lecture
                            </span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Section>
    </>
  );
}
