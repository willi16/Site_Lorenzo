import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Check, Download, Scale, X } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { CATEGORY_LABELS, STATUS_LABELS, formatArea, formatFcfa } from '@/lib/format';
import { Button, ButtonLink, Container, Section, SectionHeading } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { PageHero } from '@/components/sections/PageHero';
import { compareLoader, useLoaderDataOf } from '@/app/loaders';

const MAX_COMPARE = 4;

export default function ComparePage() {
  const { projects } = useLoaderDataOf<typeof compareLoader>();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) => {
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((s) => s !== slug);
      if (current.length >= MAX_COMPARE) return current;
      return [...current, slug];
    });
  };

  const compared = useMemo(
    () => projects.filter((p) => selected.includes(p.slug)),
    [projects, selected],
  );

  const rows: { label: string; render: (slug: string) => React.ReactNode }[] = [
    { label: 'Type de projet', render: (slug) => CATEGORY_LABELS[projects.find((p) => p.slug === slug)?.category ?? ''] },
    { label: 'Statut', render: (slug) => STATUS_LABELS[projects.find((p) => p.slug === slug)?.status ?? ''] },
    { label: 'Localisation', render: (slug) => projects.find((p) => p.slug === slug)?.location },
    { label: 'Superficie', render: (slug) => formatArea(projects.find((p) => p.slug === slug)?.area ?? 0) },
    { label: 'Budget', render: (slug) => projects.find((p) => p.slug === slug)?.budgetLabel ?? formatFcfa(projects.find((p) => p.slug === slug)?.budget) },
    { label: 'Livraison', render: (slug) => String(projects.find((p) => p.slug === slug)?.year ?? '') },
    {
      label: 'Prestations',
      render: (slug) => {
        const project = projects.find((p) => p.slug === slug);
        return (
          <ul className="space-y-1.5">
            {(project?.features ?? []).slice(0, 5).map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-xs text-ink-600">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-olive-600" aria-hidden />
                {feature}
              </li>
            ))}
          </ul>
        );
      },
    },
    {
      label: 'Matériaux',
      render: (slug) => {
        const project = projects.find((p) => p.slug === slug);
        return (
          <div className="flex flex-wrap gap-1.5">
            {(project?.materials ?? []).slice(0, 6).map((material) => (
              <span
                key={material}
                className="rounded-full bg-navy-700/6 px-2 py-0.5 text-[0.7rem] font-medium text-navy-700"
              >
                {material}
              </span>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Seo
        title="Comparateur de projets — B.A. Construction Togo"
        description="Comparez côte à côte nos réalisations : surfaces, budgets, matériaux, prestations et délais. Aide à la décision pour votre prochain projet."
        canonical="/comparateur"
        keywords={[
          'comparateur projets architecture',
          'comparaison budget construction Togo',
          'choisir architecte Lomé',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Comparateur', url: '/comparateur' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Outil de décision"
        title="Comparez nos réalisations"
        description="Sélectionnez jusqu’à quatre projets et comparez surfaces, budgets, matériaux et prestations en un coup d’œil."
        breadcrumbs={[{ label: 'Comparateur' }]}
      />

      <Section spacing="tight">
        <Container size="wide">
          {compared.length === 0 ? (
            <>
              <SectionHeading
                eyebrow="Sélection"
                title="Choisissez les projets à comparer"
                description={`Vous pouvez enchaîner jusqu’à ${MAX_COMPARE} projets.`}
              />
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const active = selected.includes(project.slug);
                  return (
                    <motion.button
                      key={project.id}
                      type="button"
                      onClick={() => toggle(project.slug)}
                      aria-pressed={active}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className={`group relative overflow-hidden rounded-2xl border text-left transition ${
                        active
                          ? 'border-clay-500 shadow-lift'
                          : 'border-ink-800/[0.07] bg-white shadow-soft hover:shadow-lift'
                      }`}
                    >
                      <ProjectImage
                        src={project.coverImage}
                        alt={project.title}
                        seed={project.slug}
                        ratio="aspect-[16/10]"
                      />
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-bold text-navy-800">
                            {project.title}
                          </h3>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              active ? 'border-clay-500 bg-clay-500 text-white' : 'border-ink-800/20'
                            }`}
                            aria-hidden
                          >
                            {active ? <Check className="h-3.5 w-3.5" /> : null}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-ink-500">
                          {project.location} · {formatArea(project.area)} · {project.year}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <SectionHeading
                  eyebrow="Comparaison"
                  title={`${compared.length} projet${compared.length > 1 ? 's' : ''} comparé${compared.length > 1 ? 's' : ''}`}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.print()}>
                    <Download className="h-4 w-4" aria-hidden />
                    Exporter en PDF
                  </Button>
                  <Button variant="ghost" onClick={() => setSelected([])}>
                    <X className="h-4 w-4" aria-hidden />
                    Tout retirer
                  </Button>
                </div>
              </div>

              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-0">
                  <caption className="sr-only">
                    Comparaison détaillée des projets sélectionnés
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className="w-44 border-b border-ink-800/10 p-3 text-left align-top">
                        <span className="text-xs font-bold uppercase tracking-widest2 text-ink-400">
                          Critère
                        </span>
                      </th>
                      {compared.map((project) => (
                        <th
                          key={project.id}
                          scope="col"
                          className="border-b border-ink-800/10 p-3 text-left align-top"
                        >
                          <span className="block font-display text-base font-bold text-navy-800">
                            {project.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggle(project.slug)}
                            className="mt-1.5 text-xs font-semibold text-clay-600 hover:underline"
                          >
                            Retirer
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.label} className={index % 2 === 0 ? 'bg-ink-800/[0.02]' : ''}>
                        <th scope="row" className="p-3 text-left align-top">
                          <span className="text-sm font-semibold text-ink-700">{row.label}</span>
                        </th>
                        {compared.map((project) => (
                          <td key={project.id} className="p-3 align-top text-sm text-ink-600">
                            {row.render(project.slug)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th scope="row" className="p-3 text-left align-top">
                        <span className="text-sm font-semibold text-ink-700">Fiche complète</span>
                      </th>
                      {compared.map((project) => (
                        <td key={project.id} className="p-3 align-top">
                          <ButtonLink to={`/realisations/${project.slug}`} size="sm" variant="outline">
                            Voir
                          </ButtonLink>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-14 rounded-2xl border border-ink-800/[0.07] bg-cream-100/60 p-8 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
              <Scale className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-navy-800">
              Et si votre projet n’est pas encore construit&nbsp;?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-ink-600">
              Nous construisons des projets sur mesure. Décrivez-nous le vôtre et nous vous
              proposerons un programme comparable, chiffré et réaliste.
            </p>
            <ButtonLink to="/contact" className="mt-6" iconRight={<Scale className="h-4 w-4" aria-hidden />}>
              Demander une étude personnalisée
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
