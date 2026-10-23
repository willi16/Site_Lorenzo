import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hammer,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Seo, organizationSchema, websiteSchema } from '@/lib/seo';
import { CONTACT } from '@/lib/constants';
import { CATEGORY_LABELS, formatArea, formatDate } from '@/lib/format';
import { resolveIcon } from '@/lib/icons';
import { ButtonLink, Card, Container, Section, SectionHeading, Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { NewsletterForm } from '@/components/sections/NewsletterForm';
import type { homeLoader } from '@/app/loaders';
import { useLoaderDataOf } from '@/app/loaders';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Transparence totale',
    text: 'Un devis détaillé par lot, un échéancier écrit et un compte-rendu de chantier chaque semaine. Vous savez toujours où passe votre argent.',
  },
  {
    icon: Sparkles,
    title: 'Architecture durable',
    text: 'Des bâtiments pensés pour le climat : ventilation naturelle, protection solaire, matériaux locaux qui tiennent dans le temps.',
  },
  {
    icon: Hammer,
    title: 'Maîtrise du chantier',
    text: 'Nos équipes et nos partenaires de longue date appliquent le même niveau d’exécution du terrassement à la dernière finition.',
  },
  {
    icon: Compass,
    title: 'Accompagnement humain',
    text: 'Un architecte référent, joignable, qui suit votre projet de la première esquisse à la remise des clés. Toujours le même interlocuteur.',
  },
];

export default function HomePage() {
  const data = useLoaderDataOf<typeof homeLoader>();
  const reduceMotion = useReducedMotion();
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const heroProjects = useMemo(() => {
    const list = data.projects.filter((p) => p.coverImage || p.gallery.length > 0);
    return (list.length >= 3 ? list : data.projects).slice(0, 4);
  }, [data.projects]);

  useEffect(() => {
    if (paused || reduceMotion || heroProjects.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setSlide((s) => (s + 1) % heroProjects.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, heroProjects.length]);

  const current = heroProjects[slide];

  return (
    <>
      <Seo
        title="B.A. Construction — Architecte & constructeur au Togo"
        description="Cabinet d’architecture et de construction à Lomé : construction résidentielle, bâtiments commerciaux, rénovation, extension et aménagement. Devis clair, délais tenus, chantier suivi."
        canonical="/"
        image="/og-image.svg"
        keywords={[
          'architecte Lomé',
          'construction maison Togo',
          'bâtiment commercial Togo',
          'rénovation Lomé',
          'architecte Togo',
          'construction clé en main Lomé',
        ]}
        jsonLd={[organizationSchema(), websiteSchema()]}
      />

      {/* ──────────────────────────────── HERO ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy-800 pb-20 pt-32 text-white sm:pb-28 sm:pt-40">
        <div className="absolute inset-0">
          {heroProjects.map((project, index) => (
            <div
              key={project.id}
              className="absolute inset-0 transition-opacity duration-[1400ms] ease-fluid"
              style={{ opacity: index === slide ? 1 : 0 }}
              aria-hidden={index !== slide}
            >
              <ProjectImage
                src={project.coverImage}
                alt={project.title}
                seed={project.slug}
                ratio="h-full"
                className="h-full w-full"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-900/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-900/50" />
          <div className="absolute inset-0 bg-grid-fine bg-grid opacity-[0.25]" />
        </div>

        <Container size="wide" className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Badge tone="light" className="mb-6 border border-white/15 bg-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay-400" aria-hidden />
                  Architecte & constructeur · Lomé, Togo
                </Badge>

                <h1 className="font-display text-4xl font-extrabold leading-[1.06] tracking-tight [text-shadow:0_2px_24px_rgba(4,12,20,0.85)] sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                  Construire au Togo,
                  <br />
                  <span className="text-clay-300">bien et durablement.</span>
                </h1>

                <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 [text-shadow:0_1px_12px_rgba(4,12,20,0.7)] sm:text-lg">
                  B.A. Construction dessine et construit des bâtiments qui vieillissent bien sous ce
                  climat, sans dériver sur le budget ni sur le délai. De l’esquisse à la clé, un seul
                  interlocuteur.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink to="/contact" size="lg" iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}>
                    Demander un devis gratuit
                  </ButtonLink>
                  <ButtonLink
                    to="/realisations"
                    size="lg"
                    variant="light"
                    iconRight={<ArrowUpRight className="h-4 w-4" aria-hidden />}
                  >
                    Voir nos réalisations
                  </ButtonLink>
                </div>

                <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/12 pt-8">
                  {data.stats.slice(0, 3).map((stat) => (
                    <div key={stat.id}>
                      <dt className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                        {stat.value}
                        <span className="text-clay-400">{stat.suffix}</span>
                      </dt>
                      <dd className="mt-1.5 text-xs font-medium uppercase tracking-wider text-white/65">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </div>

            {heroProjects.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative hidden lg:block"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md">
                  <p className="text-xs font-bold uppercase tracking-widest2 text-white/45">
                    Projet à la une
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold text-white">{current?.title}</h2>
                  <p className="mt-1.5 text-sm text-white/60">{current?.subtitle ?? current?.excerpt}</p>

                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-white/40">Localisation</dt>
                      <dd className="mt-1 flex items-center gap-1.5 font-medium text-white">
                        <MapPin className="h-3.5 w-3.5 text-clay-400" aria-hidden />
                        {current?.location}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-white/40">Superficie</dt>
                      <dd className="mt-1 font-medium text-white">{formatArea(current?.area ?? 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-white/40">Catégorie</dt>
                      <dd className="mt-1 font-medium text-white">
                        {current ? CATEGORY_LABELS[current.category] : ''}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-white/40">Livraison</dt>
                      <dd className="mt-1 font-medium text-white">{current?.year}</dd>
                    </div>
                  </dl>

                  <Link
                    to={`/realisations/${current?.slug ?? ''}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay-400 transition hover:text-clay-300"
                  >
                    Découvrir ce projet
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>

                  <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5">
                    {heroProjects.map((project, index) => (
                      <button
                        key={project.id}
                        type="button"
                        onClick={() => setSlide(index)}
                        aria-label={`Afficher le projet ${index + 1}`}
                        aria-current={index === slide}
                        className={`h-1 rounded-full transition-all duration-500 ${
                          index === slide ? 'w-8 bg-clay-400' : 'w-3 bg-white/25 hover:bg-white/50'
                        }`}
                      />
                    ))}
                    <span className="ml-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSlide((s) => (s - 1 + heroProjects.length) % heroProjects.length)}
                        className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                        aria-label="Projet précédent"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlide((s) => (s + 1) % heroProjects.length)}
                        className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                        aria-label="Projet suivant"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden />
                      </button>
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </Container>
      </section>

      {/* ────────────────────── PRÉSENTATION / VALEURS ───────────────────── */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Le cabinet"
                title={
                  <>
                    Une équipe d’architectes <span className="text-clay-500">engagés</span> à vos côtés
                  </>
                }
                description="B.A. Construction est né d’un constat : trop de chantiers dérivent parce que personne ne porte la responsabilité de bout en bout. Nous avons monté un cabinet qui assume chaque étape, du premier trait au dernier joint."
              />

              <div className="mt-8 space-y-4">
                {VALUES.map((value) => (
                  <div key={value.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                      <value.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold text-navy-800">{value.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">{value.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ButtonLink
                to="/le-cabinet"
                variant="secondary"
                className="mt-8"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Découvrir le cabinet
              </ButtonLink>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {data.stats.map((stat) => {
                const Icon = resolveIcon(stat.icon, Building2);
                return (
                  <Card key={stat.id} className="p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-clay-500/10 text-clay-600">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-5 font-display text-4xl font-extrabold tracking-tight text-navy-800">
                      {stat.value}
                      <span className="text-clay-500">{stat.suffix}</span>
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink-500">{stat.label}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* ──────────────────────────── SERVICES ─────────────────────────────── */}
      <Section>
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Nos expertises"
              title="Nos métiers, du premier plan à la remise des clés"
              description="Six savoir-faire complémentaires, mobilisés au bon moment selon l’avancement de votre projet."
            />
            <ButtonLink
              to="/services"
              variant="outline"
              className="shrink-0"
              iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
            >
              Tous les services
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.services.slice(0, 6).map((service, index) => {
              const Icon = resolveIcon(service.icon);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Card className="group h-full p-7 hover:-translate-y-1 hover:shadow-lift">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700 transition-colors duration-300 group-hover:bg-clay-500 group-hover:text-white">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-navy-800">
                      <Link to={`/services/${service.slug}`} className="after:absolute after:inset-0">
                        {service.title}
                      </Link>
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{service.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-600 transition group-hover:gap-2.5">
                      En savoir plus
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ────────────────────────── PORTFOLIO ─────────────────────────────── */}
      <Section tone="cream">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Réalisations"
              title="Des projets livrés, pas des promesses"
              description="Parcourez nos chantiers récents en détail : contraintes du terrain, réponses techniques, matière et budget."
            />
            <ButtonLink
              to="/realisations"
              variant="outline"
              className="shrink-0"
              iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
            >
              Voir le portfolio complet
            </ButtonLink>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.projects.slice(0, 8).map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────────────── MÉTHODOLOGIE ────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Méthodologie"
                title="Sept étapes, et rien d’improvisé"
                description="À tout moment, vous savez à quelle étape se trouve votre projet, ce que nous produisons et ce qui est attendu de vous."
              />
              <div className="mt-8 rounded-2xl border border-ink-800/[0.08] bg-cream-100/70 p-6">
                <p className="text-sm leading-relaxed text-ink-700">
                  <strong className="text-navy-800">Un architecte référent unique</strong> vous suit
                  du premier rendez-vous jusqu’à la réception. Il est votre interlocuteur direct :
                  devis, plans, suivi, arbitrages.
                </p>
                <ButtonLink
                  to="/methodologie"
                  variant="ghost"
                  className="mt-4 -ml-4"
                  iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  Découvrir notre méthode
                </ButtonLink>
              </div>
            </div>

            <ol className="relative space-y-3 border-l border-ink-800/10 pl-6">
              {data.steps.slice(0, 5).map((step) => {
                const Icon = resolveIcon(step.icon, Compass);
                return (
                  <li key={step.id} className="relative">
                    <span className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-cream-100 bg-navy-700 text-white">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <div className="rounded-xl border border-ink-800/[0.07] bg-white p-4 transition hover:shadow-soft">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-xs font-extrabold text-clay-500">
                          {String(step.number).padStart(2, '0')}
                        </span>
                        <h3 className="font-display text-base font-bold text-navy-800">{step.title}</h3>
                        {step.duration ? (
                          <span className="ml-auto text-xs font-medium text-ink-400">{step.duration}</span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 pl-8 text-sm leading-relaxed text-ink-600">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Container>
      </Section>

      {/* ───────────────────────── TÉMOIGNAGES ────────────────────────────── */}
      {data.testimonials.length > 0 ? (
        <Section tone="navy" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-fine bg-grid opacity-[0.07]" />
          <Container size="wide" className="relative">
            <SectionHeading
              eyebrow="Ils nous ont fait confiance"
              title="La parole à nos clients"
              tone="light"
              align="center"
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.testimonials.slice(0, 6).map((testimonial, index) => (
                <motion.figure
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
                  className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm"
                >
                  <Quote className="h-7 w-7 shrink-0 text-clay-400" aria-hidden />
                  <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-white/80">
                    « {testimonial.quote} »
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-clay-500 font-display text-sm font-bold text-white">
                      {testimonial.authorName.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {testimonial.authorName}
                      </span>
                      <span className="block text-xs text-white/50">
                        {testimonial.authorRole}
                        {testimonial.company ? ` — ${testimonial.company}` : ''}
                      </span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ──────────────────────────── BLOG ───────────────────────────────── */}
      {data.posts.length > 0 ? (
        <Section>
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Actualités"
                title="Nos derniers articles"
                description="Conseils de construction, budgets, réglementation togolaise et coulisses de nos chantiers."
              />
              <ButtonLink
                to="/actualites"
                variant="outline"
                className="shrink-0"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Tous les articles
              </ButtonLink>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {data.posts.map((post) => (
                <Card key={post.id} className="group h-full overflow-hidden">
                  <Link to={`/actualites/${post.slug}`} className="block">
                    <ProjectImage
                      src={post.coverImage}
                      alt={post.title}
                      seed={post.slug}
                      ratio="aspect-[16/10]"
                    />
                  </Link>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs font-medium text-ink-400">
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                      <span aria-hidden>·</span>
                      <span>{post.readMinutes} min de lecture</span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug text-navy-800">
                      <Link
                        to={`/actualites/${post.slug}`}
                        className="transition-colors hover:text-clay-600 after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-ink-600">
                      {post.excerpt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {/* ────────────────────────── CTA + NEWSLETTER ─────────────────────── */}
      <Section tone="cream">
        <Container>
          <div className="grid items-center gap-10 rounded-3xl border border-ink-800/[0.07] bg-white p-8 shadow-soft sm:p-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="font-display text-2xl font-extrabold leading-tight text-navy-800 sm:text-3xl">
                Vous avez un terrain, un local, une idée&nbsp;?
              </h2>
              <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink-600">
                Le premier rendez-vous est gratuit et sans engagement. Nous revenons vers vous sous
                48&nbsp;heures avec une première lecture de votre projet et une fourchette budgétaire.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink
                  to="/contact"
                  size="lg"
                  iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  Prendre rendez-vous
                </ButtonLink>
                <ButtonLink to="/budget" size="lg" variant="outline">
                  Estimer mon budget
                </ButtonLink>
              </div>
            </div>

            <div className="rounded-2xl bg-navy-800 p-7 text-white">
              <h3 className="font-display text-lg font-bold">La lettre du Lundi Bâtisseur</h3>
              <p className="mt-1.5 text-sm text-white/65">
                Un e-mail par mois : nos projets, nos prix réels, nos conseils de terrain.
              </p>
              <NewsletterForm className="mt-5" source="home" />
              <p className="mt-3 text-xs text-white/45">ou appelez-nous : {CONTACT.phone}</p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
