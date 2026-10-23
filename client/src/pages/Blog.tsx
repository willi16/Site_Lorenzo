import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Search, TrendingUp } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { POST_CATEGORY_LABELS, formatDate } from '@/lib/format';
import { Button, Container, Section, Card, Input } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { PageHero } from '@/components/sections/PageHero';
import { blogLoader, useLoaderDataOf } from '@/app/loaders';

export default function BlogPage() {
  const { posts, total, popular } = useLoaderDataOf<typeof blogLoader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('categorie') ?? 'ALL';
  const activeQuery = searchParams.get('q') ?? '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { preventScrollReset: true });
  };

  return (
    <>
      <Seo
        title="Actualités & conseils architecture — B.A. Construction Togo"
        description="Conseils construction, budgets réels, réglementation togolaise, tendances architecturales et coulisses de nos chantiers. La lettre du Lundi Bâtisseur."
        canonical="/actualites"
        keywords={[
          'blog architecture Togo',
          'conseils construction Lomé',
          'budget construction maison Togo',
          'réglementation permis de construire Togo',
          'tendances architecturales Afrique',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Actualités', url: '/actualites' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Actualités"
        title="Le-blog du Lundi Bâtisseur"
        description="Ce que nous apprenons sur nos chantiers, ce que nous Conseillons à nos clients, et ce qui change dans la réglementation togolaise."
        breadcrumbs={[{ label: 'Actualités' }]}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
            update('q', value);
          }}
          className="mt-8 flex max-w-md gap-2"
        >
          <Input
            name="q"
            defaultValue={activeQuery}
            placeholder="Rechercher un article…"
            aria-label="Rechercher un article"
            className="h-12 border-white/15 bg-white/10 text-white placeholder:text-white/45 focus:border-clay-400 focus:ring-clay-400/25"
          />
          <Button type="submit" size="md" className="h-12 shrink-0">
            <Search className="h-4 w-4" aria-hidden />
          </Button>
        </form>
      </PageHero>

      <Section spacing="tight">
        <Container>
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              active={activeCategory === 'ALL'}
              onClick={() => update('categorie', 'ALL')}
              label="Tous les sujets"
            />
            {Object.entries(POST_CATEGORY_LABELS).map(([key, label]) => (
              <CategoryChip
                key={key}
                active={activeCategory === key}
                onClick={() => update('categorie', key)}
                label={label}
              />
            ))}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-800/15 bg-white px-6 py-20 text-center">
                  <h2 className="font-display text-lg font-bold text-navy-800">Aucun article trouvé</h2>
                  <p className="mt-2 text-sm text-ink-600">
                    Essayez un autre mot-clé ou une autre catégorie.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSearchParams({})}>
                    Voir tous les articles
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
                    >
                      <Card className="group h-full overflow-hidden">
                        <Link to={`/actualites/${post.slug}`} className="block">
                          <ProjectImage
                            src={post.coverImage}
                            alt={post.title}
                            seed={post.slug}
                            ratio="aspect-[16/10]"
                          />
                        </Link>
                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-ink-400">
                            <span className="rounded-full bg-navy-700/6 px-2.5 py-1 font-semibold text-navy-700">
                              {POST_CATEGORY_LABELS[post.category] ?? post.category}
                            </span>
                            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                          </div>
                          <h2 className="mt-3 font-display text-lg font-bold leading-snug text-navy-800">
                            <Link
                              to={`/actualites/${post.slug}`}
                              className="transition-colors hover:text-clay-600 after:absolute after:inset-0"
                            >
                              {post.title}
                            </Link>
                          </h2>
                          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-600">
                            {post.excerpt}
                          </p>
                          <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {post.readMinutes} min de lecture
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              <p className="mt-8 text-sm text-ink-500">{total} article{total > 1 ? 's' : ''} publié{total > 1 ? 's' : ''}</p>
            </div>

            <aside className="space-y-6">
              {popular.length > 0 ? (
                <Card className="p-6">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy-800">
                    <TrendingUp className="h-4 w-4 text-clay-500" aria-hidden />
                    Articles populaires
                  </h2>
                  <ol className="mt-5 space-y-4">
                    {popular.map((post, index) => (
                      <li key={post.id} className="flex gap-3.5">
                        <span className="font-display text-2xl font-extrabold text-navy-700/15">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <Link
                            to={`/actualites/${post.slug}`}
                            className="text-sm font-semibold leading-snug text-navy-800 transition hover:text-clay-600"
                          >
                            {post.title}
                          </Link>
                          <p className="mt-1 text-xs text-ink-400">{post.readMinutes} min</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              ) : null}

              <div className="rounded-2xl bg-navy-800 p-6 text-white">
                <h2 className="font-display text-base font-bold">La lettre du Lundi</h2>
                <p className="mt-2 text-sm text-white/65">
                  Un e-mail par mois, sans spam. Nos projets, nos prix réels, nos conseils.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-400 transition hover:gap-2.5"
                >
                  S’inscrire
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-navy-700 text-white'
          : 'border border-ink-800/10 bg-white text-ink-600 hover:border-navy-700/30 hover:text-navy-800'
      }`}
    >
      {label}
    </button>
  );
}
