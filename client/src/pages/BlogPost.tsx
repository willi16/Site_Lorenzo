import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Facebook, Linkedin, Share2 } from 'lucide-react';
import { Seo, absoluteUrl, articleSchema, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { POST_CATEGORY_LABELS, formatDate } from '@/lib/format';
import { ButtonLink, Container, Section, SectionHeading, Card, Badge } from '@/components/ui/primitives';
import { ProjectImage } from '@/components/ui/ProjectImage';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { blogPostLoader, useLoaderDataOf } from '@/app/loaders';

export default function BlogPostPage() {
  const { post, related } = useLoaderDataOf<typeof blogPostLoader>();
  const shareUrl = absoluteUrl(`/actualites/${post.slug}`);

  const paragraphs = post.content.split('\n\n').filter(Boolean);

  return (
    <>
      <Seo
        title={post.seoTitle ?? `${post.title} — B.A. Construction`}
        description={post.seoDescription ?? post.excerpt}
        canonical={`/actualites/${post.slug}`}
        image={post.coverImage ?? '/og-image.png'}
        type="article"
        publishedTime={post.publishedAt}
        author={post.authorName}
        keywords={post.tags}
        jsonLd={[
          organizationSchema(),
          articleSchema({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            image: post.coverImage,
            publishedAt: post.publishedAt,
            author: post.authorName,
            readMinutes: post.readMinutes,
          }),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Actualités', url: '/actualites' },
            { name: post.title, url: `/actualites/${post.slug}` },
          ]),
        ]}
      />

      <article>
        <section className="bg-navy-800 pb-14 pt-32 text-white sm:pb-16 sm:pt-40">
          <Container>
            <Breadcrumbs
              tone="light"
              items={[
                { label: 'Actualités', to: '/actualites' },
                { label: post.title },
              ]}
            />

            <div className="mt-7 max-w-3xl">
              <Badge tone="light" className="border border-white/15 bg-white/10">
                {POST_CATEGORY_LABELS[post.category] ?? post.category}
              </Badge>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.12] tracking-tight [text-shadow:0_1px_16px_rgba(4,12,20,0.5)] sm:text-4xl lg:text-[2.9rem]">
                {post.title}
              </h1>
              <p className="mt-5 text-base leading-relaxed text-white/80 sm:text-lg">{post.excerpt}</p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/12 pt-5 text-sm text-white/65">
                <span className="font-semibold text-white/85">{post.authorName}</span>
                {post.authorRole ? <span>{post.authorRole}</span> : null}
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {post.readMinutes} min de lecture
                </span>
              </div>
            </div>
          </Container>
        </section>

        {post.coverImage ? (
          <div className="-mt-px">
            <Container size="wide">
              <ProjectImage
                src={post.coverImage}
                alt={post.title}
                seed={post.slug}
                ratio="aspect-[21/9]"
                priority
                className="mt-10 rounded-2xl shadow-lift"
              />
            </Container>
          </div>
        ) : null}

        <Section spacing="tight">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_260px] lg:gap-14">
              <div className="max-w-2xl">
                <div className="space-y-5 text-[1.02rem] leading-[1.8] text-ink-700">
                  {paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                {post.tags.length > 0 ? (
                  <div className="mt-10 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest2 text-ink-400">
                      Mots-clés
                    </span>
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/actualites?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-ink-800/10 bg-white px-3 py-1 text-xs font-medium text-ink-600 transition hover:border-navy-700/30 hover:text-navy-800"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                ) : null}

                <div className="mt-10 flex items-center justify-between gap-4 border-t border-ink-800/[0.08] pt-6">
                  <p className="text-sm font-semibold text-ink-600">Partager cet article</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-800/10 text-ink-600 transition hover:border-clay-500 hover:text-clay-600"
                      aria-label="Partager sur Facebook"
                    >
                      <Facebook className="h-4 w-4" aria-hidden />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-800/10 text-ink-600 transition hover:border-clay-500 hover:text-clay-600"
                      aria-label="Partager sur LinkedIn"
                    >
                      <Linkedin className="h-4 w-4" aria-hidden />
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-800/10 text-ink-600 transition hover:border-clay-500 hover:text-clay-600"
                      aria-label="Partager sur WhatsApp"
                    >
                      <Share2 className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </div>

                <Link
                  to="/actualites"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-clay-600 transition hover:gap-3"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Retour aux actualités
                </Link>
              </div>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <Card className="p-6">
                  <p className="text-xs font-bold uppercase tracking-widest2 text-ink-400">Auteur</p>
                  <p className="mt-3 font-display text-base font-bold text-navy-800">
                    {post.authorName}
                  </p>
                  {post.authorRole ? (
                    <p className="mt-0.5 text-sm text-ink-500">{post.authorRole}</p>
                  ) : null}
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    L’équipe de B.A. Construction partage ce qu’elle apprend sur le terrain, à Lomé
                    et partout au Togo.
                  </p>
                </Card>
              </aside>
            </div>
          </Container>
        </Section>

        {related.length > 0 ? (
          <Section tone="cream">
            <Container>
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <SectionHeading eyebrow="À lire ensuite" title="D’autres articles du blog" />
                <ButtonLink
                  to="/actualites"
                  variant="outline"
                  className="shrink-0"
                  iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
                >
                  Tous les articles
                </ButtonLink>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                  >
                    <Card className="group h-full overflow-hidden">
                      <Link to={`/actualites/${item.slug}`} className="block">
                        <ProjectImage
                          src={item.coverImage}
                          alt={item.title}
                          seed={item.slug}
                          ratio="aspect-[16/10]"
                        />
                      </Link>
                      <div className="p-6">
                        <h3 className="font-display text-base font-bold leading-snug text-navy-800">
                          <Link
                            to={`/actualites/${item.slug}`}
                            className="transition-colors hover:text-clay-600 after:absolute after:inset-0"
                          >
                            {item.title}
                          </Link>
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-ink-600">{item.excerpt}</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Container>
          </Section>
        ) : null}
      </article>
    </>
  );
}
