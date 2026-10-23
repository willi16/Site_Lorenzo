import {
  POST_CATEGORY_LABELS,
  PROJECT_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
  type AdminContentItem,
  type ContentEntity,
  type ContentOptions,
} from '@/lib/adminApi';

/**
 * Description déclarative d'un champ de formulaire. Le `ContentEditor` lit
 * cette configuration pour générer le formulaire, donc ajouter un champ ne
 * demande aucune modification du composant.
 */
export type FieldDef =
  | { name: string; label: string; type: 'text' | 'textarea'; required?: boolean; hint?: string; rows?: number; placeholder?: string }
  | { name: string; label: string; type: 'number'; required?: boolean; hint?: string; min?: number; max?: number; step?: number }
  | { name: string; label: string; type: 'boolean'; hint?: string }
  | { name: string; label: string; type: 'select'; required?: boolean; hint?: string; options: { value: string; label: string }[]; dynamic?: 'services' | 'testimonials' }
  | { name: string; label: string; type: 'image'; hint?: string }
  | { name: string; label: string; type: 'array'; hint?: string; placeholder?: string };

export interface ContentDef {
  entity: ContentEntity;
  singular: string;
  plural: string;
  /** Champ affiché comme titre dans la liste. */
  titleField: string;
  /** Champ booléen de visibilité (publié / actif). */
  visibilityField: 'published' | 'active';
  searchable: boolean;
  supportsStatusFilter: boolean;
  fields: FieldDef[];
  /** Regroupe visuellement les champs (index de début de section). */
  groups: { label: string; fields: string[] }[];
}

const boolOptions = [
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' },
];

/**
 * Options de visibilité proposées comme sélecteur explicite (plus clair qu'une
 * case à cocher pour du contenu éditorial).
 */
export const VISIBILITY_OPTIONS = boolOptions;

function entries(record: Record<string, string>) {
  return Object.entries(record).map(([value, label]) => ({ value, label }));
}

export const CONTENT_DEFS: Record<ContentEntity, ContentDef> = {
  posts: {
    entity: 'posts',
    singular: 'Article',
    plural: 'Actualités',
    titleField: 'title',
    visibilityField: 'published',
    searchable: true,
    supportsStatusFilter: true,
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'category', label: 'Catégorie', type: 'select', required: true, options: entries(POST_CATEGORY_LABELS) },
      { name: 'excerpt', label: 'Chapeau / résumé', type: 'textarea', required: true, rows: 3, hint: 'Affiché dans les listes et aperçus (10 à 320 caractères).' },
      { name: 'content', label: 'Contenu', type: 'textarea', required: true, rows: 12, hint: 'Texte de l’article (au moins 20 caractères).' },
      { name: 'coverImage', label: 'Image de couverture', type: 'image' },
      { name: 'tags', label: 'Mots-clés', type: 'array', placeholder: 'Ex. : construction' },
      { name: 'authorName', label: 'Auteur', type: 'text', required: true },
      { name: 'authorRole', label: 'Fonction de l’auteur', type: 'text' },
      { name: 'readMinutes', label: 'Temps de lecture (min)', type: 'number', min: 1, max: 60 },
      { name: 'published', label: 'Publié', type: 'select', options: boolOptions },
      { name: 'seoTitle', label: 'Titre SEO', type: 'text', hint: '70 caractères max.' },
      { name: 'seoDescription', label: 'Description SEO', type: 'text', hint: '160 caractères max.' },
    ],
    groups: [
      { label: 'Essentiel', fields: ['title', 'category', 'excerpt', 'content', 'coverImage'] },
      { label: 'Compléments', fields: ['tags', 'authorName', 'authorRole', 'readMinutes'] },
      { label: 'Publication & SEO', fields: ['published', 'seoTitle', 'seoDescription'] },
    ],
  },

  projects: {
    entity: 'projects',
    singular: 'Réalisation',
    plural: 'Réalisations',
    titleField: 'title',
    visibilityField: 'published',
    searchable: true,
    supportsStatusFilter: true,
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'subtitle', label: 'Sous-titre', type: 'text' },
      { name: 'category', label: 'Catégorie', type: 'select', required: true, options: entries(PROJECT_CATEGORY_LABELS) },
      { name: 'status', label: 'Avancement', type: 'select', required: true, options: entries(PROJECT_STATUS_LABELS) },
      { name: 'location', label: 'Localisation', type: 'text', required: true },
      { name: 'city', label: 'Ville', type: 'text' },
      { name: 'country', label: 'Pays', type: 'text' },
      { name: 'year', label: 'Année', type: 'number', required: true, min: 1990 },
      { name: 'area', label: 'Surface (m²)', type: 'number', required: true, min: 0, step: 0.1 },
      { name: 'budget', label: 'Budget (FCFA)', type: 'number', min: 0 },
      { name: 'budgetLabel', label: 'Budget (libellé)', type: 'text' },
      { name: 'clientName', label: 'Client', type: 'text' },
      { name: 'excerpt', label: 'Chapeau / résumé', type: 'textarea', required: true, rows: 3 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 8 },
      { name: 'challenges', label: 'Enjeux', type: 'textarea', rows: 4 },
      { name: 'solution', label: 'Solution', type: 'textarea', rows: 4 },
      { name: 'features', label: 'Prestations', type: 'array' },
      { name: 'materials', label: 'Matériaux', type: 'array' },
      { name: 'gallery', label: 'Galerie d’images', type: 'array', placeholder: 'URL d’image' },
      { name: 'coverImage', label: 'Image de couverture', type: 'image' },
      { name: 'videoUrl', label: 'Vidéo (URL)', type: 'text' },
      { name: 'virtualTourUrl', label: 'Visite virtuelle (URL)', type: 'text' },
      { name: 'serviceId', label: 'Service associé', type: 'select', dynamic: 'services', options: [] },
      { name: 'testimonialId', label: 'Témoignage associé', type: 'select', dynamic: 'testimonials', options: [] },
      { name: 'featured', label: 'Mis en avant', type: 'select', options: boolOptions },
      { name: 'order', label: 'Ordre d’affichage', type: 'number', min: 0 },
      { name: 'published', label: 'Publié', type: 'select', options: boolOptions },
      { name: 'seoTitle', label: 'Titre SEO', type: 'text' },
      { name: 'seoDescription', label: 'Description SEO', type: 'text' },
    ],
    groups: [
      { label: 'Essentiel', fields: ['title', 'subtitle', 'category', 'status', 'location', 'city', 'country', 'year', 'area'] },
      { label: 'Description', fields: ['excerpt', 'description', 'challenges', 'solution'] },
      { label: 'Détails', fields: ['budget', 'budgetLabel', 'clientName', 'features', 'materials'] },
      { label: 'Images & médias', fields: ['coverImage', 'gallery', 'videoUrl', 'virtualTourUrl'] },
      { label: 'Relations', fields: ['serviceId', 'testimonialId'] },
      { label: 'Publication & SEO', fields: ['featured', 'order', 'published', 'seoTitle', 'seoDescription'] },
    ],
  },

  services: {
    entity: 'services',
    singular: 'Service',
    plural: 'Services',
    titleField: 'title',
    visibilityField: 'published',
    searchable: true,
    supportsStatusFilter: true,
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true },
      { name: 'eyebrow', label: 'Surtitre', type: 'text' },
      { name: 'excerpt', label: 'Chapeau / résumé', type: 'textarea', required: true, rows: 3 },
      { name: 'description', label: 'Description', type: 'textarea', required: true, rows: 8 },
      { name: 'icon', label: 'Icône', type: 'text', hint: 'Nom d’icône lucide, ex. : Building2, Ruler, HardHat.' },
      { name: 'coverImage', label: 'Image', type: 'image' },
      { name: 'highlights', label: 'Points forts', type: 'array' },
      { name: 'deliverables', label: 'Livrables', type: 'array' },
      { name: 'processNote', label: 'Note de méthode', type: 'textarea', rows: 4 },
      { name: 'featured', label: 'Mis en avant', type: 'select', options: boolOptions },
      { name: 'order', label: 'Ordre d’affichage', type: 'number', min: 0 },
      { name: 'published', label: 'Publié', type: 'select', options: boolOptions },
      { name: 'seoTitle', label: 'Titre SEO', type: 'text' },
      { name: 'seoDescription', label: 'Description SEO', type: 'text' },
    ],
    groups: [
      { label: 'Essentiel', fields: ['title', 'eyebrow', 'excerpt', 'description', 'icon', 'coverImage'] },
      { label: 'Détails', fields: ['highlights', 'deliverables', 'processNote'] },
      { label: 'Publication & SEO', fields: ['featured', 'order', 'published', 'seoTitle', 'seoDescription'] },
    ],
  },

  testimonials: {
    entity: 'testimonials',
    singular: 'Témoignage',
    plural: 'Témoignages',
    titleField: 'authorName',
    visibilityField: 'published',
    searchable: false,
    supportsStatusFilter: false,
    fields: [
      { name: 'authorName', label: 'Nom du client', type: 'text', required: true },
      { name: 'authorRole', label: 'Fonction', type: 'text' },
      { name: 'company', label: 'Entreprise', type: 'text' },
      { name: 'quote', label: 'Témoignage', type: 'textarea', required: true, rows: 5 },
      { name: 'rating', label: 'Note (1 à 5)', type: 'number', min: 1, max: 5 },
      { name: 'avatar', label: 'Photo', type: 'image' },
      { name: 'order', label: 'Ordre d’affichage', type: 'number', min: 0 },
      { name: 'published', label: 'Publié', type: 'select', options: boolOptions },
    ],
    groups: [
      { label: 'Témoignage', fields: ['authorName', 'authorRole', 'company', 'quote', 'rating', 'avatar'] },
      { label: 'Publication', fields: ['order', 'published'] },
    ],
  },

  team: {
    entity: 'team',
    singular: 'Membre',
    plural: 'Équipe',
    titleField: 'name',
    visibilityField: 'active',
    searchable: false,
    supportsStatusFilter: false,
    fields: [
      { name: 'name', label: 'Nom', type: 'text', required: true },
      { name: 'role', label: 'Poste', type: 'text', required: true },
      { name: 'bio', label: 'Biographie', type: 'textarea', required: true, rows: 6 },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Téléphone', type: 'text' },
      { name: 'linkedin', label: 'LinkedIn (URL)', type: 'text' },
      { name: 'skills', label: 'Compétences', type: 'array' },
      { name: 'order', label: 'Ordre d’affichage', type: 'number', min: 0 },
      { name: 'active', label: 'Actif', type: 'select', options: boolOptions },
    ],
    groups: [
      { label: 'Identité', fields: ['name', 'role', 'bio', 'photo'] },
      { label: 'Contact', fields: ['email', 'phone', 'linkedin'] },
      { label: 'Compléments', fields: ['skills', 'order', 'active'] },
    ],
  },
};

/** Options du sélecteur dynamique (relations services / témoignages). */
export function dynamicOptions(
  kind: 'services' | 'testimonials',
  options: ContentOptions | null,
): { value: string; label: string }[] {
  if (!options) return [];
  if (kind === 'services') {
    return options.services.map((s) => ({ value: s.id, label: s.title }));
  }
  return options.testimonials.map((t) => ({
    value: t.id,
    label: t.company ? `${t.authorName} — ${t.company}` : t.authorName,
  }));
}

/** Convertit un enregistrement serveur en valeurs de formulaire. */
export function itemToForm(item: AdminContentItem): Record<string, unknown> {
  const record: Record<string, unknown> = { ...item };
  return record;
}
