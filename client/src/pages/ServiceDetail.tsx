import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, FileText, Phone } from 'lucide-react';
import { Seo, absoluteUrl, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { resolveIcon } from '@/lib/icons';
import { CONTACT } from '@/lib/constants';
import { ButtonLink, Container, Section, SectionHeading, Card, Badge } from '@/components/ui/primitives';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { PageHero } from '@/components/sections/PageHero';
import { serviceLoader, useLoaderDataOf } from '@/app/loaders';

export default function ServiceDetailPage() {
  const { service, related } = useLoaderDataOf<typeof serviceLoader>();
  const Icon = resolveIcon(service.icon);

  const faq = [
    {
      question: `Quels sont les délais pour un projet ${service.title.toLowerCase()} ?`,
      answer:
        service.processNote ??
        'Le délai dépend de la taille du projet, des études de permis et des approvisionnements. Après la visite technique, nous vous remettons un planning détaillé avec des jalons clairs.',
    },
    {
      question: 'Le devis est-il ferme et détaillé ?',
      answer:
        'Oui. Chaque devis est décomposé par lots (études, fournitures, main-d’œuvre, raccordements) afin que vous sachiez précisément où va chaque franc CFA. Les variantes y sont chiffrées séparément.',
    },
    {
      question: 'Pouvez-vous travailler avec mon entreprise de construction ?',
      answer:
        'Oui, si elle est qualifiée et acceptée par nos contrôles qualité. Nous conservons toutefois la maîtrise d’œuvre et le suivi de chantier, qui restent notre responsabilité.',
    },
  ];

  return (
    <>
      <Seo
        title={service.seoTitle ?? `${service.title} — B.A. Construction Togo`}
        description={service.seoDescription ?? service.excerpt}
        canonical={`/services/${service.slug}`}
        image={service.coverImage ?? '/og-image.png'}
        type="article"
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Services', url: '/services' },
            { name: service.title, url: `/services/${service.slug}` },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.excerpt,
            serviceType: service.title,
            provider: { '@id': `${absoluteUrl('/')}#organization` },
            areaServed: { '@type': 'Country', name: 'Togo' },
            url: absoluteUrl(`/services/${service.slug}`),
          },
        ]}
      />

      <PageHero
        eyebrow={service.eyebrow ?? 'Service'}
        title={service.title}
        description={service.excerpt}
        breadcrumbs={[
          { label: 'Services', to: '/services' },
          { label: service.title },
        ]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink
            to="/contact"
            size="lg"
            iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
          >
            Demander un devis
          </ButtonLink>
          <a
            href={CONTACT.phoneHref}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            <Phone className="h-4 w-4" aria-hidden />
            {CONTACT.phone}
          </a>
        </div>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-700 text-white">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <h2 className="font-display text-2xl font-extrabold text-navy-800 sm:text-3xl">
                  Ce que nous prenons en charge
                </h2>
                <div className="mt-5 space-y-4 text-[0.95rem] leading-relaxed text-ink-600">
                  {service.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>

              {service.highlights.length > 0 ? (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-extrabold text-navy-800">Nos prestations</h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {service.highlights.map((highlight, index) => (
                      <motion.li
                        key={highlight}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.04 }}
                        className="flex items-start gap-3 rounded-xl border border-ink-800/[0.07] bg-white p-4"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive-600/12 text-olive-700">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <span className="text-sm font-medium text-ink-700">{highlight}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {service.deliverables.length > 0 ? (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-extrabold text-navy-800">
                    Ce que vous recevez
                  </h2>
                  <ul className="mt-5 space-y-3">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-[0.95rem] text-ink-600">
                        <FileText className="mt-0.5 h-4.5 w-4.5 shrink-0 text-clay-500" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-12 rounded-2xl border border-ink-800/[0.07] bg-cream-100/70 p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                    <Clock className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-navy-800">Comment ça se passe</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                      {service.processNote ??
                        'Premier échange, visite technique, proposition d’esquisses, chiffrage détaillé, puis exécution. Vous validez chaque étape avant de passer à la suivante.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <Card className="p-7">
                <Badge tone="clay">Devis gratuit</Badge>
                <h2 className="mt-4 font-display text-xl font-extrabold text-navy-800">
                  Parlons de votre projet
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                  Décrivez votre projet en deux minutes. Nous revenons vers vous sous 48&nbsp;heures
                  avec une première lecture et une fourchette budgétaire.
                </p>
                <ButtonLink to="/contact" fullWidth className="mt-5" iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}>
                  Demander un devis
                </ButtonLink>
                <ButtonLink to="/budget" fullWidth variant="outline" className="mt-2.5">
                  Estimer mon budget
                </ButtonLink>

                <div className="mt-6 border-t border-ink-800/[0.08] pt-5 text-sm">
                  <p className="text-xs font-bold uppercase tracking-widest2 text-ink-400">
                    Nous joindre
                  </p>
                  <a
                    href={CONTACT.phoneHref}
                    className="mt-3 flex items-center gap-2.5 font-semibold text-navy-800 transition hover:text-clay-600"
                  >
                    <Phone className="h-4 w-4 text-clay-500" aria-hidden />
                    {CONTACT.phone}
                  </a>
                  <p className="mt-2 text-xs text-ink-500">{CONTACT.hours[0]?.days} · {CONTACT.hours[0]?.time}</p>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section tone="cream">
          <Container>
            <SectionHeading
              eyebrow="Réalisations"
              title="Des projets dans cette catégorie"
              description="Découvrez nos chantiers les plus représentatifs."
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/realisations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-clay-600 transition hover:gap-3"
              >
                Voir toutes les réalisations
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Container>
        </Section>
      ) : null}

      <Section>
        <Container>
          <SectionHeading eyebrow="Questions fréquentes" title="Les questions qu’on nous pose" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {faq.map((item) => (
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
