import { Clock, Cookie, FileText, Lock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Seo, breadcrumbSchema, organizationSchema } from '@/lib/seo';
import { CONTACT } from '@/lib/constants';
import { Container, Section, Card, ButtonLink } from '@/components/ui/primitives';
import { PageHero } from '@/components/sections/PageHero';

type Variant = 'mentions' | 'confidentialite' | 'cookies';

interface LegalBlock {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: { label: string; value: string }[];
}

const CONTENT: Record<Variant, { title: string; description: string; blocks: LegalBlock[] }> = {
  mentions: {
    title: 'Mentions légales',
    description:
      'Éditeur, hébergeur, propriété intellectuelle et responsabilité éditoriale du site B.A. Construction.',
    blocks: [
      {
        id: 'editeur',
        title: 'Éditeur du site',
        paragraphs: [
          'Ce site est édité par B.A. Construction, cabinet d’architecture et de construction immatriculé au Togo, exerçant son activité à Lomé.',
          `Adresse : ${CONTACT.address}, ${CONTACT.city}, ${CONTACT.country}. Téléphone : ${CONTACT.phone}. E-mail : ${CONTACT.email}.`,
        ],
        table: [
          { label: 'Dénomination sociale', value: 'B.A. Construction' },
          { label: 'Nature de l’activité', value: 'Architecture, construction, rénovation' },
          { label: 'Siège social', value: `${CONTACT.address}, ${CONTACT.city}` },
          { label: 'Téléphone', value: CONTACT.phone },
          { label: 'E-mail', value: CONTACT.email },
          { label: 'Directeur de la publication', value: 'La direction de B.A. Construction' },
        ],
      },
      {
        id: 'hebergement',
        title: 'Hébergement',
        paragraphs: [
          'Le site est hébergé sur une infrastructure de serveur située dans l’Union Européenne. Les noms, adresses IP et journaux techniques sont conservés par l’hébergeur pour la durée légale de conservation applicable.',
          'Pour toute question technique relative à l’hébergement, vous pouvez nous écrire via le formulaire de contact.',
        ],
      },
      {
        id: 'propriete',
        title: 'Propriété intellectuelle',
        paragraphs: [
          'L’ensemble des éléments composant ce site — structure, textes, photographies, plans, rendus 3D, identité visuelle, schémas et code source — est la propriété exclusive de B.A. Construction ou fait l’objet d’une autorisation d’utilisation.',
          'Toute reproduction, représentation, modification, publication, adaptation ou exploitation, totale ou partielle, de tout ou partie des éléments du site, par quelque procédé et sur quelque support que ce soit, est interdite sans autorisation écrite préalable.',
          'Les plans, rendus et visuels de projets publiés sur ce site peuvent être réutilisés à des fins de présentation (presse, portfolios, appels d’offres) à condition que la mention « B.A. Construction » reste visible et que la source soit mentionnée.',
        ],
      },
      {
        id: 'responsabilite',
        title: 'Limitation de responsabilité',
        paragraphs: [
          'B.A. Construction s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, elle ne peut garantir que ces informations soient exemptes d’erreurs, d’omissions ou d’inexactitudes.',
          'Les estimations financières disponibles sur ce site (calculateur de budget, fourchettes de prix au m²) sont fournies à titre indicatif. Elles ne constituent pas un devis et n’engagent pas le cabinet sur un montant final.',
          'B.A. Construction ne pourra être tenue responsable des dommages directs ou indirects résultant de l’accès au site, de son utilisation, ou de l’indisponibilité temporaire du service.',
        ],
      },
      {
        id: 'liens',
        title: 'Liens hypertextes',
        paragraphs: [
          'Le site peut contenir des liens vers des sites tiers. Ces liens sont proposés à titre informatif et B.A. Construction n’exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.',
        ],
      },
      {
        id: 'droit',
        title: 'Droit applicable',
        paragraphs: [
          'Les présentes mentions légales sont régies par la loi togolaise. À défaut de résolution amiable, tout litige relève de la compétence des tribunaux de Lomé.',
        ],
      },
    ],
  },
  confidentialite: {
    title: 'Politique de confidentialité',
    description:
      'Quelles données nous collectons, pourquoi, combien de temps nous les conservons et comment exercer vos droits.',
    blocks: [
      {
        id: 'principe',
        title: 'Notre engagement',
        paragraphs: [
          'B.A. Construction collecte le minimum de données nécessaire pour répondre à vos demandes, vous accompagner dans votre projet et améliorer nos prestations. Nous ne vendons jamais vos données, nous ne les transmettons à aucun tiers à des fins commerciales.',
        ],
      },
      {
        id: 'donnees',
        title: 'Données collectées',
        table: [
          {
            label: 'Formulaire de contact',
            value:
              'Nom, prénom, e-mail, téléphone, type de projet, superficie, budget, localisation, description, pièces jointes éventuelles',
          },
          {
            label: 'Newsletter',
            value: 'Adresse e-mail uniquement, après double confirmation (double opt-in)',
          },
          {
            label: 'Espace administrateur',
            value: 'Adresse e-mail, nom, rôle, mot de passe chiffré (scrypt), journaux de connexion',
          },
          { label: 'Cookies', value: 'Identifiant de session, préférences de cookie, mesure d’audience anonymisée' },
        ],
      },
      {
        id: 'finalites',
        title: 'Finalités et base légale',
        bullets: [
          'Répondre à une demande de devis ou de rendez-vous : exécution de mesures précontractuelles à votre demande.',
          'Vous informer de l’avancement d’un projet en cours : exécution du contrat.',
          'Envoyer la newsletter et les actualités du cabinet : votre consentement.',
          'Assurer la sécurité du site (limitation des tentatives d’abus) : intérêt légitime de B.A. Construction.',
          'Produire les statistiques internes du cabinet (nombre de demandes, taux de conversion) : intérêt légitime, données agrégées.',
        ],
      },
      {
        id: 'conservation',
        title: 'Durées de conservation',
        bullets: [
          'Demandes de devis non converties : 3 ans à compter du dernier contact, puis suppression.',
          'Dossiers clients en cours : durée du contrat, puis 10 ans (obligations comptables et d’archivage).',
          'Abonnés à la newsletter : jusqu’au retrait du consentement, vérifié au moins tous les 3 ans.',
          'Journaux de connexion et d’audit : 12 mois.',
          'Cookies de mesure d’audience : 13 mois maximum.',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies',
        paragraphs: [
          'Le site utilise des cookies strictement nécessaires à son fonctionnement (session, jeton CSRF, mémorisation du choix de consentement) et, après votre accord, des cookies de mesure d’audience anonymisée. Vous pouvez à tout moment retirer votre consentement depuis le bandeau cookies ou depuis la page « Gestion des cookies ».',
        ],
      },
      {
        id: 'droits',
        title: 'Vos droits',
        paragraphs: [
          'Conformément à la réglementation applicable, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment.',
          `Pour les exercer, écrivez à ${CONTACT.email} ou par courrier à ${CONTACT.address}, ${CONTACT.city}. Nous répondons dans un délai maximal d’un mois. Vous disposez également du droit d’introduire une réclamation auprès de l’autorité de protection des données compétente.`,
        ],
      },
      {
        id: 'securite',
        title: 'Sécurité',
        paragraphs: [
          'Les mots de passe sont chiffrés avec scrypt et ne sont jamais stockés en clair. Les jetons de session sont signés, à durée de vie courte, et renouvelés par rotation. Les envois de requêtes sont protégés par une politique d’en-têtes de sécurité (CSP), un contrôle d’origine (CORS) et une limitation de débit. Les pièces jointes reçues sont stockées hors du dossier public et ne sont accessibles qu’aux personnes autorisées.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Gestion des cookies',
    description:
      'Ce que nous déposons dans votre navigateur, pourquoi, et comment tout désactiver ou retirer votre accord.',
    blocks: [
      {
        id: 'principe',
        title: 'Principe',
        paragraphs: [
          'Un cookie est un petit fichier déposé par un site dans votre navigateur. Certains sont indispensables au fonctionnement du site ; d’autres, optionnels, servent à mesurer l’audience ou à mémoriser vos préférences. Les cookies optionnels ne sont déposés qu’après votre consentement explicite.',
        ],
      },
      {
        id: 'tableau',
        title: 'Cookies utilisés',
        table: [
          { label: 'ba_csrf', value: 'Strictement nécessaire — jeton anti-CSRF (session)' },
          { label: 'ba_refresh', value: 'Strictement nécessaire — maintien de la session administrateur (7 jours)' },
          { label: 'ba_cookie_consent', value: 'Strictement nécessaire — mémorise votre choix (12 mois)' },
          { label: 'ba_session', value: 'Strictement nécessaire — session applicative' },
          { label: '_ba_analytics', value: 'Mesure d’audience anonymisée — uniquement après consentement (13 mois)' },
        ],
      },
      {
        id: 'gestion',
        title: 'Gérer vos préférences',
        paragraphs: [
          'Vous pouvez accepter, refuser ou retirer votre consentement à tout moment. Le retrait est aussi simple que l’acceptation : il suffit de vider les cookies de votre navigateur pour le site.',
          `Pour toute question, écrivez-nous à ${CONTACT.email}.`,
        ],
      },
      {
        id: 'navigateurs',
        title: 'Régler votre navigateur',
        paragraphs: [
          'Tous les navigateurs modernes permettent de bloquer ou de supprimer les cookies, site par site. Cette action réduit parfois l’expérience de navigation (la session administrateur ne peut plus être conservée) et n’affecte pas la consultation publique du site.',
        ],
      },
    ],
  },
};

const ICONS: Record<string, typeof FileText> = {
  FileText,
  ShieldCheck,
  Cookie,
  Lock,
};

export default function LegalPage({ variant }: { variant: Variant }) {
  const content = CONTENT[variant];

  return (
    <>
      <Seo
        title={`${content.title} — B.A. Construction`}
        description={content.description}
        canonical={
          variant === 'mentions'
            ? '/mentions-legales'
            : variant === 'confidentialite'
              ? '/confidentialite'
              : '/cookies'
        }
        jsonLd={[
          organizationSchema(),
          breadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: content.title, url: `/${variant}` },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Informations légales"
        title={content.title}
        description={content.description}
        breadcrumbs={[{ label: content.title }]}
      />

      <Section spacing="tight">
        <Container size="narrow">
          <div className="space-y-6">
            {content.blocks.map((block, index) => {
              const Icon = ICONS[block.title] ?? FileText;
              return (
                <Card key={block.id} className="p-7" as="article">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700/8 text-navy-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-lg font-extrabold text-navy-800">
                        <span className="mr-2 text-sm font-bold text-clay-500">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {block.title}
                      </h2>

                      {block.paragraphs?.map((paragraph) => (
                        <p
                          key={paragraph.slice(0, 40)}
                          className="mt-3 text-sm leading-relaxed text-ink-600"
                        >
                          {paragraph}
                        </p>
                      ))}

                      {block.bullets ? (
                        <ul className="mt-4 space-y-2">
                          {block.bullets.map((bullet) => (
                            <li key={bullet} className="flex gap-2.5 text-sm text-ink-600">
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500"
                                aria-hidden
                              />
                              <span className="leading-relaxed">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {block.table ? (
                        <div className="mt-4 overflow-hidden rounded-xl border border-ink-800/[0.07]">
                          <table className="w-full text-left text-sm">
                            <tbody>
                              {block.table.map((row) => (
                                <tr key={row.label} className="border-b border-ink-800/[0.06] last:border-0">
                                  <th
                                    scope="row"
                                    className="w-1/3 bg-ink-800/[0.02] px-4 py-3 align-top font-semibold text-navy-800"
                                  >
                                    {row.label}
                                  </th>
                                  <td className="px-4 py-3 align-top text-ink-600">{row.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="mt-8 p-7">
            <h2 className="font-display text-lg font-extrabold text-navy-800">
              Une question sur ce document ?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Nous répondons à toute question relative à vos données ou à l’utilisation du site.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <ButtonLink to="/contact" icon={<Mail className="h-4 w-4" aria-hidden />}>
                Nous écrire
              </ButtonLink>
              <ButtonLink
                to="/contact"
                variant="outline"
                icon={<Phone className="h-4 w-4" aria-hidden />}
              >
                {CONTACT.phone}
              </ButtonLink>
              <ButtonLink
                to="/contact"
                variant="ghost"
                icon={<MapPin className="h-4 w-4" aria-hidden />}
              >
                {CONTACT.city}
              </ButtonLink>
              <ButtonLink
                to="/mentions-legales"
                variant="ghost"
                icon={<Clock className="h-4 w-4" aria-hidden />}
              >
                Horaires
              </ButtonLink>
            </div>
            <p className="mt-5 flex items-center gap-1.5 text-xs text-ink-400">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Document mis à jour en 2026 — version en vigueur sur cette page.
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
