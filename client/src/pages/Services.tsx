import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { resolveIcon } from '@/lib/icons';
import { ButtonLink, Container, Section, SectionHeading, Card } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { PageHero } from '@/components/sections/PageHero';
import { servicesLoader, useLoaderDataOf } from '@/app/loaders';

export default function ServicesPage() {
  const { services, projects } = useLoaderDataOf<typeof servicesLoader>();

  return (
    <>
      <Seo
        title="Nos services d’architecture et de construction — B.A. Construction Togo"
        description="Construction résidentielle, bâtiments commerciaux, rénovation et extension, aménagement intérieur et extérieur, suivi de chantier. Toutes nos prestations d’architecture à Lomé, Togo."
        canonical="/services"
        keywords={[
          'service architecte Togo',
          'construction résidentielle Lomé',
          'bâtiment commercial Togo',
          'rénovation maison Lomé',
          'aménagement intérieur Togo',
          'maîtrise d’œuvre Togo',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Services', url: '/services' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Nos prestations"
        title="Une chaîne complète, de l’idée à la livraison"
        description="Six expertises mobilisables séparément ou combinées. Dans tous les cas : un interlocuteur unique, un budget lisible, un planning annoncé et tenu."
        breadcrumbs={[{ label: 'Services' }]}
      />

      <Section>
        <Container>
          <div className="space-y-6">
            {services.map((service, index) => {
              const Icon = resolveIcon(service.icon);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: (index % 2) * 0.06 }}
                >
                  <Card className="group relative overflow-hidden p-7 sm:p-9">
                    <div className="grid gap-8 lg:grid-cols-[auto_1fr_1.1fr] lg:items-start">
                      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-700 text-white transition-colors duration-300 group-hover:bg-clay-500">
                        <Icon className="h-7 w-7" aria-hidden />
                      </span>

                      <div>
                        {service.eyebrow ? (
                          <p className="text-xs font-bold uppercase tracking-widest2 text-clay-600">
                            {service.eyebrow}
                          </p>
                        ) : null}
                        <h2 className="mt-2 font-display text-2xl font-extrabold text-navy-800 sm:text-3xl">
                          <Link to={`/services/${service.slug}`} className="after:absolute after:inset-0">
                            {service.title}
                          </Link>
                        </h2>
                        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-600">
                          {service.excerpt}
                        </p>
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-600">
                          Détail de la prestation
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>

                      <ul className="grid gap-2.5 sm:grid-cols-2">
                        {service.highlights.slice(0, 6).map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink-700">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-olive-600" aria-hidden />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </Section>

      {projects.length > 0 ? (
        <Section tone="cream">
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="En pratique"
                title="Des projets livrés dans ces domaines"
                description="Quelques réalisations récentes pour illustrer concrètement notre manière de travailler."
              />
              <ButtonLink
                to="/realisations"
                variant="outline"
                className="shrink-0"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Tout le portfolio
              </ButtonLink>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-800 p-8 text-white sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
                  Vous ne savez pas exactement de quoi vous avez besoin&nbsp;?
                </h2>
                <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-white/70">
                  Parlez-nous de votre projet en termes simples. Nous formulons la prestation
                  adaptée, puis nous chiffrons trois scénarios : essentiel, recommandé, premium.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <ButtonLink
                  to="/contact"
                  variant="light"
                  size="lg"
                  iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  Décrire mon projet
                </ButtonLink>
                <ButtonLink
                  to="/budget"
                  size="lg"
                  className="border border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  Estimer mon budget
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
