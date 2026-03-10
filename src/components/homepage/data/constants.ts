import type { CategoryItem, Review, RatingDistribution } from './types';

export const CATEGORIES: CategoryItem[] = [
  {
    name: 'Outils électroportatifs',
    subtitle: 'Perceuses, visseuses, meuleuses...',
    handle: 'outils-electroportatifs',
    image: '/images/categories/outils-electroportatifs.webp',
    count: 186,
    bentoSize: 'featured',
  },
  {
    name: 'Batteries & Chargeurs',
    subtitle: 'M12, M18, MX FUEL',
    handle: 'batteries-chargeurs-et-generateurs',
    image: '/images/categories/batteries-chargeurs.webp',
    count: 74,
  },
  {
    name: 'Aspirateurs',
    subtitle: 'Chantier & atelier',
    handle: 'aspirateurs',
    image: '/images/categories/aspirateurs.webp',
    count: 32,
    bentoSize: 'tall',
  },
  {
    name: 'Éclairage',
    subtitle: 'Projecteurs & lampes',
    handle: 'eclairage',
    image: '/images/categories/eclairage.webp',
    count: 28,
  },
  {
    name: 'Instruments de mesure',
    subtitle: 'Lasers, détecteurs, mètres',
    handle: 'instruments-de-mesure',
    image: '/images/categories/instruments-mesure.webp',
    count: 45,
  },
  {
    name: 'EPI & Vêtements',
    subtitle: 'Protection & confort',
    handle: 'epi-vetements',
    image: '/images/categories/epi.webp',
    count: 38,
  },
  {
    name: 'Extérieurs & Espaces verts',
    subtitle: 'Taille-haies, souffleurs...',
    handle: 'exterieurs-et-espaces-verts',
    image: '/images/categories/exterieurs.webp',
    count: 41,
  },
  {
    name: 'Assainissement',
    subtitle: 'Déboucheurs & inspection',
    handle: 'assainissement-et-nettoyage',
    image: '/images/categories/assainissement.webp',
    count: 22,
    bentoSize: 'wide',
  },
];

export const REVIEWS: Review[] = [
  {
    name: 'Ben Coates',
    job: '',
    city: '',
    rating: 5,
    text: "Le plus beau et gros revendeur Milwaukee, un réel plaisir. Un stock impressionnant et un accueil au top.",
    product: '',
    source: 'Google',
    date: 'Récent',
    verified: true,
  },
  {
    name: 'Fabian Massard',
    job: '',
    city: '',
    rating: 5,
    text: "Un stock de guerre et le service client qui va avec. Difficile de trouver mieux dans la région.",
    product: '',
    source: 'Google',
    date: 'Récent',
    verified: true,
  },
  {
    name: 'Vincent Leruth',
    job: '',
    city: '',
    rating: 5,
    text: "Flo prend le temps d'expliquer, service sérieux. On sent qu'il connaît ses produits sur le bout des doigts.",
    product: '',
    source: 'Google',
    date: 'Récent',
    verified: true,
  },
  {
    name: 'Ophélie',
    job: '',
    city: '',
    rating: 5,
    text: "Équipe absolument au top, professionnelle, matériel fiable. Je recommande à 100% !",
    product: '',
    source: 'Google',
    date: 'Récent',
    verified: true,
  },
  {
    name: 'Cliente',
    job: '',
    city: '',
    rating: 5,
    text: "Choix énorme et service impeccable. On se sent conseillé, pas vendu.",
    product: '',
    source: 'Google',
    date: 'Récent',
    verified: true,
  },
];

export const RATING_DISTRIBUTION: RatingDistribution[] = [
  { stars: 5, percent: 100 },
  { stars: 4, percent: 0 },
  { stars: 3, percent: 0 },
  { stars: 2, percent: 0 },
  { stars: 1, percent: 0 },
];

export const BESTSELLER_TABS = [
  { key: 'tous', label: 'TOUS' },
  { key: 'perceuses', label: 'PERCEUSES' },
  { key: 'scies', label: 'SCIES' },
  { key: 'meuleuses', label: 'MEULEUSES' },
  { key: 'batteries', label: 'BATTERIES' },
] as const;

export const SEARCH_PLACEHOLDERS = [
  'Rechercher un produit...',
  'Perceuse M18 FUEL...',
  'Batterie 5Ah...',
  'Meuleuse 125mm...',
];
