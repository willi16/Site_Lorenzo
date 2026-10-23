export const CONTACT = {
  name: 'B.A. Construction',
  legalName: 'B.A. Construction — Cabinet d’architecture & de construction',
  tagline: 'Lundi Bâtisseur',
  phone: '+228 91 08 55 50',
  phoneRaw: '+22891085550',
  phoneHref: 'tel:+22891085550',
  whatsapp: 'https://wa.me/22891085550',
  email: 'contact@ba-construction.tg',
  address: 'Boulevard du Mono, Tokoin',
  city: 'Lomé',
  country: 'Togo',
  postalCode: null,
  geo: { lat: 6.1256, lng: 1.2254 },
  hours: [
    { days: 'Lundi — Vendredi', time: '08:00 — 18:00' },
    { days: 'Samedi', time: '09:00 — 14:00' },
    { days: 'Dimanche', time: 'Fermé' },
  ],
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/ba.construction', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/ba.construction', icon: 'facebook' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ba-construction', icon: 'linkedin' },
    { label: 'Pinterest', href: 'https://www.pinterest.com/ba_construction', icon: 'pinterest' },
    { label: 'Houzz', href: 'https://www.houzz.com/pro/ba-construction', icon: 'home' },
  ],
  mapsEmbed:
    'https://www.google.com/maps?q=Tokoin,+Lome,+Togo&z=14&output=embed',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Tokoin%2C%20Lome%2C%20Togo',
} as const;

export const PROJECT_TYPES = [
  'Construction résidentielle',
  'Bâtiment commercial',
  'Rénovation et extension',
  'Aménagement intérieur',
  'Aménagement extérieur',
  'Suivi de chantier',
  'Conseil et expertise',
  'Autre',
] as const;

export const BUDGET_RANGES = [
  'Moins de 5 M FCFA',
  '5 – 15 M FCFA',
  '15 – 50 M FCFA',
  '50 – 100 M FCFA',
  'Plus de 100 M FCFA',
  'À définir',
] as const;

export const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Réalisations', to: '/realisations' },
  { label: 'Le Cabinet', to: '/le-cabinet' },
  { label: 'Méthodologie', to: '/methodologie' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Contact', to: '/contact' },
] as const;

export const FOOTER_LINKS = {
  services: [
    { label: 'Architecture résidentielle', to: '/services/architecture-residentielle' },
    { label: 'Architecture commerciale', to: '/services/architecture-commerciale' },
    { label: 'Rénovation et extension', to: '/services/renovation-et-extension' },
    { label: 'Aménagement intérieur', to: '/services/amenagement-interieur' },
    { label: 'Aménagement extérieur', to: '/services/amenagement-exterieur' },
    { label: 'Suivi de chantier', to: '/services/suivi-de-chantier' },
  ],
  cabinet: [
    { label: 'Le cabinet', to: '/le-cabinet' },
    { label: 'Notre équipe', to: '/le-cabinet#equipe' },
    { label: 'Méthodologie', to: '/methodologie' },
    { label: 'Certifications', to: '/le-cabinet#certifications' },
    { label: 'Partenaires', to: '/le-cabinet#partenaires' },
  ],
  tools: [
    { label: 'Calculateur de budget', to: '/budget' },
    { label: 'Comparer des projets', to: '/comparateur' },
    { label: 'Demander un devis', to: '/contact' },
    { label: 'Prendre rendez-vous', to: '/contact#rendez-vous' },
  ],
  legal: [
    { label: 'Mentions légales', to: '/mentions-legales' },
    { label: 'Politique de confidentialité', to: '/confidentialite' },
    { label: 'Gestion des cookies', to: '/cookies' },
  ],
} as const;
