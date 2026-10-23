import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { CATEGORY_LABELS, formatFcfa } from '@/lib/format';
import { Button, ButtonLink, Container, Section, Select } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { PageHero } from '@/components/sections/PageHero';
import { projectsLoader, useLoaderDataOf } from '@/app/loaders';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'area-desc', label: 'Superficie décroissante' },
  { value: 'area-asc', label: 'Superficie croissante' },
  { value: 'budget-desc', label: 'Budget décroissant' },
  { value: 'budget-asc', label: 'Budget croissant' },
  { value: 'title', label: 'Ordre alphabétique' },
];

export default function ProjectsPage() {
  const { projects, total, facets } = useLoaderDataOf<typeof projectsLoader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') ?? 'ALL';
  const activeLocation = searchParams.get('location') ?? '';
  const activeYear = searchParams.get('year') ?? '';
  const activeSort = searchParams.get('sort') ?? 'recent';
  const activeQuery = searchParams.get('q') ?? '';

  const hasFilters =
    activeCategory !== 'ALL' ||
    activeLocation !== '' ||
    activeYear !== '' ||
    activeQuery !== '';

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'ALL') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { preventScrollReset: true });
  };

  const reset = () => {
    const next = new URLSearchParams();
    if (activeSort !== 'recent') next.set('sort', activeSort);
    setSearchParams(next, { preventScrollReset: true });
  };

  const budgetOptions = useMemo(() => {
    const { max } = facets.budgetRange;
    if (!max) return [];
    const steps = [max * 0.25, max * 0.5, max * 0.75, max];
    return steps.map((value) => ({
      value: String(Math.round(value)),
      label: `Jusqu’à ${formatFcfa(Math.round(value))}`,
    }));
  }, [facets.budgetRange]);

  return (
    <>
      <Seo
        title="Nos réalisations — Portfolio de projets livrés au Togo"
        description="Découvrez nos réalisations : maisons individuelles, immeubles, bâtiments commerciaux, rénovations et aménagements au Togo. Photos, budgets, superficies et détails techniques."
        canonical="/realisations"
        keywords={[
          'portfolio architecte Togo',
          'projets construction Lomé',
          'maison moderne Togo',
          'immeuble résidentiel Lomé',
          'rénovation Togo avant après',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Réalisations', url: '/realisations' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Portfolio"
        title="Nos réalisations, dossier par dossier"
        description="Chaque projet est documenté : le terrain, la contrainte, la solution retenue, les matériaux et le budget. Pas de photos de banque d’images."
        breadcrumbs={[{ label: 'Réalisations' }]}
      />

      <Section spacing="tight">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
            {/* ──────────────────────────── Filtres ─────────────────────── */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-ink-800/[0.07] bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-base font-bold text-navy-800">
                    <SlidersHorizontal className="h-4 w-4 text-clay-500" aria-hidden />
                    Filtres
                  </h2>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-clay-600 transition hover:text-clay-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Réinitialiser
                    </button>
                  ) : null}
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="filter-category"
                      className="text-xs font-bold uppercase tracking-widest2 text-ink-400"
                    >
                      Type de projet
                    </label>
                    <div className="mt-2.5 space-y-1">
                      <FilterButton
                        active={activeCategory === 'ALL'}
                        onClick={() => update('category', 'ALL')}
                        label="Tous les types"
                        count={facets.categories.reduce((sum, c) => sum + c.count, 0)}
                      />
                      {facets.categories.map((item) => (
                        <FilterButton
                          key={item.category}
                          active={activeCategory === item.category}
                          onClick={() => update('category', item.category)}
                          label={CATEGORY_LABELS[item.category] ?? item.category}
                          count={item.count}
                        />
                      ))}
                    </div>
                  </div>

                  <Select
                    label="Localisation"
                    value={activeLocation}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="Toutes les localisations"
                    options={facets.locations.map((location) => ({ value: location, label: location }))}
                  />

                  <Select
                    label="Année"
                    value={activeYear}
                    onChange={(e) => update('year', e.target.value)}
                    placeholder="Toutes les années"
                    options={facets.years.map((year) => ({ value: String(year), label: String(year) }))}
                  />

                  {budgetOptions.length > 0 ? (
                    <Select
                      label="Budget maximum"
                      value={searchParams.get('maxBudget') ?? ''}
                      onChange={(e) => update('maxBudget', e.target.value)}
                      placeholder="Tous les budgets"
                      options={budgetOptions}
                    />
                  ) : null}

                  <Select
                    label="Trier par"
                    value={activeSort}
                    onChange={(e) => update('sort', e.target.value)}
                    options={SORT_OPTIONS}
                  />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-navy-800 p-6 text-white">
                <h3 className="font-display text-base font-bold">Votre projet ici ?</h3>
                <p className="mt-1.5 text-sm text-white/65">
                  Envoyez-nous vos plans ou une simple description.
                </p>
                <ButtonLink to="/contact" variant="light" size="sm" className="mt-4" fullWidth>
                  Demander un devis
                </ButtonLink>
              </div>
            </aside>

            {/* ──────────────────────────── Résultats ────────────────────── */}
            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-600">
                  <strong className="font-semibold text-navy-800">{total}</strong> projet
                  {total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                  {activeQuery ? (
                    <>
                      {' '}
                      pour « <span className="font-semibold">{activeQuery}</span> »
                    </>
                  ) : null}
                </p>
                {hasFilters ? (
                  <div className="flex flex-wrap gap-2">
                    {activeCategory !== 'ALL' ? (
                      <ActiveChip
                        label={CATEGORY_LABELS[activeCategory] ?? activeCategory}
                        onRemove={() => update('category', 'ALL')}
                      />
                    ) : null}
                    {activeLocation ? (
                      <ActiveChip label={activeLocation} onRemove={() => update('location', '')} />
                    ) : null}
                    {activeYear ? (
                      <ActiveChip label={activeYear} onRemove={() => update('year', '')} />
                    ) : null}
                    {activeQuery ? (
                      <ActiveChip label={activeQuery} onRemove={() => update('q', '')} />
                    ) : null}
                  </div>
                ) : null}
              </div>

              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink-800/15 bg-white px-6 py-20 text-center">
                  <LayoutGrid className="mx-auto h-10 w-10 text-ink-400/50" aria-hidden />
                  <h2 className="mt-4 font-display text-lg font-bold text-navy-800">
                    Aucun projet ne correspond à ces critères
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-ink-600">
                    Élargissez vos filtres ou décrivez-nous votre projet : il apparaîtra dans le
                    portfolio dès sa livraison.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={reset}>
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
                    >
                      <ProjectCard project={project} />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="mt-12 rounded-2xl border border-ink-800/[0.07] bg-cream-100/60 p-7 text-center">
                <h2 className="font-display text-lg font-bold text-navy-800">
                  Vous comparez plusieurs projets&nbsp;?
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
                  Notre comparateur affiche côte à côte surfaces, budgets, matériaux et délais.
                </p>
                <ButtonLink to="/comparateur" variant="secondary" className="mt-5">
                  Ouvrir le comparateur
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
        active ? 'bg-navy-700 text-white' : 'text-ink-600 hover:bg-navy-700/[0.05] hover:text-navy-800'
      }`}
    >
      <span>{label}</span>
      {count !== undefined ? (
        <span
          className={`text-xs ${active ? 'text-white/60' : 'text-ink-400'}`}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-700/8 px-3 py-1 text-xs font-semibold text-navy-700">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Retirer le filtre ${label}`}>
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}
