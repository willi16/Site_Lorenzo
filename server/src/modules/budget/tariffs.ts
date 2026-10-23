import { z } from 'zod';

/**
 * Grille tarifaire indicative (FCFA) — par m² de surface de plancher.
 * Les fourchettes sont publiques et explicites : l'outil ne remplace pas un devis,
 * il donne un ordre de grandeur fiable avant le premier rendez-vous.
 */
export const TARIFFS = {
  RESIDENTIAL: {
    label: 'Construction résidentielle',
    min: 450_000,
    max: 750_000,
    base: 560_000,
    lead: '4 à 7 mois selon la taille du chantier',
  },
  COMMERCIAL: {
    label: 'Bâtiment commercial',
    min: 650_000,
    max: 1_100_000,
    base: 820_000,
    lead: '6 à 12 mois',
  },
  RENOVATION: {
    label: 'Rénovation et extension',
    min: 250_000,
    max: 550_000,
    base: 350_000,
    lead: '3 à 6 mois',
  },
  INTERIOR: {
    label: 'Aménagement intérieur',
    min: 300_000,
    max: 700_000,
    base: 420_000,
    lead: '2 à 5 mois',
  },
  EXTERIOR: {
    label: 'Aménagement extérieur',
    min: 150_000,
    max: 450_000,
    base: 240_000,
    lead: '2 à 4 mois',
  },
} as const;

export const FINISH_LEVELS = {
  STANDARD: { label: 'Standard', factor: 1, note: 'Matières courantes, finitions soignées' },
  SUPERIEUR: { label: 'Supérieur', factor: 1.25, note: 'Matières choisies, design signature' },
  LUXE: { label: 'Luxe', factor: 1.6, note: 'Finitions haut de gamme, matériaux nobles' },
} as const;

export const OPTIONS = {
  ARCHITECT: { label: 'Conception complète (plans + suivi)', factor: 0.12, flat: 0 },
  RENDUS_3D: { label: 'Rendus 3D photoréalistes', factor: 0.03, flat: 350_000 },
  BIM: { label: 'Étude BIM complète', factor: 0.04, flat: 500_000 },
  PAYSAGE: { label: 'Aménagement paysager', factor: 0, flat: 1_800_000 },
  PISCINE: { label: 'Piscine', factor: 0, flat: 6_500_000 },
  SOLAR: { label: 'Installation solaire', factor: 0, flat: 4_200_000 },
  MOBILIER: { label: 'Mobilier sur mesure', factor: 0, flat: 2_400_000 },
  SMART: { label: 'Domotique et gestion technique du bâtiment', factor: 0, flat: 3_100_000 },
} as const;

export type ProjectType = keyof typeof TARIFFS;
export type FinishLevel = keyof typeof FINISH_LEVELS;
export type OptionKey = keyof typeof OPTIONS;

export const estimateSchema = z.object({
  projectType: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'RENOVATION', 'INTERIOR', 'EXTERIOR']),
  area: z.coerce.number().min(10, 'Surface minimale : 10 m²').max(20_000, 'Surface maximale : 20 000 m²'),
  finish: z.enum(['STANDARD', 'SUPERIEUR', 'LUXE']).default('STANDARD'),
  options: z
    .array(z.enum(['ARCHITECT', 'RENDUS_3D', 'BIM', 'PAYSAGE', 'PISCINE', 'SOLAR', 'MOBILIER', 'SMART']))
    .max(8)
    .optional()
    .default([]),
  includeFees: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => (typeof v === 'boolean' ? v : v === 'true'))
    .default(true),
});

export type EstimateInput = z.infer<typeof estimateSchema>;

export interface EstimateResult {
  projectType: string;
  projectTypeLabel: string;
  area: number;
  finish: string;
  finishLabel: string;
  unitPrice: { min: number; max: number };
  options: { label: string; amount: number }[];
  estimate: {
    min: number;
    max: number;
    minFormatted: string;
    maxFormatted: string;
    perSquareMeter: number;
    perSquareMeterFormatted: string;
  };
  leadTime: string;
  disclaimer: string;
}

// `fr-FR` insère une espace fine insécable (U+202F) comme séparateur de milliers.
// La normalisation doit viser ce caractère, pas l'espace ASCII.
export const formatFcfa = (n: number) =>
  `${Math.round(n)
    .toLocaleString('fr-FR')
    .replace(/[\u202F\u00A0]/g, ' ')} FCFA`;

export function computeEstimate(input: EstimateInput): EstimateResult {
  const tariff = TARIFFS[input.projectType as ProjectType];
  const finish = FINISH_LEVELS[input.finish as FinishLevel];
  const area = input.area;

  const base = tariff.base * finish.factor;
  let low = base * area * 0.88;
  let high = base * area * 1.18;

  const optionBreakdown: { label: string; amount: number }[] = [];
  for (const optKey of input.options) {
    const opt = OPTIONS[optKey as OptionKey];
    if (!opt) continue;
    const amount = opt.flat + base * area * opt.factor;
    optionBreakdown.push({ label: opt.label, amount });
    low += amount * 0.9;
    high += amount * 1.1;
  }

  // Frais d'études et de maîtrise d'œuvre : 8 à 12 % du montant travaux
  if (input.includeFees) {
    low *= 1.08;
    high *= 1.12;
  }

  const rounded = (n: number) => Math.round(n / 50_000) * 50_000;
  const min = rounded(low);
  const max = rounded(high);

  return {
    projectType: input.projectType,
    projectTypeLabel: tariff.label,
    area,
    finish: input.finish,
    finishLabel: finish.label,
    unitPrice: { min: tariff.min, max: tariff.max },
    options: optionBreakdown,
    estimate: {
      min,
      max,
      minFormatted: formatFcfa(min),
      maxFormatted: formatFcfa(max),
      perSquareMeter: Math.round((min + max) / 2 / area),
      perSquareMeterFormatted: formatFcfa(Math.round((min + max) / 2 / area)),
    },
    leadTime: tariff.lead,
    disclaimer:
      'Estimation indicative basée sur les moyennes de marché au Togo en 2026. Elle ne constitue pas un devis et n’engage pas le cabinet. Un devis ferme est établi après visite technique du site.',
  };
}
