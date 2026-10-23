import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Expand,
  MapPin,
  Maximize,
  Quote,
  Share2,
  Wallet,
} from 'lucide-react';
import { Seo, absoluteUrl, breadcrumbSchema, organizationSchema, projectSchema } from '@/lib/seo';
import { CATEGORY_LABELS, STATUS_LABELS, formatArea, formatFcfa } from '@/lib/format';
import { ButtonLink, Container, Section, SectionHeading, Card, Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { ProjectCard } from '@/components/sections/ProjectCard';
import { Lightbox } from '@/components/ui/Lightbox';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { projectLoader, useLoaderDataOf } from '@/app/loaders';

export default function ProjectDetailPage() {
  const { project, similar } = useLoaderDataOf<typeof projectLoader>();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gallery = [
    ...(project.coverImage ? [{ src: project.coverImage, alt: `${project.title} — vue principale` }] : []),
    ...project.gallery.map((src, index) => ({
      src,
      alt: `${project.title} — image ${index + 2}`,
    })),
  ];

  const shareUrl = absoluteUrl(`/realisations/${project.slug}`);

  return (
    <>
      <Seo
        title={project.seoTitle ?? `${project.title} — Réalisation B.A. Construction`}
        description={project.seoDescription ?? project.excerpt}
        canonical={`/realisations/${project.slug}`}
        image={project.coverImage ?? '/og-image.svg'}
        type="article"
        keywords={[
          project.title,
          CATEGORY_LABELS[project.category] ?? project.category,
          `architecte ${project.location}`,
          `construction ${project.location}`,
        ]}
        jsonLd={[
          organizationSchema(),
          projectSchema({
            title: project.title,
            slug: project.slug,
            excerpt: project.excerpt,
            description: project.description,
            image: project.coverImage,
            year: project.year,
            area: project.area,
            location: project.location,
            materials: project.materials,
          }),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Réalisations', url: '/realisations' },
            { name: project.title, url: `/realisations/${project.slug}` },
          ]),
        ]}
      />

      {/* ─────────────────────────────── HERO ────────────────────────────── */}
      <section className="bg-navy-800 pt-32 pb-14 text-white sm:pt-40">
        <Container size="wide">
          <Breadcrumbs
            tone="light"
            items={[
              { label: 'Réalisations', to: '/realisations' },
              { label: project.title },
            ]}
          />

          <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="light" className="border border-white/15 bg-white/10">
                  {CATEGORY_LABELS[project.category] ?? project.category}
                </Badge>
                {project.status !== 'COMPLETED' ? (
                  <Badge tone="clay">{STATUS_LABELS[project.status]}</Badge>
                ) : null}
              </div>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                {project.title}
              </h1>
              {project.subtitle ? (
                <p className="mt-3 text-lg text-clay-300">{project.subtitle}</p>
              ) : null}
              <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-white/80 sm:text-base">
                {project.excerpt}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm sm:grid-cols-4 lg:grid-cols-2">
              <Spec label="Localisation" icon={<MapPin className="h-3.5 w-3.5" aria-hidden />}>
                {project.location}
              </Spec>
              <Spec label="Superficie" icon={<Maximize className="h-3.5 w-3.5" aria-hidden />}>
                {formatArea(project.area)}
              </Spec>
              <Spec label="Livraison" icon={<Calendar className="h-3.5 w-3.5" aria-hidden />}>
                {project.year}
              </Spec>
              <Spec label="Budget" icon={<Wallet className="h-3.5 w-3.5" aria-hidden />}>
                {project.budgetLabel ?? formatFcfa(project.budget)}
              </Spec>
            </dl>
          </div>
        </Container>
      </section>

      {/* ──────────────────────────── GALERIE ────────────────────────────── */}
      <Section spacing="tight">
        <Container size="wide">
          {gallery.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.slice(0, 6).map((item, index) => (
                <button
                  key={item.src + index}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={`group relative overflow-hidden rounded-2xl ${
                    index === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  }`}
                  aria-label={`Agrandir l’image : ${item.alt}`}
                >
                  <ProjectImage
                    src={item.src}
                    alt={item.alt}
                    seed={`${project.slug}-${index}`}
                    ratio={index === 0 ? 'aspect-[4/3] sm:aspect-[16/10]' : 'aspect-[4/3]'}
                    className="transition-transform duration-700 ease-fluid group-hover:scale-105"
                  >
                    <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-800 opacity-0 shadow-soft transition-opacity duration-300 group-hover:opacity-100">
                      <Expand className="h-4 w-4" aria-hidden />
                    </span>
                  </ProjectImage>
                </button>
              ))}
            </div>
          ) : null}
        </Container>
      </Section>

      {/* ─────────────────────────── CONTENU ─────────────────────────────── */}
      <Section spacing="tight">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16">
            <div>
              <article className="space-y-6 text-[0.95rem] leading-relaxed text-ink-600">
                {project.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </article>

              {project.challenges ? (
                <div className="mt-12 rounded-2xl border border-ink-800/[0.07] bg-cream-100/70 p-7">
                  <h2 className="font-display text-lg font-extrabold text-navy-800">Le défi</h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-600">{project.challenges}</p>
                </div>
              ) : null}

              {project.solution ? (
                <div className="mt-4 rounded-2xl border border-ink-800/[0.07] bg-navy-800 p-7 text-white">
                  <h2 className="font-display text-lg font-extrabold">La solution apportée</h2>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-white/75">{project.solution}</p>
                </div>
              ) : null}

              {project.beforeAfter && project.beforeAfter.length > 0 ? (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-extrabold text-navy-800">Avant / Après</h2>
                  <BeforeAfter items={project.beforeAfter} />
                </div>
              ) : null}

              {project.features.length > 0 ? (
                <div className="mt-12">
                  <h2 className="font-display text-xl font-extrabold text-navy-800">
                    Caractéristiques techniques
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 rounded-xl border border-ink-800/[0.07] bg-white p-4 text-sm text-ink-700"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-olive-600/12 text-olive-700">
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.materials.length > 0 ? (
                <div className="mt-10">
                  <h2 className="font-display text-xl font-extrabold text-navy-800">Matériaux utilisés</h2>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.materials.map((material) => (
                      <span
                        key={material}
                        className="rounded-full border border-ink-800/10 bg-white px-4 py-2 text-sm font-medium text-ink-700"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              {project.testimonial ? (
                <Card className="p-6">
                  <Quote className="h-6 w-6 text-clay-400" aria-hidden />
                  <blockquote className="mt-3 text-sm leading-relaxed text-ink-600">
                    « {project.testimonial.quote} »
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3 border-t border-ink-800/[0.08] pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 text-sm font-bold text-white">
                      {project.testimonial.authorName.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy-800">
                        {project.testimonial.authorName}
                      </span>
                      <span className="block text-xs text-ink-500">{project.testimonial.authorRole}</span>
                    </span>
                  </figcaption>
                </Card>
              ) : null}

              <Card className="p-6">
                <h2 className="font-display text-base font-bold text-navy-800">Un projet similaire ?</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  Parlez-nous du vôtre : nous le traitons sous 48 heures avec une estimation.
                </p>
                <ButtonLink to="/contact" fullWidth className="mt-4">
                  Demander un devis
                </ButtonLink>
                <ButtonLink to="/budget" fullWidth variant="outline" className="mt-2.5">
                  Estimer mon budget
                </ButtonLink>
              </Card>

              <Card className="p-6">
                <h2 className="font-display text-base font-bold text-navy-800">Partager</h2>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-800/10 text-ink-600 transition hover:border-clay-500 hover:text-clay-600"
                    aria-label="Partager sur Facebook"
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${project.title} — ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-800/10 text-ink-600 transition hover:border-clay-500 hover:text-clay-600"
                    aria-label="Partager sur WhatsApp"
                  >
                    <Share2 className="h-4 w-4" aria-hidden />
                  </a>
                </div>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>

      {similar.length > 0 ? (
        <Section tone="cream">
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="À voir aussi"
                title="Des projets comparables"
                description="Même catégorie, mêmes contraintes : voici comment nous les avons traités."
              />
              <ButtonLink
                to="/realisations"
                variant="outline"
                className="shrink-0"
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Tous les projets
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section spacing="tight">
        <Container>
          <Link
            to="/realisations"
            className="inline-flex items-center gap-2 text-sm font-semibold text-clay-600 transition hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Retour aux réalisations
          </Link>
        </Container>
      </Section>

      <Lightbox
        items={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
        title={project.title}
      />
    </>
  );
}

function Spec({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest2 text-white/40">
        {icon}
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold text-white">{children}</dd>
    </div>
  );
}

function BeforeAfter({
  items,
}: {
  items: { before: string; after: string; label?: string }[];
}) {
  const [position, setPosition] = useState(50);
  const [active, setActive] = useState(0);
  const item = items[active];
  if (!item) return null;

  return (
    <div className="mt-5">
      <div className="relative aspect-[16/10] select-none overflow-hidden rounded-2xl bg-ink-800">
        <img
          src={item.after}
          alt="Après travaux"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={item.before}
            alt="Avant travaux"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-lift"
          style={{ left: `${position}%` }}
        >
          <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-navy-800 shadow-lift">
            <Expand className="h-4 w-4 rotate-45" aria-hidden />
          </span>
        </div>

        <span className="absolute left-4 top-4 rounded-full bg-navy-900/75 px-3 py-1.5 text-xs font-semibold text-white">
          Avant
        </span>
        <span className="absolute right-4 top-4 rounded-full bg-clay-500/90 px-3 py-1.5 text-xs font-semibold text-white">
          Après
        </span>

        <input
          type="range"
          min="0"
          max="100"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label="Comparer avant et après"
        />
      </div>

      {items.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((entry, index) => (
            <button
              key={entry.label ?? index}
              type="button"
              onClick={() => setActive(index)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                index === active
                  ? 'bg-navy-700 text-white'
                  : 'bg-ink-800/[0.06] text-ink-600 hover:bg-navy-700/10'
              }`}
            >
              {entry.label ?? `Vue ${index + 1}`}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
