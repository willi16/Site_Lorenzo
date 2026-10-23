const fcfa = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function formatNumber(value: number): string {
  return fcfa.format(value);
}

export function formatFcfa(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${fcfa.format(value)} FCFA`;
}

export function formatEuros(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} €`;
}

export function formatArea(sqm: number): string {
  return `${fcfa.format(sqm)} m²`;
}

export function formatDate(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateShort(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export const CATEGORY_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Résidentiel',
  COMMERCIAL: 'Commercial',
  RENOVATION: 'Rénovation',
  INTERIOR: 'Intérieur',
  EXTERIOR: 'Extérieur',
};

export const CATEGORY_SLUGS: Record<string, string> = {
  RESIDENTIAL: 'residentiel',
  COMMERCIAL: 'commercial',
  RENOVATION: 'renovation',
  INTERIOR: 'interieur',
  EXTERIOR: 'exterieur',
};

export const STATUS_LABELS: Record<string, string> = {
  CONCEPT: 'En conception',
  IN_PROGRESS: 'En chantier',
  COMPLETED: 'Livré',
};

export const POST_CATEGORY_LABELS: Record<string, string> = {
  CONSEILS: 'Conseils architecture',
  TENDANCES: 'Tendances & innovations',
  PROJETS: 'Projets récents',
  REGLEMENTATION: 'Réglementation',
  DURABLE: 'Développement durable',
  MATERIAUX: 'Matériaux & techniques',
};

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 210));
}
