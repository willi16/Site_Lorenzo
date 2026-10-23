/**
 * Normalise un texte en identifiant d'URL (slug).
 * « Réhabilitation à Kégué » → « rehabilitation-a-kegue »
 */
export function slugify(value: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);

  return base || 'sans-titre';
}

/**
 * Retourne un slug unique : si le slug est déjà pris, ajoute -2, -3, etc.
 * `isTaken` doit exclure l'enregistrement en cours de modification.
 */
export async function uniqueSlug(
  isTaken: (slug: string) => Promise<boolean>,
  desired: string,
): Promise<string> {
  const base = slugify(desired);
  let candidate = base;
  let suffix = 2;
  while (await isTaken(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}
