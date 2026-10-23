import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Building2, Linkedin, Mail, MapPin, Phone, Target, Users } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { CONTACT } from '@/lib/constants';
import { resolveIcon } from '@/lib/icons';
import { ButtonLink, Container, Section, SectionHeading, Card, Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { PageHero } from '@/components/sections/PageHero';
import { aboutLoader, useLoaderDataOf } from '@/app/loaders';

const VALUES = [
  {
    icon: Target,
    title: 'Exigence',
    text: "Un plan n'est pas fini tant qu'il ne tient pas dans la réalité du terrain, du budget et de la météo. Nous dessinons pour le climat que nous avons, pas pour celui des catalogues.",
  },
  {
    icon: Users,
    title: 'Pédagogie',
    text: 'Nos clients comprennent toujours les décisions prises sur leur projet. Une explication claire vaut mieux qu’un silence de luxe.',
  },
  {
    icon: Building2,
    title: 'Responsabilité',
    text: 'Nous portons la responsabilité complète : de l’étude de faisabilité à la réception. Un interlocuteur, un engagement, un résultat.',
  },
  {
    icon: Award,
    title: 'Durabilité',
    text: 'Béton, terre, bois local, protections solaires : nous choisissons des matériaux que l’on pourra maintenir dans vingt ans, ici.',
  },
];

export default function AboutPage() {
  const { team, certifications, partners, stats, testimonials, services } =
    useLoaderDataOf<typeof aboutLoader>();

  return (
    <>
      <Seo
        title="Le cabinet — B.A. Construction, architectes et constructeurs à Lomé"
        description="Découvrez notre équipe d’architectes, nos valeurs, nos certifications et nos partenaires. Un cabinet togolais engagé dans la qualité, la transparence et la durabilité."
        canonical="/le-cabinet"
        keywords={[
          'cabinet architecture Togo',
          'architecte Lomé équipe',
          'B.A. Construction',
          'architecte certifié Togo',
          'construction durable Togo',
        ]}
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Le cabinet', url: '/le-cabinet' },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Le cabinet"
        title="B.A. Construction — Lundi Bâtisseur"
        description="Nés à Lomé, nous construisons des bâtiments qui traversent les générations. Notre exigence se lit dans les détails du chantier, pas sur une plaquette."
        breadcrumbs={[{ label: 'Le cabinet' }]}
      />

      {/* ──────────────────────────── HISTOIRE ───────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <SectionHeading eyebrow="Notre histoire" title="D’un atelier de construction à un cabinet d’architecture intégré" />
              <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-ink-600">
                <p>
                  B.A. Construction a commencé comme une entreprise de bâtiment. Nous construisions
                  pour nos proches, puis pour des voisins, puis pour des entreprises. À chaque
                  chantier revenait la même frustration : les clients ne comprenaient pas pourquoi les
                  budgets bougeaient, pourquoi les délais glissaient, pourquoi telle décision avait
                  été prise à leur place.
                </p>
                <p>
                  Nous en avons tiré une décision : faire de la conception notre cœur de métier.
                  Dessiner nous-mêmes, suivre le chantier nous-mêmes, et assumer la responsabilité
                  de bout en bout. Sur le moment, cette voie nous a coûté des affaires. Avec le
                  recul, elle nous a bâti une réputation solide et une équipe stable.
                </p>
                <p>
                  Aujourd’hui, nous concevons et réalisons des maisons, des immeubles résidentiels,
                  des bâtiments commerciaux et des rénovations à Lomé et partout au Togo. Notre
                  méthode tourne, nos partenaires tiennent leurs engagements, et nos clients savent
                  à tout moment où en est leur chantier.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat, index) => {
                const Icon = resolveIcon(stat.icon, Building2);
                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                  >
                    <Card className="h-full p-6">
                      <Icon className="h-6 w-6 text-clay-500" aria-hidden />
                      <p className="mt-4 font-display text-3xl font-extrabold text-navy-800">
                        {stat.value}
                        <span className="text-clay-500">{stat.suffix}</span>
                      </p>
                      <p className="mt-1 text-sm text-ink-500">{stat.label}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Container>
      </Section>

      {/* ──────────────────────────── VALEURS ────────────────────────────── */}
      <Section tone="cream">
        <Container>
          <SectionHeading
            eyebrow="Valeurs et engagements"
            title="Quatre principes non négociables"
            description="Ils ne sont pas affichés sur un mur : ils se retrouvent dans chaque livrable, chaque réunion de chantier et chaque décision d'arbitrage."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
              >
                <Card className="h-full p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                    <value.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold text-navy-800">{value.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{value.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ───────────────────────────── ÉQUIPE ─────────────────────────────── */}
      <Section id="equipe">
        <Container>
          <SectionHeading
            eyebrow="L’équipe"
            title="Les architectes et conducteurs de travaux qui vous suivent"
            description="Un architecte référent unique est assigné à votre projet. Il est votre interlocuteur direct, du premier rendez-vous à la remise des clés."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
              >
                <Card className="group h-full overflow-hidden">
                  <ProjectImage
                    src={member.photo}
                    alt={`${member.name}, ${member.role}`}
                    seed={member.name}
                    ratio="aspect-[4/5]"
                  />
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-navy-800">{member.name}</h3>
                    <p className="mt-0.5 text-sm font-semibold text-clay-600">{member.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{member.bio}</p>
                    {member.skills.length > 0 ? (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {member.skills.map((skill) => (
                          <li
                            key={skill}
                            className="rounded-full bg-navy-700/6 px-2.5 py-1 text-[0.7rem] font-semibold text-navy-700"
                          >
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="mt-5 flex gap-3 border-t border-ink-800/[0.08] pt-4 text-sm">
                      {member.email ? (
                        <a
                          href={`mailto:${member.email}`}
                          className="text-ink-500 transition hover:text-clay-600"
                          aria-label={`Écrire à ${member.name}`}
                        >
                          <Mail className="h-4 w-4" aria-hidden />
                        </a>
                      ) : null}
                      {member.phone ? (
                        <a
                          href={`tel:${member.phone.replace(/\s/g, '')}`}
                          className="text-ink-500 transition hover:text-clay-600"
                          aria-label={`Appeler ${member.name}`}
                        >
                          <Phone className="h-4 w-4" aria-hidden />
                        </a>
                      ) : null}
                      {member.linkedin ? (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-500 transition hover:text-clay-600"
                          aria-label={`Profil LinkedIn de ${member.name}`}
                        >
                          <Linkedin className="h-4 w-4" aria-hidden />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ──────────────────────── CERTIFICATIONS ─────────────────────────── */}
      <Section tone="cream" id="certifications">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Certifications & reconnaissance"
                title="Des qualifications vérifiables"
                description="Nous préférons des preuves aux promesses : agréments, assurances, diplômes et distinctions délivrés par des organismes tiers."
              />
              <div className="mt-8 rounded-2xl border border-ink-800/[0.07] bg-white p-6">
                <h3 className="font-display text-base font-bold text-navy-800">Nos engagements</h3>
                <ul className="mt-4 space-y-2.5 text-sm text-ink-600">
                  {[
                    'Respect des délais annoncés, ou geste commercial compensatoire',
                    'Transparence des coûts : devis décomposé par lots',
                    'Qualité constante grâce à des contrôles sur chaque poste clé',
                    'Suivi personnalisé par un architecte référent unique',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {certifications.map((certification) => (
                <Card key={certification.id} className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                      <Award className="h-5 w-5" aria-hidden />
                    </span>
                    {certification.year ? (
                      <Badge tone="neutral">{certification.year}</Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-navy-800">
                    {certification.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-clay-600">{certification.issuer}</p>
                  {certification.description ? (
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
                      {certification.description}
                    </p>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────── PARTENAIRES ─────────────────────────── */}
      <Section id="partenaires">
        <Container>
          <SectionHeading
            eyebrow="Partenaires"
            title="Le réseau qui sécurise vos délais"
            description="Bureaux d’études, entreprises de construction, fournisseurs de matériaux et institutions : des relations de longue date, vérifiées chantier après chantier."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((partner) => (
              <Card key={partner.id} className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-700/6 font-display text-sm font-extrabold text-navy-700">
                  {partner.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy-800">
                    {partner.name}
                  </span>
                  <span className="block text-xs text-ink-500">{partner.type}</span>
                </span>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ────────────────────────── SERVICES ─────────────────────────────── */}
      <Section tone="navy">
        <Container>
          <SectionHeading
            eyebrow="Ce que nous faisons"
            title="Un cabinet complet"
            tone="light"
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:border-clay-500/50 hover:bg-white/[0.09]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clay-500/15 text-clay-300">
                  <Building2 className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display text-base font-bold text-white">{service.title}</span>
                  <span className="mt-1 block text-sm text-white/60">{service.excerpt}</span>
                </span>
                <ArrowRight
                  className="ml-auto mt-1 h-4 w-4 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-clay-400"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ─────────────────────────── CONTACT ──────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-10 rounded-3xl border border-ink-800/[0.07] bg-cream-100/60 p-8 sm:p-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <SectionHeading eyebrow="Nous rencontrer" title="Le cabinet, à Lomé" />
              <ul className="mt-8 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                  <span>
                    <span className="block font-semibold text-navy-800">Adresse</span>
                    {CONTACT.address}, {CONTACT.city}, {CONTACT.country}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                  <span>
                    <span className="block font-semibold text-navy-800">Téléphone</span>
                    <a href={CONTACT.phoneHref} className="text-clay-600 hover:underline">
                      {CONTACT.phone}
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-clay-500" aria-hidden />
                  <span>
                    <span className="block font-semibold text-navy-800">E-mail</span>
                    <a href={`mailto:${CONTACT.email}`} className="text-clay-600 hover:underline">
                      {CONTACT.email}
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-800/[0.07] bg-white">
              <iframe
                title="Localisation du cabinet B.A. Construction à Lomé"
                src={CONTACT.mapsEmbed}
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-full min-h-[320px] w-full"
              />
            </div>
          </div>
        </Container>
      </Section>

      {testimonials.length > 0 ? (
        <Section tone="cream" spacing="tight">
          <Container>
            <SectionHeading eyebrow="Ils nous font confiance" title="La voix de nos clients" align="center" />
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="p-6">
                  <p className="text-sm leading-relaxed text-ink-600">« {testimonial.quote} »</p>
                  <p className="mt-4 text-sm font-semibold text-navy-800">{testimonial.authorName}</p>
                  <p className="text-xs text-ink-500">{testimonial.authorRole}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section spacing="tight">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-navy-800 p-8 text-white sm:flex-row sm:p-10">
            <div>
              <h2 className="font-display text-xl font-extrabold sm:text-2xl">
                Un projet à nous confier&nbsp;?
              </h2>
              <p className="mt-2 text-sm text-white/65">
                Premier rendez-vous et première estimation offerte, sans engagement.
              </p>
            </div>
            <ButtonLink
              to="/contact"
              variant="light"
              size="lg"
              iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              className="shrink-0"
            >
              Nous contacter
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
