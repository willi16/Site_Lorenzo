
import { motion } from 'framer-motion';
import { ArrowRight, Box, Check, Clock, Layers, PenTool, Ruler } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema, faqSchema } from '@/lib/seo';
import { resolveIcon } from '@/lib/icons';
import { ButtonLink, Container, Section, SectionHeading, Card, Badge } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';
import { Accordion } from '@/components/ui/Accordion';
import { methodologyLoader, useLoaderDataOf } from '@/app/loaders';

const TOOLS = [
  {
    icon: Layers,
    title: 'BIM (Building Information Modeling)',
    text: 'Nos maquettes numériques portent les quantités, les métrés et la détection des conflits. Le client sait ce qu’il paie, et nos équipes ne découvrent pas une erreur en pleine coulée.',
  },
  {
    icon: Box,
    title: 'Rendus 3D photoréalistes',
    text: 'Avant le premier coup de pelle, vous voyez votre projet. Les arbitrages se font sur une image, pas sur un plan technique.',
  },
  {
    icon: PenTool,
    title: 'Croquis et esquisses',
    text: 'Chaque projet démarre par trois pistes de conception. On choisit celle qui raconte le mieux votre usage, pas celle qui impressionne le plus.',
  },
  {
    icon: Ruler,
    title: 'Bureau d’études structure & fluides',
    text: 'Structure, électricité, plomberie, CVC : nos partenaires bureaux d’études sont intégrés dès l’avant-projet pour éviter les reprises coûteuses.',
  },
];

const COMMITMENTS = [
  { title: 'Respect des délais', text: 'Le planning annoncé est le planning tenu. En cas d’aléa, vous êtes informé la veille, pas le jour de la mauvaise surprise.' },
  { title: 'Transparence des coûts', text: 'Un devis décomposé par lots, des avenants chiffrés et validés avant exécution, aucun supplément caché.' },
  { title: 'Qualité des prestations', text: 'Contrôles sur chaque poste clé : ferraillage, étanchéité, réseaux, finitions. Un rapport photo vous est transmis.' },
  { title: 'Suivi personnalisé', text: 'Un architecte référent, joignable, qui connaît votre dossier. Vous ne racontez pas votre projet à chaque interlocuteur.' },
];

export default function MethodologyPage() {
  const { steps, services, stats, posts } = useLoaderDataOf<typeof methodologyLoader>();

  const faq = [
    {
      question: 'Combien de temps prend une maison individuelle de 150 m² ?',
      answer:
        'Comptez 4 à 7 mois de chantier, hors délai d’instruction du permis de construire (1 à 3 mois selon la commune). Les esquisses et l’avant-projet prennent 4 à 6 semaines.',
    },
    {
      question: 'Que se passe-t-il si je n’ai pas de plans ?',
      answer:
        'C’est le cas le plus fréquent. Nous réalisons une étude de faisabilité à partir d’un relevé de terrain et de vos usages, puis nous dessinons trois esquisses que vous choisissez.',
    },
    {
      question: 'Pouvez-vous construire avec un budget serré ?',
      answer:
        'Oui. Nous adaptons les choix de matériaux et de finitions pour tenir l’enveloppe, en vous signalant clairement les postes où l’on peut faire des gains et ceux où ce n’est pas possible.',
    },
    {
      question: 'Qui est responsable de la conformité du permis ?',
      answer:
        'Nous produisons l’ensemble des pièces du dossier de permis et coordonnons l’instruction. En cas de refus ou de prescriptions, nous ajustons le projet et déposons la demande complémentaire.',
    },
  ];

  return (
    <>
      <Seo
        title="Notre méthodologie — Du premier contact à la réception de votre chantier"
        description="Un process en 7 étapes, du premier contact à la réception : esquisses, plans, permis de construire, choix des entreprises et suivi de chantier."
        canonical="/methodologie"
        keywords={[
          'méthodologie architecte Togo',
          'processus construction maison',
          'suivi de chantier Lomé',
          'permis de construire Togo',
          'rendu 3D architecture Togo',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Méthodologie', url: '/methodologie' },
          ]),
          faqSchema(faq.map((item) => ({ question: item.question, answer: item.answer }))),
        ]}
      />

      <PageHero
        eyebrow="Méthodologie"
        title="Sept étapes, jamais dans le brouillard"
        description="Vous savez à quelle étape se trouve votre projet, ce que nous produisons, ce que nous attendons de vous et quand tombe la prochaine échéance. C’est ainsi qu’on tient un planning."
        breadcrumbs={[{ label: 'Méthodologie' }]}
      />

      {/* ──────────────────────────── ÉTAPES ─────────────────────────────── */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Processus de travail"
            title="Les sept étapes, de l’écoute à la remise des clés"
            description="Chaque étape se clôt par une validation explicite. Vous ne payez jamais une étape dont le rendu ne vous convient pas."
          />

          <ol className="mt-14 space-y-4">
            {steps.map((step, index) => {
              const Icon = resolveIcon(step.icon);
              return (
                <motion.li
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.05 }}
                >
                  <Card className="group relative overflow-hidden p-6 sm:p-8">
                    <span className="absolute -right-4 -top-8 font-display text-[7rem] font-extrabold leading-none text-navy-700/[0.04] transition-transform duration-500 group-hover:scale-110">
                      {String(step.number).padStart(2, '0')}
                    </span>
                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-700 text-white shadow-soft">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-xl font-extrabold text-navy-800">{step.title}</h3>
                          {step.duration ? (
                            <Badge tone="clay">
                              <Clock className="h-3 w-3" aria-hidden />
                              {step.duration}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2.5 max-w-3xl text-[0.95rem] leading-relaxed text-ink-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.li>
              );
            })}
          </ol>
        </Container>
      </Section>

      {/* ─────────────────────────── OUTILS ───────────────────────────────── */}
      <Section tone="cream">
        <Container>
          <SectionHeading
            eyebrow="Outils & technologies"
            title="Les outils qui réduisent les surprises"
            description="Nous investissons dans la précision : elle coûte moins cher que la correction."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {TOOLS.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 2) * 0.08 }}
              >
                <Card className="h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                    <tool.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-800">{tool.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{tool.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────── ENGAGEMENTS ─────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Nos engagements"
                title="Ce sur quoi vous pouvez compter"
                description="Quatre engagements opposables, appliqués à chaque projet."
              />
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to="/contact" iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}>
                  Démarrer un projet
                </ButtonLink>
                <ButtonLink to="/budget" variant="outline">
                  Estimer mon budget
                </ButtonLink>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {COMMITMENTS.map((commitment) => (
                <Card key={commitment.title} className="p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive-600/12 text-olive-700">
                    <Check className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-navy-800">
                    {commitment.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-600">{commitment.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────── CHIFFRES ────────────────────────────── */}
      <Section tone="navy" spacing="tight">
        <Container>
          <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dt className="font-display text-4xl font-extrabold text-white sm:text-5xl">
                  {stat.value}
                  <span className="text-clay-400">{stat.suffix}</span>
                </dt>
                <dd className="mt-2 text-xs font-medium uppercase tracking-wider text-white/50">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* ──────────────────────────── FAQ ─────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <SectionHeading eyebrow="Questions fréquentes" title="Les réponses avant de commencer" />
            <Accordion
              items={faq.map((item, index) => ({
                id: `faq-${index}`,
                question: item.question,
                answer: <p>{item.answer}</p>,
              }))}
            />
          </div>
        </Container>
      </Section>

      <Section tone="cream" spacing="tight">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            {services.slice(0, 3).map((service) => (
              <Card key={service.id} className="p-6">
                <h3 className="font-display text-base font-bold text-navy-800">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{service.excerpt}</p>
                <ButtonLink
                  to={`/services/${service.slug}`}
                  variant="ghost"
                  size="sm"
                  className="mt-3 -ml-4"
                  iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  En savoir plus
                </ButtonLink>
              </Card>
            ))}
          </div>

          {posts.length > 0 ? (
            <div className="mt-12 text-center">
              <ButtonLink to="/actualites" variant="outline">
                Lire nos conseils construction
              </ButtonLink>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
