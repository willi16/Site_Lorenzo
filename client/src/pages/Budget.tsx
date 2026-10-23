import { useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Info, RotateCcw, Sparkles, TrendingUp } from 'lucide-react';
import { Seo, breadcrumbSchema, faqSchema, organizationSchema } from '@/lib/seo';
import { ensureCsrfToken, getCsrfToken, type BudgetEstimate } from '@/lib/data';
import { formatNumber } from '@/lib/format';
import { Button, ButtonLink, Container, Section, SectionHeading, Card, Input, Select } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { budgetLoader, useLoaderDataOf } from '@/app/loaders';

const FAQ = [
  {
    question: 'Comment est calculé le montant affiché ?',
    answer:
      'Nous partons d’un prix moyen au m² par type de projet, ajusté par le niveau de finition choisi et par les options sélectionnées. Nous ajoutons ensuite les frais d’études et de maîtrise d’œuvre (8 à 12 %). Le résultat est une fourchette, pas un devis.',
  },
  {
    question: 'Pourquoi une fourchette et pas un prix unique ?',
    answer:
      'Parce qu’avant la visite du terrain et la lecture des plans, le coût exact dépend de variables que nous ne pouvons pas deviner : état du sol, accès du chantier, réseaux disponibles, choix de finition réels. Une fourchette honnête vaut mieux qu’un faux chiffre précis.',
  },
  {
    question: 'Le calcul inclut-il la taxe foncière et les frais de permis ?',
    answer:
      'Non. Les frais administratifs (permis de construire, taxe foncière, étude de sol, raccordements) sont listés séparément dans le devis, car ils dépendent de votre commune et de votre situation.',
  },
  {
    question: 'Comment obtenir un devis ferme ?',
    answer:
      'Demandez un rendez-vous : nous visitons le site, analysons les plans, puis nous remettons un devis détaillé par lots, avec trois variantes de finition. Ce devis est gratuit et sans engagement.',
  },
];

export default function BudgetPage() {
  const { tariffs } = useLoaderDataOf<typeof budgetLoader>();
  const [projectType, setProjectType] = useState('RESIDENTIAL');
  const [area, setArea] = useState('150');
  const [finish, setFinish] = useState('STANDARD');
  const [selected, setSelected] = useState<string[]>(['ARCHITECT']);
  const [includeFees, setIncludeFees] = useState(true);
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentTariff = useMemo(
    () => tariffs.tariffs.find((t) => t.key === projectType),
    [tariffs, projectType],
  );

  const toggle = (key: string) => {
    setSelected((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
    setEstimate(null);
  };

  const compute = async () => {
    setError('');
    const parsedArea = Number(area);
    if (!Number.isFinite(parsedArea) || parsedArea < 10) {
      setError('Indiquez une surface d’au moins 10 m².');
      return;
    }
    setLoading(true);
    try {
      await ensureCsrfToken();
      const res = await fetch('/api/budget/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getCsrfToken() ? { 'X-CSRF-Token': getCsrfToken() } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          projectType,
          area: parsedArea,
          finish,
          options: selected,
          includeFees,
          csrfToken: getCsrfToken(),
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error?.message ?? 'Calcul impossible');
      setEstimate(payload.data as BudgetEstimate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calcul impossible. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setProjectType('RESIDENTIAL');
    setArea('150');
    setFinish('STANDARD');
    setSelected(['ARCHITECT']);
    setIncludeFees(true);
    setEstimate(null);
    setError('');
  };

  return (
    <>
      <Seo
        title="Calculateur de budget construction — Estimation en ligne | B.A. Construction Togo"
        description="Estimez en 30 secondes le budget de votre projet de construction au Togo : prix au m², niveau de finition, options. Fourchette indicative en FCFA, sans engagement."
        canonical="/budget"
        keywords={[
          'calculateur budget construction Togo',
          'prix m2 construction Lomé',
          'estimation coût maison Togo',
          'prix construction Togo FCFA',
          'devis maison individuelle Lomé',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Calculateur de budget', url: '/budget' },
          ]),
          faqSchema(FAQ.map((item) => ({ question: item.question, answer: item.answer }))),
        ]}
      />

      <PageHero
        eyebrow="Outil gratuit"
        title="Combien coûte votre projet ?"
        description="Une estimation immédiate, basée sur nos prix réels de 2026 au Togo. Aucune donnée envoyée, aucun compte à créer."
        breadcrumbs={[{ label: 'Calculateur de budget' }]}
      />

      <Section spacing="tight">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            {/* ─────────────────────────── FORMULAIRE ─────────────────────── */}
            <Card className="p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                  <Calculator className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="font-display text-xl font-extrabold text-navy-800">
                  Paramètres du projet
                </h2>
              </div>

              <div className="mt-7 space-y-6">
                <Select
                  label="Type de projet"
                  value={projectType}
                  onChange={(e) => {
                    setProjectType(e.target.value);
                    setEstimate(null);
                  }}
                  options={tariffs.tariffs.map((t) => ({ value: t.key, label: t.label }))}
                />

                <Input
                  label="Superficie à construire (m²)"
                  type="number"
                  min={10}
                  max={20000}
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    setEstimate(null);
                  }}
                  hint={
                    currentTariff
                      ? `Tarif indicatif : ${formatNumber(currentTariff.min)} – ${formatNumber(currentTariff.max)} FCFA/m²`
                      : undefined
                  }
                />

                <div>
                  <p className="text-sm font-semibold text-ink-800">Niveau de finition</p>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                    {tariffs.finishes.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          setFinish(option.key);
                          setEstimate(null);
                        }}
                        aria-pressed={finish === option.key}
                        className={`rounded-xl border p-4 text-left transition ${
                          finish === option.key
                            ? 'border-navy-700 bg-navy-700/5 shadow-soft'
                            : 'border-ink-800/10 hover:border-navy-700/30'
                        }`}
                      >
                        <span className="block text-sm font-bold text-navy-800">{option.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                          {option.note}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-ink-800">Options et prestations</p>
                  <p className="mt-1 text-xs text-ink-500">Sélectionnez tout ce dont vous avez besoin.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {tariffs.options.map((option) => {
                      const active = selected.includes(option.key);
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => toggle(option.key)}
                          aria-pressed={active}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            active
                              ? 'border-clay-500 bg-clay-500/[0.06]'
                              : 'border-ink-800/10 hover:border-navy-700/30'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${
                              active ? 'border-clay-500 bg-clay-500 text-white' : 'border-ink-800/20'
                            }`}
                            aria-hidden
                          >
                            {active ? <span className="text-[0.6rem] font-bold">✓</span> : null}
                          </span>
                          <span className="text-sm font-medium text-ink-700">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-cream-100/60 p-4">
                  <input
                    type="checkbox"
                    checked={includeFees}
                    onChange={(e) => {
                      setIncludeFees(e.target.checked);
                      setEstimate(null);
                    }}
                    className="mt-0.5 h-5 w-5 accent-clay-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-800">
                      Inclure les frais d’études et de maîtrise d’œuvre
                    </span>
                    <span className="block text-xs text-ink-500">
                      Conception, plans, permis et suivi de chantier (8 à 12 % du montant travaux).
                    </span>
                  </span>
                </label>
              </div>

              {error ? (
                <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" loading={loading} onClick={compute} icon={<Sparkles className="h-4 w-4" aria-hidden />}>
                  Calculer mon budget
                </Button>
                <Button size="lg" variant="ghost" onClick={reset} icon={<RotateCcw className="h-4 w-4" aria-hidden />}>
                  Réinitialiser
                </Button>
              </div>
            </Card>

            {/* ──────────────────────────── RÉSULTAT ─────────────────────── */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              {estimate ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="overflow-hidden rounded-2xl bg-navy-800 text-white shadow-lift">
                    <div className="p-7 sm:p-8">
                      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest2 text-clay-400">
                        <TrendingUp className="h-4 w-4" aria-hidden />
                        Fourchette estimée
                      </p>
                      <p className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                        {estimate.estimate.minFormatted}
                        <span className="mx-2 text-white/30">—</span>
                        {estimate.estimate.maxFormatted}
                      </p>
                      <p className="mt-3 text-sm text-white/60">
                        Soit en moyenne{' '}
                        <strong className="text-white">
                          {estimate.estimate.perSquareMeterFormatted}/m²
                        </strong>{' '}
                        pour {estimate.area} m²
                      </p>

                      <dl className="mt-7 space-y-3 border-t border-white/12 pt-5 text-sm">
                        <div className="flex justify-between gap-4">
                          <dt className="text-white/55">Type de projet</dt>
                          <dd className="font-semibold">{estimate.projectTypeLabel}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-white/55">Niveau de finition</dt>
                          <dd className="font-semibold">{estimate.finishLabel}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-white/55">Options retenues</dt>
                          <dd className="font-semibold">{estimate.options.length}</dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-white/55">Délai indicatif</dt>
                          <dd className="font-semibold">{estimate.leadTime}</dd>
                        </div>
                      </dl>

                      {estimate.options.length > 0 ? (
                        <div className="mt-6 border-t border-white/12 pt-5">
                          <p className="text-xs font-bold uppercase tracking-widest2 text-white/40">
                            Détail des options
                          </p>
                          <ul className="mt-3 space-y-2 text-sm">
                            {estimate.options.map((option) => (
                              <li key={option.label} className="flex justify-between gap-4">
                                <span className="text-white/65">{option.label}</span>
                                <span className="font-medium">≈ {formatNumber(option.amount)} F</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <div className="bg-clay-500 p-7 sm:p-8">
                      <h3 className="font-display text-lg font-extrabold text-white">
                        Voulez-vous un devis ferme&nbsp;?
                      </h3>
                      <p className="mt-2 text-sm text-white/85">
                        Visite technique gratuite et devis détaillé par lots sous 48 heures.
                      </p>
                      <ButtonLink
                        to="/contact"
                        variant="light"
                        size="lg"
                        fullWidth
                        className="mt-5"
                        iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                      >
                        Demander mon devis
                      </ButtonLink>
                    </div>
                  </div>

                  <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-500">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {estimate.disclaimer}
                  </p>
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-dashed border-ink-800/15 bg-white px-8 py-16 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-700/6 text-navy-700">
                    <Calculator className="h-6 w-6" aria-hidden />
                  </span>
                  <h2 className="mt-5 font-display text-lg font-bold text-navy-800">
                    Votre estimation apparaîtra ici
                  </h2>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-600">
                    Renseignez le type de projet, la surface et le niveau de finition, puis lancez le
                    calcul.
                  </p>
                  <ul className="mt-7 space-y-2 text-left text-sm text-ink-600">
                    {[
                      'Prix réels constatés en 2026',
                      'Options chiffrées une par une',
                      'Délai de chantier estimé',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-clay-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="cream">
        <Container>
          <SectionHeading
            eyebrow="Transparence"
            title="Comment nous calculons"
            description="Nous préférons expliquer la méthode : c’est la meilleure façon d’éviter les mauvaises surprises en cours de projet."
            align="center"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {FAQ.map((item) => (
              <Card key={item.question} className="p-6">
                <h3 className="font-display text-base font-bold text-navy-800">{item.question}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{item.answer}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
