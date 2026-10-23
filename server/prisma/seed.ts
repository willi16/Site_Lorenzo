/**
 * Seed B.A. Construction
 *
 * Remplit la base avec le contenu réel du cabinet : prestations, réalisations,
 * publications, équipe, témoignages, certifications, processus et statistiques.
 * Le script est idempotent : il peut être rejoué sans dupliquer de données.
 *
 *   npm run db:seed
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';
import { PrismaClient, type ProjectCategory, type ProjectStatus } from '@prisma/client';
import { hashPassword } from '../src/lib/password.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Le .env vit à la racine du dépôt : on le charge explicitement pour que le
// seed lise SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD et DATABASE_URL.
loadEnv({ path: path.resolve(here, '../../.env') });
loadEnv({ path: path.resolve(here, '../.env') });

const prisma = new PrismaClient();

/* ─────────────────────────────── Services ────────────────────────────────── */

const services = [
  {
    slug: 'architecture-residentielle',
    title: 'Architecture résidentielle',
    eyebrow: 'Habiter',
    icon: 'Home',
    excerpt:
      'Maisons individuelles, villas et immeubles familiaux. On dessine des logements qui respirent à Lomé, sans rogner sur votre budget.',
    description:
      "Une maison à Lomé vit au rythme de deux saisons. L'air marin monte du sud presque toute l'année ; en avril, l'air devient lourd et il faut pouvoir le faire circuler sans climatiser chaque pièce. On commence donc toujours par marcher sur le terrain — à Tokoin comme à Agoè — pour regarder d'où vient le vent, où tombe l'ombre à midi, comment la parcelle se draine quand il pleut fort. On en tire un plan, puis trois niveaux de finition chiffrés ligne par ligne : maçonnerie, toiture, menuiserie, électricité. Vous savez ce que coûte chaque choix avant de le faire.",
    highlights: [
      'Visite du terrain et étude de constructibilité',
      'Plans d’exécution, coupes et élévations',
      'Devis quantitatif détaillé par corps d’état',
      'Dossier de permis de construire monté et déposé',
      'Visite de chantier chaque semaine, photos à l’appui',
      'Réception et levée des réserves jusqu’à la remise des clés',
    ],
    deliverables: [
      'Dossier de plans complet (niveaux, coupes, façades, toiture)',
      'Notice descriptive des ouvrages',
      'Devis détaillé par lots, quantités et prix unitaires',
      'Images 3D des pièces de vie et des façades',
      'Carnet de chantier photographique hebdomadaire',
    ],
    processNote:
      'Comptez 4 à 7 mois pour une maison de 120 à 200 m². Le permis de construire à lui seul peut prendre 4 à 10 semaines selon la commune.',
    seoTitle: 'Architecture résidentielle à Lomé — Maisons et villas | B.A. Construction',
    seoDescription:
      'Conception de maisons et villas à Lomé : visite de terrain, plans d’exécution, permis de construire et suivi de chantier hebdomadaire.',
    featured: true,
    order: 1,
  },
  {
    slug: 'architecture-commerciale',
    title: 'Architecture commerciale',
    eyebrow: 'Entreprendre',
    icon: 'Building2',
    excerpt:
      'Bureaux, boutiques, ateliers, entrepôts. On conçoit des locaux qui se louent, se remplissent et se gèrent sans mauvaise surprise.',
    description:
      'Un local commercial se juge au compteur, pas au vernis. Ce qui compte, c’est la surface réellement exploitable : entrez-vous des clients sans traverser la réserve ? Les livraisons peuvent-elles arriver côté arrière ? La cuisine de votre restaurant évacue-t-elle correctement ? On part du fonctionnement de votre activité — chiffre d’affaires visé, effectif, flux — puis on dessine les plateaux, les circulations et les réseaux. On pense aussi au lendemain : un local divisible se revend et se reloue mieux quand l’activité évolue.',
    highlights: [
      'Analyse du programme et du modèle économique',
      'Plans d’exécution et coordination technique',
      'Conformité accessibilité PMR et sécurité incendie',
      'Étude d’ensoleillement et de confort thermique',
      'Assistance au dossier administratif',
      'Pilotage des corps d’état jusqu’à l’ouverture',
    ],
    deliverables: [
      'Programme architectural et schémas d’aménagement',
      'Plans d’exécution et plans de synthèse technique',
      'Dossier accessibilité et sécurité incendie',
      'Notice des matériaux et échantillons',
      'Planning général d’exécution',
    ],
    processNote:
      'De 6 à 12 mois, selon la surface et le temps d’instruction administratif.',
    seoTitle: 'Architecture commerciale au Togo — Bureaux et commerces | B.A. Construction',
    seoDescription:
      'Conception de bureaux, commerces et équipements au Togo : programme, plans d’exécution, accessibilité PMR, sécurité incendie et suivi de chantier.',
    featured: true,
    order: 2,
  },
  {
    slug: 'renovation-et-extension',
    title: 'Rénovation et extension',
    eyebrow: 'Transformer',
    icon: 'Hammer',
    excerpt:
      'Réhabiliter, agrandir, surélever, mettre aux normes. On redonne de la valeur à un bâti existant plutôt que de tout raser.',
    description:
      "On rénove beaucoup de maisons des années 70 à Lomé, souvent fissurées en pied de mur, avec un dallage qui a bougé et des réseaux jamais repris. Avant de proposer quoi que ce soit, on fait un diagnostic : on relève la structure, on teste l’humidité, on regarde ce qui peut être gardé. Ensuite, on vous présente les options côte à côte — réparation lourde, extension qui gagne de la surface, ou transformation d’usage — avec un prix pour chacune. Beaucoup de nos clients restent dans leur maison pendant les travaux ; on organise le chantier en phases pour que ce soit possible.",
    highlights: [
      'Diagnostic de structure, réseaux et humidité',
      'Simulations avant / après',
      'Extension et surélévation calculées par un ingénieur',
      'Reprise des réseaux électriques et sanitaires',
      'Pilotage des artisans, lot par lot',
      'Chantier phasé pour rester habitable',
    ],
    deliverables: [
      'Rapport de diagnostic de l’existant',
      'Plans de rénovation et d’extension',
      'Devis par lot, avec provision pour imprévus',
      'Calendrier d’intervention et plan de phasage',
      'Suivi photographique du chantier',
    ],
    processNote:
      'De 3 à 6 mois. Le phasage est pensé pour que vous puissiez rester chez vous la plupart du temps.',
    seoTitle: 'Rénovation et extension à Lomé — Réhabilitation de bâtiments | B.A. Construction',
    seoDescription:
      'Rénovation, extension et surélévation à Lomé : diagnostic de l’existant, avant/après, devis par lot et chantier phasé.',
    featured: true,
    order: 3,
  },
  {
    slug: 'amenagement-interieur',
    title: 'Aménagement intérieur',
    eyebrow: 'Composer',
    icon: 'Armchair',
    excerpt:
      'Agencement, éclairage, matériaux, mobilier sur mesure. On part de vos habitudes pour dessiner un intérieur qui vous ressemble.',
    description:
      "Un bon intérieur se dessine en partant de la vie qu’on y mène : où vous rangez le linge, si vous aimez petit-déjeuner dehors, si le bureau travaille le soir. On écoute avant de dessiner. Puis viennent les volumes, les matières et surtout la lumière — un plafonnier au centre d’une pièce éclaire mal et fatigue les yeux. On choisit des matériaux qui vieillissent bien sous ce climat et qui restent entretenables par une famille, pas par une équipe d’entretien. Le mobilier sur mesure est fabriqué chez nous, à Lomé.",
    highlights: [
      'Écoute des usages et relevé des contraintes',
      'Plans d’agencement 2D et 3D',
      'Carnet de matériaux et échantillons à toucher',
      'Plans d’éclairage et de plafond',
      'Atelier de fabrication du mobilier, à Lomé',
    ],
    deliverables: [
      'Plans d’agencement et coupes',
      'Carnet de matériaux et nuancier',
      'Planches d’ambiance',
      'Plans de plafond et de lumière',
      'Bordereau détaillé du mobilier sur mesure',
    ],
    processNote: 'De 2 à 5 mois, selon les volumes et le délai de fabrication du mobilier.',
    seoTitle: 'Aménagement intérieur à Lomé — Design d’intérieur | B.A. Construction',
    seoDescription:
      'Design d’intérieur et agencement à Lomé : plans 2D/3D, carnet de matériaux, plans d’éclairage et mobilier sur mesure fabriqué localement.',
    featured: true,
    order: 4,
  },
  {
    slug: 'amenagement-exterieur',
    title: 'Aménagement extérieur',
    eyebrow: 'Habiter dehors',
    icon: 'Trees',
    excerpt:
      'Jardins, terrasses, clôtures, allées, piscine, éclairage. Des extérieurs habitables douze mois par an, malgré la saison des pluies.',
    description:
      "Un jardin à Lomé n’a rien d’un jardin européen. Le sol est souvent argileux, il draine mal, et la saison sèche dure quatre mois. On releve donc le terrain, on regarde où l’eau stagne en août, et on choisit des plantes qui tiennent : pourpiers, bougainvilliers, espèces qui tolèrent la sécheresse et reviennent après la pluie. Les terrasses et allées sont dimensionnées pour évacuer l’eau. L’arrosage au goutte-à-goutte, alimenté par la récupération de pluie, réduit la facture d’eau et l’entretien.",
    highlights: [
      'Relevé topographique et étude du sol',
      'Plan de plantation adapté au climat togolais',
      'Terrasses, allées et clôtures dimensionnées',
      'Récupération d’eau de pluie et arrosage automatique',
      'Coordination des lots piscine et éclairage extérieur',
    ],
    deliverables: [
      'Plan de masse et plan de plantation',
      'Plans de maçonnerie et de dallage',
      'Schéma d’arrosage et d’éclairage',
      'Carnet d’entretien annuel',
      'Devis des fournitures et des végétaux',
    ],
    processNote: 'De 2 à 4 mois, plantation comprise.',
    seoTitle: 'Aménagement extérieur à Lomé — Jardins et terrasses | B.A. Construction',
    seoDescription:
      'Jardin, terrasse, clôture, piscine et éclairage extérieur à Lomé : plan de plantation adapté au climat, plans de maçonnerie et devis détaillé.',
    featured: true,
    order: 5,
  },
  {
    slug: 'suivi-de-chantier',
    title: 'Suivi de chantier',
    eyebrow: 'Maîtriser',
    icon: 'HardHat',
    excerpt:
      'Pilotage, contrôle qualité, réunions de chantier, réception. On garde le planning, le budget et la qualité sous contrôle, semaine après semaine.',
    description:
      "Beaucoup de dérives viennent d’un chantier qu’on ne visite pas assez. On impose donc un rythme : tour de chantier chaque semaine, compte-rendu écrit avec photos datées, vérification des métrés et des livraisons, réunion avec les corps d’état. On confronte le planning réel au planning prévu et on vous prévient tôt quand ça glisse — pas au moment où il est trop tard. À la réception, on établit un procès-verbal contradictoire et on reste sur place jusqu’à ce que chaque réserve soit levée.",
    highlights: [
      'Tour de chantier hebdomadaire avec compte-rendu',
      'Contrôle des métrés et des fournitures',
      'Réunions de coordination des entreprises',
      'Suivi du planning et alerte sur les retards',
      'Réception avec procès-verbal et levée des réserves',
    ],
    deliverables: [
      'Compte-rendu hebdomadaire illustré',
      'Procès-verbal de réception',
      'Liste des réserves et suivi de leur levée',
      'Tableau budgétaire actualisé',
      'Dossier des ouvrages exécutés (DOE)',
    ],
    processNote:
      'Mission au forfait sur toute la durée des travaux, ou ponctuelle pour un audit indépendant.',
    seoTitle: 'Suivi de chantier au Togo — Maîtrise d’œuvre et contrôle | B.A. Construction',
    seoDescription:
      'Suivi de chantier, contrôle qualité, coordination des entreprises, réception et levée des réserves au Togo.',
    featured: false,
    order: 6,
  },
];

/* ─────────────────────────────── Projets ─────────────────────────────────── */

interface SeedProject {
  slug: string;
  title: string;
  subtitle?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  location: string;
  city?: string;
  year: number;
  area: number;
  budget?: number;
  budgetLabel?: string;
  clientName?: string;
  excerpt: string;
  description: string;
  challenges?: string;
  solution?: string;
  features: string[];
  materials: string[];
  serviceSlug: string;
  featured?: boolean;
  order: number;
}

const projects: SeedProject[] = [
  {
    slug: 'villa-familiale-tokoin',
    title: 'Villa familiale Tokoin',
    subtitle: 'Maison R+1 sur pilotis, 245 m²',
    category: 'RESIDENTIAL',
    status: 'COMPLETED',
    location: 'Tokoin',
    city: 'Lomé',
    year: 2025,
    area: 245,
    budget: 78_000_000,
    budgetLabel: '78 M FCFA',
    clientName: 'Famille Aholou',
    excerpt:
      'Une villa R+1 sur pilotis, dessinée pour laisser passer la brise et rendre le jardin aux enfants, sur une parcelle de 400 m² seulement.',
    description:
      "La parcelle de 400 m² est prise en sandwich entre deux constructions, et le propriétaire voulait malgré tout garder un jardin. On a donc posé le premier niveau sur pilotis : le rez-de-chaussée abrite le garage, un local technique, la cuisine et un grand séjour ouvert sur la cour ; les chambres sont à l’étage, protégées de la rue. Le séjour est traversé par la brise qui monte du sud, et le débord de toiture côté est garde les baies à l’ombre une bonne partie de la journée. La famille est arrivée en mars 2025, avant la saison des pluies.",
    challenges:
      "400 m² seulement, deux murs mitoyens, et l’envie de ne pas sacrifier le jardin. Un plan classique de plain-pied aurait couvert toute la parcelle.",
    solution:
      "Surélever le programme sur pilotis a dégagé la cour et laissé la lumière entrer. Les circulations sont en double hauteur, et un débord de toiture de 1,2 m protège les ouvertures sans bloquer la brise marine.",
    features: [
      'Niveau habitable sur pilotis, jardin préservé au sol',
      'Ventilation traversante est-ouest',
      'Suite parentale avec terrasse couverte',
      'Cuisine ouverte sur le séjour et la cour',
      'Panneaux solaires de 4 kWc',
      'Clôture et portail motorisé',
    ],
    materials: [
      'Béton armé',
      'Brique creuse',
      'Enduit hydraulique',
      'Bois d’ipé',
      'Menuiserie aluminium',
      'Carrelage grand format',
    ],
    serviceSlug: 'architecture-residentielle',
    featured: true,
    order: 1,
  },
  {
    slug: 'complexe-bureau-kegue',
    title: 'Complexe de bureaux Kégué',
    subtitle: 'Immeuble R+3, 640 m² de bureaux',
    category: 'COMMERCIAL',
    status: 'COMPLETED',
    location: 'Kégué',
    city: 'Lomé',
    year: 2024,
    area: 640,
    budget: 210_000_000,
    budgetLabel: '210 M FCFA',
    clientName: 'Groupe Kégué Services',
    excerpt:
      'Un immeuble de bureaux locatif dont chaque plateau peut se diviser, pour louer aussi bien à une PME qu’à une grande structure.',
    description:
      "Le promoteur voulait un immeuble de rapport, mais hésitait sur la taille des plateaux : une grande entreprise, ou plusieurs petites ? On a tranché en concevant un socle divisible en quatre lots indépendants, chacun avec son accès. Les noyaux de circulation sont décalés pour libérer des plateaux rectangulaires, faciles à meubler. Les balcons filants, au sud, cassent la monotonie de la façade et font office de casquette solaire. Le rez-de-chaussée s’ouvre sur un jardin d’affaires avec cafétéria, pensé comme un lieu de pause entre deux rendez-vous.",
    challenges:
      "Un marché locatif encore jeune à Kégué, et un promoteur qui ne savait pas quel type de locataire viser. Il fallait un bâtiment capable de s’adapter.",
    solution:
      "Quatre lots commercialisables séparément, un couloir central éclairé naturellement qui dessert chaque plateau, et une double peau sur les façades les plus exposées au soleil.",
    features: [
      'Plateaux divisibles de 60 à 200 m²',
      'Noyaux de circulation décalés',
      'Balcons filants en façade sud',
      'Hall d’entrée vitré ouvert sur le jardin',
      'Ascenseur hydraulique 6 personnes',
      'Parking souterrain de 32 places',
    ],
    materials: [
      'Béton armé haute résistance',
      'Brique de parement',
      'Aluminium anodisé',
      'Verre feuilleté',
      'Béton ciré',
      'Panneaux solaires',
    ],
    serviceSlug: 'architecture-commerciale',
    featured: true,
    order: 2,
  },
  {
    slug: 'renovation-maison-bebou',
    title: 'Rénovation maison Bébou',
    subtitle: 'Réhabilitation complète avec extension arrière',
    category: 'RENOVATION',
    status: 'COMPLETED',
    location: 'Bébou',
    city: 'Lomé',
    year: 2025,
    area: 140,
    budget: 34_000_000,
    budgetLabel: '34 M FCFA',
    clientName: 'M. et Mme Adjo',
    excerpt:
      'Une maison des années 1970 sauvée de la démolition : fondations reprises, extension de 32 m² et retour d’une vraie cuisine.',
    description:
      "Le dallage avait bougé, les murs étaient fissurés en pied et il n’y avait aucune isolation. Les propriétaires pensaient démolir ; on leur a proposé une autre voie, souvent plus économe et plus rapide. On a renforcé les fondations par injection de résine, recoupé les murs en briques pleines et ajouté une extension arrière de 32 m² ouverte sur le jardin. Le gros œuvre a été mené en trois phases pour que la famille puisse rester sur place six des sept mois de travaux.",
    challenges:
      "Une structure ancienne dont on n’avait aucun plan, et des occupants qui vivaient dans la maison pendant le chantier.",
    solution:
      "Un phasage trimestriel, avec un relogement ponctuel dans une dépendance de chantier, et un diagnostic structurel complet avant la première démolition.",
    features: [
      'Renforcement des fondations par injection',
      'Extension arrière ouverte de 32 m²',
      'Reprise complète des réseaux',
      'Cuisine équipée sur mesure',
      'Peinture à l’argile sur les murs',
      'Terrasse sur plots démontables',
    ],
    materials: [
      'Béton projeté',
      'Briques pleines',
      'Terre cuite',
      'Chêne massif',
      'Acier galvanisé',
      'Zinc',
    ],
    serviceSlug: 'renovation-et-extension',
    featured: true,
    order: 3,
  },
  {
    slug: 'restaurant-le-flamboyant',
    title: 'Restaurant Le Flamboyant',
    subtitle: 'Local de 210 m², cuisine professionnelle',
    category: 'COMMERCIAL',
    status: 'COMPLETED',
    location: 'Hédzranawoé',
    city: 'Lomé',
    year: 2024,
    area: 210,
    budget: 58_000_000,
    budgetLabel: '58 M FCFA',
    clientName: 'SARL Le Flamboyant',
    excerpt:
      'Un restaurant de 80 couverts avec patio central, cuisine professionnelle et terrasse sur rue, ouvert en quatorze semaines.',
    description:
      "Le patron voulait un lieu où l’on reste, pas seulement où l’on mange. On a organisé la salle autour d’un patio central : il laisse entrer l’air et la lumière, et sert de repère depuis toutes les tables. La cuisine est construite autour d’un axe en U — réception des marchandises, préparation froide, cuisson, dressage — sans que les chemins se croisent, avec une entrée de service séparée. La terrasse sur rue capte la clientèle du soir. L’ouverture a eu lieu quatorze semaines après la signature, comme prévu.",
    challenges:
      "Un délai serré de 14 semaines entre la signature et l’ouverture, avec l’homologation ERP et la visite du service incendie à passer.",
    solution:
      "On a fait valider les plans avant même le dépôt du permis, commandé le mobilier de cuisine en amont et organisé un exercice d’évacuation avant l’ouverture.",
    features: [
      'Patio central à ventilation naturelle',
      'Cuisine professionnelle en axe U',
      'Accès livraisons séparé du personnel',
      'Terrasse de 40 places sur rue',
      'Sonorisation et éclairage de scène',
      'Blocs sanitaires séparés',
    ],
    materials: [
      'Béton lissé',
      'Métal',
      'Bois de teck',
      'Carrelage grès cérame',
      'Laiton',
      'Rotin',
    ],
    serviceSlug: 'architecture-commerciale',
    featured: true,
    order: 4,
  },
  {
    slug: 'appartement-louee-adjo',
    title: 'Résidence Les Palmiers',
    subtitle: 'Immeuble résidentiel de 6 appartements',
    category: 'RESIDENTIAL',
    status: 'COMPLETED',
    location: 'Avépozo',
    city: 'Lomé',
    year: 2023,
    area: 520,
    budget: 165_000_000,
    budgetLabel: '165 M FCFA',
    excerpt:
      'Six appartements familiaux en R+2, chacun avec sa terrasse, à quelques minutes de la lagune.',
    description:
      "La demande locale était claire : des appartements pour familles, avec une vraie terrasse plutôt qu’un balcon symbolique. Les six logements font de 75 à 105 m², tous prolongés d’un espace extérieur privatif. On a beaucoup travaillé l’acoustique entre appartements, un point souvent négligé quand les terrasses invitent à vivre dehors le soir. Chaque logement a son entrée privée, et la cage d’escalier est ouverte et éclairée naturellement pour éviter l’effet couloir sombre.",
    challenges:
      "Des exigences acoustiques fortes entre logements, dans un immeuble où le climat pousse à vivre sur les terrasses.",
    solution:
      "Des murs de refend en béton de 20 cm entre unités, des plafonds suspendus et des terrasses indépendantes protégées par un débord structurel.",
    features: [
      'Six appartements de 75 à 105 m²',
      'Terrasse privative par logement',
      'Cloisonnement acoustique renforcé',
      'Cage d’escalier ouverte et éclairée',
      'Local à vélos et gardiennage',
      'Réserve d’eau de 5 m³',
    ],
    materials: [
      'Béton armé',
      'Enduit tyrolien',
      'Bois exotique',
      'Céramique',
      'Acier',
      'Peinture acrylique',
    ],
    serviceSlug: 'architecture-residentielle',
    featured: false,
    order: 5,
  },
  {
    slug: 'atelier-bijoux-kpeme',
    title: 'Atelier de bijouterie Kpémé',
    subtitle: 'Espace de travail et vitrine de 120 m²',
    category: 'INTERIOR',
    status: 'COMPLETED',
    location: 'Kpémé',
    city: 'Lomé',
    year: 2024,
    area: 120,
    budget: 26_000_000,
    budgetLabel: '26 M FCFA',
    clientName: 'Atelier Kpémé',
    excerpt:
      'Un atelier de bijouterie où l’on reçoit les clients sans les faire entrer dans la zone de travail de l’or.',
    description:
      "L’or se travaille là où on le vend, mais les deux activités ne se mélangent pas. On a séparé la zone d’accueil — claire, chaleureuse, mettant les pièces en valeur — de l’atelier lui-même, éclairé pour le travail de précision et protégé des courants d’air. La circulation empêche le client de traverser la zone de fabrication. Pour l’éclairage, on a choisi des LED à température variable et un rendu de couleur très fidèle, indispensable pour juger une pierre ou un métal précieux.",
    challenges:
      "Mettre l’or et les pierres en sécurité sans donner l’impression d’entrer dans un coffre-fort, tout en offrant un éclairage de travail irréprochable.",
    solution:
      "Une vitrine blindée, un local de coffre séparé avec alarme, et un éclairage LED à température variable d’un indice de rendu des couleurs de 95.",
    features: [
      'Vitrine blindée à éclairage indirect',
      'Cloison acoustique atelier / vente',
      'Éclairage IRC 95 à température variable',
      'Armoire forte sécurisée',
      'Comptoir en chêne massif',
      'Sol chauffant dans la zone client',
    ],
    materials: [
      'Chêne massif',
      'Laiton brossé',
      'Verre trempé',
      'Marbre Calacatta',
      'Velours',
      'Acier',
    ],
    serviceSlug: 'amenagement-interieur',
    featured: false,
    order: 6,
  },
  {
    slug: 'villa-balade-sanssouci',
    title: 'Villa Sans-Souci',
    subtitle: 'Maison de plain-pied avec jardin tropical',
    category: 'RESIDENTIAL',
    status: 'IN_PROGRESS',
    location: 'Sans-Souci',
    city: 'Lomé',
    year: 2026,
    area: 195,
    budget: 62_000_000,
    budgetLabel: '62 M FCFA',
    clientName: 'Famille Kponvi',
    excerpt:
      'En chantier : une maison de plain-pied posée sur trois terrasses, ouverte sur un jardin tropical. Livraison prévue fin 2026.',
    description:
      "Le terrain descend doucement vers un bas-fond, et il fallait gérer les niveaux avec finesse. On a posé la maison sur trois terrasses, ce qui limite les terrassements et tire naturellement les pièces vers le jardin. Le gros œuvre est terminé ; on attaque le second œuvre et les extérieurs. Le chantier avance au rythme prévu, et la famille suit l’évolution grâce au compte-rendu hebdomadaire.",
    challenges:
      "Un sol argileux en pente, et une nappe phréatique qui remonte en saison des pluies.",
    solution:
      "Des fondations sur pieux isolés, un drainage périphérique et un seuil de porte surélevé de 45 cm au-dessus du terrain naturel.",
    features: [
      'Maison posée sur trois terrasses',
      'Jardin tropical en pente douce',
      'Véranda couverte de 24 m²',
      'Suite d’amis indépendante',
      'Cuisine d’été séparée',
      'Réserve d’eau enterrée de 10 m³',
    ],
    materials: [
      'Béton armé',
      'Pierre de granit',
      'Bois d’iroko',
      'Tôle prélaquée',
      'Terre cuite',
      'Bambou',
    ],
    serviceSlug: 'architecture-residentielle',
    featured: false,
    order: 7,
  },
  {
    slug: 'renovation-ecole-primaire',
    title: 'Rénovation école primaire',
    subtitle: 'Quatre salles de classe et bloc sanitaire',
    category: 'RENOVATION',
    status: 'COMPLETED',
    location: 'Tsévié',
    city: 'Tsévié',
    year: 2025,
    area: 320,
    budget: 41_000_000,
    budgetLabel: '41 M FCFA',
    clientName: 'Association des parents d’élèves',
    excerpt:
      'Quatre salles de classe et un bloc sanitaire refaits pendant les vacances, sans déranger une seule journée de cours.',
    description:
      "L’école devait continuer à fonctionner : tout le chantier a donc été calé sur les vacances scolaires, avec un planning au jour près. On a repris les salles de classe, réparé les murs en briques et refait les toitures en tôle avec une isolation sous couverture, qui change tout sous la chaleur. Un bloc sanitaire aux normes a été construit, avec un accès séparé pour les filles. La cour a été réaménagée avec des ombrières pour les récréations. À la rentrée, les enfants ont retrouvé des locaux sains.",
    challenges:
      "Un calendrier de trois mois, une seule fenêtre de vacances, et un budget entièrement financé par des dons : chaque franc comptait.",
    solution:
      "Un phasage strict calé sur le calendrier scolaire, l’approvisionnement anticipé des matériaux et deux équipes en parallèle pour tenir le délai.",
    features: [
      'Quatre salles de classe reprises',
      'Bloc sanitaire aux normes, accès filles séparé',
      'Toitures en tôle avec isolation',
      'Cour réaménagée avec ombrières',
      'Puits et réserve d’eau',
      'Peinture claire sur les murs',
    ],
    materials: [
      'Brique creuse',
      'Parpaing',
      'Tôle isolée',
      'Peinture à l’eau',
      'Ciment lissé',
      'Bois',
    ],
    serviceSlug: 'renovation-et-extension',
    featured: false,
    order: 8,
  },
  {
    slug: 'garden-prive-kpome',
    title: 'Jardin privé Kpomé',
    subtitle: 'Jardin d’agrément de 480 m²',
    category: 'EXTERIOR',
    status: 'COMPLETED',
    location: 'Kpomé',
    city: 'Lomé',
    year: 2025,
    area: 480,
    budget: 19_500_000,
    budgetLabel: '19,5 M FCFA',
    excerpt:
      'Un jardin d’agrément planté d’espèces locales, avec bassin, allées en grès et arrosage alimenté par l’eau de pluie.',
    description:
      "Le jardin a été pensé comme une promenade : une terrasse de repas abritée par des mimosas, un bassin planté de nénuphars qui rafraîchit l’air alentour, une allée de dalles de grès qui serpente vers un coin détente, et une haie vive qui ferme la vue depuis la rue. Le sol argileux drainait mal ; on a apporté une couche de sable et de gravier, et installé un goutte-à-goutte enterré alimenté par l’eau de pluie récupérée du toit. En saison sèche, le jardin tient sans arrosage excessif.",
    challenges:
      "Un sol argileux qui draine mal, et une saison sèche de quatre mois.",
    solution:
      "Une couche drainante de sable et de gravier sur 40 cm, un goutte-à-goutte enterré alimenté par la récupération de pluie, et des essences tolérantes à la sécheresse.",
    features: [
      'Terrasse de repas de 32 m²',
      'Bassin planté de 14 m²',
      'Allée en grès et pas japonais',
      'Haie vive pour l’intimité',
      'Arrosage goutte-à-goutte automatique',
      'Éclairage solaire basse tension',
    ],
    materials: [
      'Grès',
      'Sable et gravier drainant',
      'Bambou',
      'Mimosa',
      'Bâche EPDM pour bassin',
      'Pierre volcanique',
    ],
    serviceSlug: 'amenagement-exterieur',
    featured: true,
    order: 9,
  },
  {
    slug: 'espace-beaute-lome',
    title: 'Institut de beauté Lomé',
    subtitle: 'Salon de 95 m² et cabines de soins',
    category: 'INTERIOR',
    status: 'COMPLETED',
    location: 'Bomé',
    city: 'Lomé',
    year: 2023,
    area: 95,
    budget: 16_000_000,
    budgetLabel: '16 M FCFA',
    clientName: 'Institut Beauté Lomé',
    excerpt:
      'Un salon lumineux et facile à entretenir : cinq postes de coiffure, deux cabines de soins et un accueil chaleureux.',
    description:
      "Le salon devait concilier trois usages : accueillir, coiffer, prendre soin. On a organisé la circulation pour que les clientes qui attendent ne croisent pas les allées et venues des coiffeuses. Les grands miroirs ont été remplacés par des plans inclinés à éclairage indirect : la pièce paraît plus grande et les reflets dans les yeux disparaissent. Les revêtements lavables au sol et aux murs simplifient l’entretien quotidien. En fin de journée, quand le soleil entre à l’ouest, les stores extérieurs en toile préservent la fraîcheur.",
    challenges:
      "Une petite surface, une forte luminosité en fin de journée et des exigences d’hygiène strictes.",
    solution:
      "Un plan en couloir avec des postes alternés, des cloisons vitrées entre zones de soin et de coiffure, et un éclairage indirect qui ne projette pas d’ombre sur les visages.",
    features: [
      'Cinq postes de coiffure',
      'Deux cabines de soins',
      'Accueil avec comptoir et espace d’attente',
      'Miroirs inclinés à éclairage indirect',
      'Sols et murs lavables',
      'Climatisation par split',
    ],
    materials: [
      'Carrelage grand format',
      'Bois de bouleau',
      'Miroir',
      'Laiton brossé',
      'Velours',
      'Résine',
    ],
    serviceSlug: 'amenagement-interieur',
    featured: false,
    order: 10,
  },
];

/* ──────────────────────────────── Publications ───────────────────────────── */

const posts = [
  {
    slug: 'combien-coute-une-maison-au-togo-en-2026',
    title: 'Combien coûte vraiment une maison au Togo en 2026',
    excerpt:
      'Les prix au m² à Lomé et en province, les postes que tout le monde oublie, et comment lire un devis sans se faire avoir.',
    content: `« C’est combien le m² ? » est la première question qu’on nous pose, et c’est aussi celle à laquelle il est le plus malhonnête de répondre par un seul chiffre. Voici comment lire les prix.

## Le prix au m², et ce qu’il cache

À Lomé, pour une maison individuelle de standing courant, comptez entre 450 000 et 750 000 FCFA le m² de surface de plancher. En province, on descend souvent de 30 à 40 %.

- **En bas de fourchette** : maçonnerie simple, enduit tyrolien, carrelage standard, menuiserie aluminium de base, toiture en tôle.
- **En haut de fourchette** : structure soignée, doublages, finitions haut de gamme, volets roulants, aménagement extérieur.

Ce prix au m² n’inclut presque jamais le terrain, les raccordements (eau, électricité, assainissement) ni les frais administratifs. Sur un projet réel, ces postes pèsent 15 à 30 % du total.

## Les postes que l’on oublie

1. **Les études** : 8 à 12 % du montant des travaux pour la conception, les plans et le suivi.
2. **Le terrain** : à Lomé, il peut représenter à lui seul un tiers de l’investissement.
3. **Les raccordements** : un compteur électrique de la CEET peut coûter plusieurs centaines de milliers de FCFA.
4. **Les imprévus** : 5 à 10 %, non négociables dès qu’on touche à du bâti existant.
5. **La main-d’œuvre** : son coût grimpe avec la durée du chantier, plus vite que celui des matériaux.

## Comment reconnaître un devis sérieux

Un devis sérieux donne des quantités (m² de maçonnerie, m³ de béton, ml de tuyauterie) et des prix unitaires, lot par lot. Il précise ce qui n’est pas inclus. Il affiche une durée de validité.

Un devis qui n’annonce que des forfaits, sans quantités, ne permet ni de comparer deux offres, ni de suivre les écarts pendant les travaux.

## Notre méthode

On commence toujours par une visite du terrain et une lecture attentive des plans. C’est la seule façon de savoir si une maison « standard » tient debout sur votre parcelle ou repose sur des hypothèses. Le calculateur de budget de ce site donne un ordre de grandeur utile ; il ne remplace pas cette visite.`,
    category: 'CONSEILS' as const,
    tags: ['budget', 'prix m2', 'construction', 'togo'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 8,
    publishedAt: new Date('2026-08-12'),
    featured: true,
    views: 1840,
  },
  {
    slug: 'ventilation-climat-tropical-lome',
    title: 'Ventiler une maison à Lomé : six principes qui changent tout',
    excerpt:
      'Brise marine, flux traversant, débords de toiture : comment concevoir une maison qui respire sans climatiser.',
    content: `Construire à Lomé, c’est d’abord gérer un climat. Le problème n’est pas seulement la chaleur : c’est l’humidité, le soleil de midi et l’air qui ne se renouvelle pas la nuit.

## 1. Ouvrir en opposition

La brise monte du sud presque toute l’année. Une maison qui s’ouvre sur deux faces opposées se ventile toute seule — c’est le principe le plus efficace, et le moins cher à mettre en œuvre.

## 2. Faire de l’ombre, pas barrage au vent

Un débord de toiture de 1 à 1,50 m sur les façades exposées au soleil de midi réduit la charge thermique de 30 à 40 % sans bloquer la brise. C’est souvent plus efficace et moins cher qu’une isolation lourde.

## 3. Sortir l’air chaud par le haut

L’air chaud monte. Une extraction haute — grille en toiture, ou simple châssis ouvrant — accélère le tirage et fait baisser l’humidité résiduelle.

## 4. Isoler les pièces humides

Cuisine et salle d’eau produisent une humidité qu’il faut évacuer, pas diffuser dans les chambres. Prévoir une ventilation dédiée dès la conception coûte bien moins cher qu’un traitement anti-moisissure en mars.

## 5. Garder la masse thermique dehors

Une véranda ventilée côté ouest crée une zone tampon qui protège l’intérieur — et devient un vrai espace de vie, pas seulement un écran.

## 6. Soigner les détails

Joints de fenêtre, entrées d’air basses, grilles de transfert : c’est là que se joue la performance réelle d’une maison passive. Un plan de ventilation précis vaut mieux qu’un climatiseur bruyant.`,
    category: 'DURABLE' as const,
    tags: ['ventilation', 'climat', 'bioclimatique', 'lome'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 7,
    publishedAt: new Date('2026-07-28'),
    featured: true,
    views: 1320,
  },
  {
    slug: 'permis-de-construire-togo-demarche',
    title: 'Permis de construire au Togo : la démarche, étape par étape',
    excerpt:
      'Constitution du dossier, délais, frais et pièges à éviter — la procédure telle qu’elle se passe vraiment.',
    content: `Le permis de construire est la première formalité d’un projet, et celle qui pèse le plus sur le calendrier. Voici la séquence, telle qu’on la vit sur le terrain.

## Les acteurs

- **La commune** : elle instruit le dossier et délivre le permis. Chaque commune a ses habitudes, et son rythme.
- **L’architecte ou le constructeur agréé** : il monte le dossier et garantit sa conformité.
- **Le service du cadastre** : il vérifie la situation du terrain.
- **La commission technique** : elle examine le projet au regard des règles d’urbanisme locales.

## Les pièces du dossier

- La demande de permis, signée par le propriétaire.
- Le titre de propriété ou la promesse de vente.
- Le plan de masse coté.
- Les plans de niveau, les coupes et les élévations.
- Une note de calcul de la surface de plancher.
- Les justificatifs de raccordement (eau, électricité).

## Les délais

Comptez 4 à 10 semaines pour une instruction complète, selon la commune et la complexité du projet. La première cause de retard, ce sont les dossiers incomplets : ils sont renvoyés, et le compteur repart à zéro.

## Les pièges

- **Construire avant le permis** : l’erreur la plus coûteuse. Les sanctions peuvent aller jusqu’à la démolition.
- **Modifier le projet après le permis** : tout changement de surface ou de façade doit faire l’objet d’une demande de modification, elle aussi instruite.
- **Confondre le récépissé de dépôt et le permis** : le récépissé n’autorise pas à construire.

## Notre accompagnement

On constitue le dossier, on le dépose, on suit les observations de la commission et on veille à la conformité pendant le chantier. Ce service fait partie intégrante de la maîtrise d’œuvre.`,
    category: 'REGLEMENTATION' as const,
    tags: ['permis de construire', 'administratif', 'togo', 'urbanisme'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 6,
    publishedAt: new Date('2026-06-19'),
    featured: true,
    views: 980,
  },
  {
    slug: 'materiaux-locaux-construction-togo',
    title: 'Matériaux locaux : ce qui tient vraiment au Togo',
    excerpt:
      'Banco, tôle, iroko, kpalou, béton : usage, mise en œuvre, coût et durabilité — un état des lieux sans complaisance.',
    content: `Le Togo regorge de matériaux performants. Encore faut-il savoir les employer.

## Terre compressée (banco)

Le banco est le matériau le plus abordable et l’un des mieux adaptés à une grande partie du pays. Ses atouts : inertie thermique, disponibilité, coût. Ses limites : il exige un enduit adapté, une protection contre la pluie battante et un entretien régulier. Mal protégé, il se délite en deux saisons.

## Tôle et charpente légère

La tôle est partout. Tout se joue sur le traitement anti-corrosion et l’isolation sous couverture. Une charpente métallique bien protégée tient trente ans ; mal ventilée, elle se corrode en cinq.

## Iroko et kpalou

Ces essences locales sont denses et très résistantes aux insectes. Le kpalou sert couramment pour les charpentes et les menuiseries. Leur coût reste très inférieur à celui des bois importés.

## Brique et béton

Le parpaing de terre cuite convient aux cloisons et murs de remplissage. Le béton armé reste la solution pour les structures. La brique de parement, elle, apporte une belle lumière et une bonne inertie.

## Notre approche

On choisit les matériaux selon trois critères : le climat local, leur disponibilité réelle sur le chantier, et l’entretien que le client pourra réellement assurer. Un matériau magnifique mais intenable au quotidien est un mauvais choix.`,
    category: 'MATERIAUX' as const,
    tags: ['matériaux', 'banco', 'terre cuite', 'togo'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 6,
    publishedAt: new Date('2026-05-22'),
    featured: false,
    views: 760,
  },
  {
    slug: 'extensions-patio-togo',
    title: 'Agrandir sans démolir : la logique des extensions de patio',
    excerpt:
      'Transformer une cour arrière en pièce de vie : dimensionnement, lumière, structure et budget.',
    content: `Une cour arrière de 60 à 120 m², c’est un actif souvent oublié. La transformer en pièce de vie est fréquemment plus rationnel — et moins cher — qu’une extension en façade.

## Les trois règles

1. **La structure d’abord.** Une cour accolée à un bâtiment ancien n’a pas les mêmes fondations. Une étude géotechnique légère et une reprise en sous-œuvre sont indispensables.
2. **La lumière par le haut.** Une pièce d’extension sans ouverture de façade a besoin d’un skylight ou d’un lanterneau : c’est la seule source fiable.
3. **L’exutoire.** Une extension crée un volume chauffé : il lui faut une sortie d’air, sinon le point d’humidité se déplace au lieu de disparaître.

## Le confort thermique

Un patio devient vite un four l’après-midi. Les solutions simples : une toiture largement débordante, une couverture ventilée (tuile ou tôle sur liteaux) et quelques arbres qui ombragent la partie la plus exposée.

## Budget

Pour une extension de 25 m² sur cour, comptez entre 6 et 11 M FCFA selon l’état du bâti existant et le niveau de finition. Le poste « reprises en sous-œuvre » est celui qui varie le plus — d’où l’importance d’un diagnostic préalable.`,
    category: 'TENDANCES' as const,
    tags: ['extension', 'patio', 'rénovation', 'budget'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 5,
    publishedAt: new Date('2026-04-30'),
    featured: false,
    views: 640,
  },
  {
    slug: 'construction-secure-pluie-lome',
    title: 'Construire pour la pluie : les détails qui sauvent une maison',
    excerpt:
      'Toitures, ruissellement, drainage des fondations : préparer une maison togolaise à la saison des pluies.',
    content: `Il pleut quatre mois au Togo, parfois pendant des journées entières. Une maison mal préparée perdra sa façade, puis sa structure, en quelques années.

## La toiture

Pente minimale de 15 %, débord de 50 cm au moins sur les façades exposées, et une gouttière dimensionnée pour une pluie d’orage — pas pour la moyenne annuelle. Les descentes d’eau doivent rester éloignées des fondations.

## Le sol aux abords

Un sol nu autour d’une maison se dégrade à chaque saison. Talus, dallage de cour, gravier drainant ou pavés jointifs : il faut stabiliser la surface.

## Les fondations

Le remblai autour des fondations doit être drainant et légèrement incliné vers l’extérieur. Un drainage périphérique coûte quelques dizaines de milliers de FCFA et évite des dizaines de millions en reprises.

## Les murs

Un enduit hydraulique ou une peinture minérale, appliqués sur un support propre, tiennent mieux que l’enduit ciment classique. Les soubassements doivent rester au-dessus des ruissellements.

## L’entretien

Un contrôle annuel, avant la saison des pluies, de l’étanchéité des points singuliers (rives, solins, cheminées, joints) évite 90 % des problèmes.`,
    category: 'DURABLE' as const,
    tags: ['pluie', 'étanchéité', 'fondations', 'entretien'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 6,
    publishedAt: new Date('2026-03-18'),
    featured: false,
    views: 520,
  },
  {
    slug: 'bureaux-et-commerces-lome',
    title: 'Ouvrir un commerce à Lomé : les contraintes à ne pas oublier',
    excerpt:
      'Sécurité incendie, accessibilité, ventilation des cuisines, réseaux : la liste à vérifier avant de signer le bail.',
    content: `Le local est trouvé, le bail est sur le point d’être signé. C’est maintenant que commencent les vraies questions. Voici la liste qu’on passe avec nos clients.

## Ce que la réglementation impose

- **L’accessibilité** : un local recevant du public doit être accessible aux personnes à mobilité réduite, sanitaires compris.
- **La sécurité incendie** : désenfumage, extincteurs, issues de secours, selon la surface et l’activité.
- **La ventilation** : une cuisine professionnelle exige une extraction dimensionnée, pas une simple fenêtre.
- **L’accès aux réseaux** : la puissance électrique disponible conditionne tout le projet. Vérifiez-la avant de signer.

## Les questions de flux

- Les livraisons peuvent-elles arriver sans traverser la salle ?
- Y a-t-il un local de stockage, et de quelle taille ?
- Les clients circulent-ils sans croiser la zone de préparation ?

## Le budget « invisible »

Cloisonnement, reprise des réseaux, mise aux normes électriques, signalétique, mobilier : comptez 15 à 25 % du coût de construction dans ces postes. Ce sont eux qui font la différence entre un local qui ouvre à l’heure et un local qui ouvre avec un mois de retard.`,
    category: 'CONSEILS' as const,
    tags: ['commercial', 'erp', 'lome', 'ouverture'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 5,
    publishedAt: new Date('2026-02-11'),
    featured: false,
    views: 430,
  },
  {
    slug: 'design-interieur-togo-tendances',
    title: 'Ce que les clients togolais demandent vraiment en 2026',
    excerpt:
      'Terre cuite, bois clair, lumière indirecte, matériaux de réemploi : les attentes réelles en design d’intérieur.',
    content: `On conçoit des intérieurs à Lomé depuis trois ans. Les attentes ont évolué, et elles ne suivent pas toujours les magazines.

## Terre cuite et tons chauds

Ocre, terre de Sienne, argile, sable : ces teintes reviennent dans presque tous les projets. Associées à du bois clair, elles apportent une chaleur que les gris froids n’ont pas.

## La lumière indirecte

Les plafonniers encastrés seuls produisent une lumière plate et des ombres dures. Une indirection derrière un faux plafond, ou des suspensions basses, transforme complètement un volume.

## Le réemploi

Réutiliser les matériaux est devenu une demande explicite : poutres récupérées, carreaux anciens, mobilier chiné. Au-delà de l’écologie, c’est souvent le seul moyen d’obtenir un caractère impossible à standardiser.

## Le confort thermique

Tissus épais, rideaux doublés et tapis ont mauvaise réputation en climat chaud — à tort, quand ils servent à filtrer le soleil direct. On privilégie des rideaux doublés côté ouest et des murs qui respirent.

## La simplicité assumée

Les clients demandent de plus en plus d’espaces simples, durables et faciles à entretenir. Un béton ciré bien posé bat un carrelage cher mal posé.`,
    category: 'TENDANCES' as const,
    tags: ['design intérieur', 'tendances', 'lome', 'matériaux'],
    authorName: 'B.A. Construction',
    authorRole: 'Direction du cabinet',
    readMinutes: 5,
    publishedAt: new Date('2026-01-22'),
    featured: false,
    views: 380,
  },
];

/* ─────────────────────────────── Équipe ──────────────────────────────────── */

const team = [
  {
    name: 'Ayodélé KOFFI',
    role: 'Architecte fondateur — Directeur du cabinet',
    bio: "Quinze ans de cabinets et de chantiers avant de fonder B.A. Construction, avec une idée fixe : un projet réussit quand le client comprend chaque décision qu’on prend pour lui. Il suit personnellement les rénovations et les missions de conseil, et visite encore les chantiers lui-même — souvent le samedi matin, quand personne ne l’attend.",
    email: 'direction@ba-construction.tg',
    phone: '+228 91 08 55 50',
    linkedin: 'https://www.linkedin.com/company/ba-construction',
    skills: ['Architecture', 'Maîtrise d’œuvre', 'Diagnostic de bâti existant', 'Conseil'],
    order: 1,
  },
  {
    name: 'Nadia KESSO',
    role: 'Architecte associée — Direction de projet',
    bio: "Elle coordonne la conception et le suivi des projets les plus lourds : bureaux, hôtellerie, programmes mixtes. C’est aussi la référence du cabinet sur les études bioclimatiques, et la personne qu’on appelle quand une parcelle semble impossible à ventiler.",
    email: 'nadia.kesso@ba-construction.tg',
    phone: '+228 97 12 34 56',
    skills: ['Architecture commerciale', 'Conception bioclimatique', 'Coordination', 'ERP'],
    order: 2,
  },
  {
    name: 'Serge TOULASSI',
    role: 'Chef de projet — Suivi de chantier',
    bio: "Quinze ans de chantier, du gros œuvre aux finitions. Il contrôle les métrés, tient les délais et négocie sec avec les fournisseurs. C’est lui qui garantit que ce qui était sur le plan se retrouve au plafond — et il ne lâche pas tant que ce n’est pas le cas.",
    email: 'serge.toulassi@ba-construction.tg',
    phone: '+228 96 44 78 90',
    skills: ['Suivi de chantier', 'Contrôle qualité', 'Métrés', 'Négociation'],
    order: 3,
  },
  {
    name: 'Fatima BARRY',
    role: 'Architecte d’intérieur — Design',
    bio: "Huit ans d’aménagements intérieurs, du logement à l’hôtellerie. Elle commence toujours par demander comment vous vivez, où vous rangez, si vous prenez votre café debout. Les matières viennent après — jamais avant.",
    email: 'fatima.barry@ba-construction.tg',
    phone: '+228 90 33 21 09',
    skills: ['Design d’intérieur', 'Ergonomie', 'Mobilier sur mesure', 'Éclairage'],
    order: 4,
  },
  {
    name: 'Éric ADJO',
    role: 'Ingénieur structure — BET structure',
    bio: "Il calcule les structures neuves et ausculte les anciennes. Les diagnostics de bâti existant, avec leurs surprises et leurs fissures, sont sa partie préférée — c’est là que le métier se rapproche le plus de l’enquête.",
    email: 'eric.adjo@ba-construction.tg',
    phone: '+228 98 55 12 47',
    skills: ['Structure', 'Béton armé', 'Diagnostic structurel', 'Fondations'],
    order: 5,
  },
];

/* ────────────────────────────── Témoignages ───────────────────────────────── */

const testimonials = [
  {
    authorName: 'M. Koffi AHOULOU',
    authorRole: 'Propriétaire',
    company: 'Villa familiale, Tokoin',
    rating: 5,
    quote:
      "À chaque étape, on m’a montré les options avec le prix de chacune. Je n’ai jamais eu l’impression qu’on me vendait du rêve. La maison a été livrée dans les délais, et le budget annoncé au départ n’a pas bougé.",
    order: 1,
  },
  {
    authorName: 'Mme Aya KESSO',
    authorRole: 'Directrice',
    company: 'Groupe Kégué Services',
    rating: 5,
    quote:
      "Notre local restait vide depuis huit mois, et deux devis précédents ne tenaient pas la route. B.A. Construction a repris le projet à partir du diagnostic et nous a livré un immeuble qui se loue. On a rempli les plateaux en trois mois.",
    order: 2,
  },
  {
    authorName: 'M. et Mme ADJO',
    authorRole: 'Propriétaires',
    company: 'Rénovation, Bébou',
    rating: 5,
    quote:
      "Rénover la maison de famille, on redoutait ça. Le phasage nous a permis de rester chez nous presque tout le temps, et l’équipe a nettoyé le chantier chaque soir. On a vécu les travaux sans les subir.",
    order: 3,
  },
  {
    authorName: 'M. Yao AKA',
    authorRole: 'Gérant',
    company: 'Restaurant Le Flamboyant',
    rating: 5,
    quote:
      "Quatorze semaines entre la signature et l’ouverture : c’est ce qu’on avait demandé, c’est ce qu’on a eu. Ils avaient anticipé les passages de la commission, et la cuisine professionnelle est vraiment au niveau.",
    order: 4,
  },
  {
    authorName: 'Association des parents d’élèves',
    authorRole: 'Présidente',
    company: 'École primaire, Tsévié',
    rating: 5,
    quote:
      "Un budget serré et un chantier à faire pendant les seules vacances scolaires. Le cabinet a calé le planning au jour près. À la rentrée, les enfants ont retrouvé des salles propres et un vrai bloc sanitaire.",
    order: 5,
  },
];

/* ───────────────────────────── Certifications ─────────────────────────────── */

const certifications = [
  {
    title: 'Inscription à l’Ordre des Architectes du Togo',
    issuer: 'Conseil de l’Ordre des Architectes',
    year: '2011',
    description:
      "Inscription au registre national des architectes, obligatoire pour l'établissement et le suivi des dossiers d'urbanisme.",
    order: 1,
  },
  {
    title: 'Certification de maîtrise d’œuvre (MOE)',
    issuer: 'Ministère de l’Equipement',
    year: '2015',
    description:
      'Agrément pour la conduite de missions de maîtrise d’œuvre sur des bâtiments de plus de 1 000 m².',
    order: 2,
  },
  {
    title: 'HSE — Sécurité et protection de la santé',
    issuer: 'Cabinet de formation agréé',
    year: '2019',
    description:
      'Formation continue des équipes de chantier aux règles de sécurité : port des EPI, travail en hauteur, levage et premiers secours.',
    order: 3,
  },
  {
    title: 'Management de projet de construction',
    issuer: 'École supérieure d’ingénierie',
    year: '2018',
    description:
      'Cycle de formation en gestion de projet, planification, contrôle des coûts et gestion des risques de chantier.',
    order: 4,
  },
  {
    title: 'BEPOS / performance énergétique',
    issuer: 'Programme régional climat',
    year: '2022',
    description:
      'Accompagnement à la conception bioclimatique et à l’optimisation de l’enveloppe des bâtiments.',
    order: 5,
  },
];

/* ─────────────────────────────── Partenaires ─────────────────────────────── */

const partners = [
  { name: 'SOTRACOM', type: 'Structure et VRD', website: null, order: 1 },
  { name: 'CIMENCAM Togo', type: 'Matériaux', website: null, order: 2 },
  { name: 'STEEL-Togo', type: 'Charpente métallique', website: null, order: 3 },
  { name: 'CEET', type: 'Énergie', website: 'https://www.ceet.tg', order: 4 },
  { name: 'Société Nationale d’Hydraulique', type: 'Réseaux et adduction', website: null, order: 5 },
  { name: 'Groupe Local TP', type: 'Génie civil', website: null, order: 6 },
];

/* ──────────────────────────── Méthode du cabinet ──────────────────────────── */

const processSteps = [
  {
    number: 1,
    title: 'Premier échange',
    description:
      'Un appel ou un message pour comprendre votre projet, votre budget et vos délais. Gratuit, 30 minutes, sans engagement.',
    icon: 'MessageCircle',
    duration: 'Jour 1',
    order: 1,
  },
  {
    number: 2,
    title: 'Visite du site',
    description:
      'Nous nous déplaçons sur le terrain : orientation, accès, réseaux, sols, contraintes du voisinage. C’est là que le projet devient réaliste.',
    icon: 'MapPin',
    duration: 'Semaine 1',
    order: 2,
  },
  {
    number: 3,
    title: 'Esquisse et programme',
    description:
      'Deux ou trois hypothèses de plan et d’organisation, avec un premier ordre de grandeur budgétaire. Vous choisissez la direction.',
    icon: 'PenTool',
    duration: 'Semaines 2 à 3',
    order: 3,
  },
  {
    number: 4,
    title: 'Étude de projet',
    description:
      'Plans d’exécution, coupes, élévations, carnet de matériaux et devis quantitatif détaillé par lots.',
    icon: 'Ruler',
    duration: 'Semaines 4 à 8',
    order: 4,
  },
  {
    number: 5,
    title: 'Permis et préparation',
    description:
      'Constitution du dossier administratif, dépôt de la demande de permis, consultation des entreprises et préparation du chantier.',
    icon: 'FileCheck',
    duration: 'Semaines 8 à 14',
    order: 5,
  },
  {
    number: 6,
    title: 'Suivi de chantier',
    description:
      'Visite hebdomadaire, compte-rendu photo, contrôle des métrés, coordination des corps d’état et suivi du planning.',
    icon: 'HardHat',
    duration: 'Durée des travaux',
    order: 6,
  },
  {
    number: 7,
    title: 'Réception',
    description:
      'Visite de réception contradictoire, procès-verbal, levée des réserves, remise du dossier des ouvrages exécutés et des clés.',
    icon: 'KeyRound',
    duration: 'Fin de chantier',
    order: 7,
  },
];

/* ──────────────────────────────── Statistiques ────────────────────────────── */

const stats = [
  { label: 'Projets livrés', value: '120', suffix: '+', icon: 'Building2', order: 1 },
  { label: 'Années d’expérience', value: '14', suffix: '', icon: 'CalendarDays', order: 2 },
  { label: 'Surface construite', value: '48', suffix: ' 000 m²', icon: 'Ruler', order: 3 },
  { label: 'Clients accompagnés', value: '180', suffix: '+', icon: 'Users', order: 4 },
  { label: 'Délai moyen respecté', value: '96', suffix: ' %', icon: 'Clock', order: 5 },
  { label: 'Recommandation clients', value: '4,9', suffix: '/5', icon: 'Star', order: 6 },
];

/* ────────────────────────────── Exécution du seed ────────────────────────── */

async function main() {
  console.log('▸ Initialisation du compte administrateur…');
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@ba-construction.tg').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!2026Secure';

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Administration B.A. Construction', role: 'ADMIN', active: true },
    create: {
      email: adminEmail,
      name: 'Administration B.A. Construction',
      role: 'ADMIN',
      passwordHash: await hashPassword(adminPassword),
    },
  });

  console.log('▸ Initialisation du compte éditeur…');
  const editorEmail = (process.env.SEED_EDITOR_EMAIL ?? 'editeur@ba-construction.tg').toLowerCase();
  const editorPassword = process.env.SEED_EDITOR_PASSWORD ?? 'ChangeMe!2026Editor';

  await prisma.user.upsert({
    where: { email: editorEmail },
    update: { name: 'Rédaction B.A. Construction', role: 'EDITOR', active: true },
    create: {
      email: editorEmail,
      name: 'Rédaction B.A. Construction',
      role: 'EDITOR',
      passwordHash: await hashPassword(editorPassword),
    },
  });

  console.log('▸ Services…');
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log('▸ Témoignages…');
  const testimonialsByName: Record<string, string> = {};
  for (const item of testimonials) {
    const row = await prisma.testimonial.upsert({
      where: { id: `seed-testimonial-${item.order}` },
      update: item,
      create: { id: `seed-testimonial-${item.order}`, ...item },
    });
    testimonialsByName[item.company] = row.id;
  }

  console.log('▸ Projets…');
  for (const project of projects) {
    const service = await prisma.service.findUnique({ where: { slug: project.serviceSlug } });
    const clientKey = project.clientName ? (project.clientName.split(' ')[0] ?? '') : '';
    const testimonialId = clientKey
      ? Object.entries(testimonialsByName).find(([company]) => company.includes(clientKey))?.[1]
      : undefined;

    const { serviceSlug: _serviceSlug, ...data } = project;
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        ...data,
        serviceId: service?.id ?? null,
        testimonialId: testimonialId ?? null,
      },
      create: {
        ...data,
        serviceId: service?.id ?? null,
        testimonialId: testimonialId ?? null,
      },
    });
  }

  console.log('▸ Publications…');
  for (const post of posts) {
    const { featured, ...data } = post;
    void featured;
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: data,
      create: data,
    });
  }

  console.log('▸ Équipe…');
  for (const member of team) {
    await prisma.teamMember.upsert({
      where: { id: `seed-team-${member.order}` },
      update: member,
      create: { id: `seed-team-${member.order}`, ...member },
    });
  }

  console.log('▸ Certifications et partenaires…');
  for (const [index, item] of certifications.entries()) {
    await prisma.certification.upsert({
      where: { id: `seed-certification-${index + 1}` },
      update: item,
      create: { id: `seed-certification-${index + 1}`, ...item },
    });
  }
  for (const [index, item] of partners.entries()) {
    await prisma.partner.upsert({
      where: { id: `seed-partner-${index + 1}` },
      update: item,
      create: { id: `seed-partner-${index + 1}`, ...item },
    });
  }

  console.log('▸ Méthode et statistiques…');
  for (const step of processSteps) {
    await prisma.processStep.upsert({
      where: { id: `seed-process-${step.number}` },
      update: step,
      create: { id: `seed-process-${step.number}`, ...step },
    });
  }
  for (const stat of stats) {
    await prisma.stat.upsert({
      where: { id: `seed-stat-${stat.order}` },
      update: stat,
      create: { id: `seed-stat-${stat.order}`, ...stat },
    });
  }

  console.log('▸ Réglages du site…');
  await prisma.siteSetting.upsert({
    where: { key: 'contact' },
    update: {
      value: {
        phone: '+228 91 08 55 50',
        email: 'contact@ba-construction.tg',
        address: 'Boulevard du Mono, Tokoin',
        city: 'Lomé',
        country: 'Togo',
      },
    },
    create: { key: 'contact', value: {} },
  });

  const counts = {
    services: await prisma.service.count(),
    projects: await prisma.project.count(),
    posts: await prisma.post.count(),
    team: await prisma.teamMember.count(),
    testimonials: await prisma.testimonial.count(),
  };

  console.log('\n✔ Seed terminé.');
  console.table(counts);
  console.log(`\nCompte administrateur : ${adminEmail}`);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log('Mot de passe administrateur par défaut : ChangeMe!2026Secure — changez-le dès la première connexion.');
  }
  console.log(`Compte éditeur       : ${editorEmail}`);
  if (!process.env.SEED_EDITOR_PASSWORD) {
    console.log('Mot de passe éditeur par défaut : ChangeMe!2026Editor — changez-le dès la première connexion.');
  }
}

main()
  .catch((error) => {
    console.error('✖ Échec du seed :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
