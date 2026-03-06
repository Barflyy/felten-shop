// =============================================================================
// HUB / DIGITAL BUSINESS CARD - Employee Data
// =============================================================================

export interface EmployeeLink {
  type: 'website' | 'instagram' | 'tiktok' | 'email' | 'phone' | 'google-review';
  label: string;
  url: string;
}

export interface Employee {
  slug: string;
  name: string;
  title: string;
  bio?: string;
  avatar: string;
  links: EmployeeLink[];
}

// =============================================================================
// MOCK DATA - Remplacer par une base de données ou CMS
// =============================================================================

export const employees: Employee[] = [
  {
    slug: 'florian-felten',
    name: 'Florian Felten',
    title: 'Gérant & Conseiller Technique',
    bio: 'Passionné d\'outillage professionnel. Je vous accompagne dans le choix de vos équipements Milwaukee.',
    avatar: '/images/team/florian-felten.jpg',
    links: [
      {
        type: 'website',
        label: 'Visiter le Site Web',
        url: 'https://felten-shop.com',
      },
      {
        type: 'instagram',
        label: 'Instagram',
        url: 'https://instagram.com/felten.shop',
      },
      {
        type: 'tiktok',
        label: 'TikTok',
        url: 'https://tiktok.com/@felten.shop',
      },
      {
        type: 'email',
        label: 'Envoyer un Email',
        url: 'mailto:contact@felten-shop.com',
      },
      {
        type: 'phone',
        label: 'Appeler',
        url: 'tel:+33600000000',
      },
      {
        type: 'google-review',
        label: 'Laissez-nous un avis ⭐',
        url: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review',
      },
    ],
  },
  {
    slug: 'demo',
    name: 'Jean Dupont',
    title: 'Commercial Terrain',
    bio: 'Spécialiste solutions M18 FUEL pour les professionnels du bâtiment.',
    avatar: '/images/team/demo.jpg',
    links: [
      {
        type: 'website',
        label: 'Visiter le Site Web',
        url: 'https://felten-shop.com',
      },
      {
        type: 'instagram',
        label: 'Instagram',
        url: 'https://instagram.com/felten.shop',
      },
      {
        type: 'tiktok',
        label: 'TikTok',
        url: 'https://tiktok.com/@felten.shop',
      },
      {
        type: 'email',
        label: 'Envoyer un Email',
        url: 'mailto:contact@felten-shop.com',
      },
      {
        type: 'phone',
        label: 'Appeler',
        url: 'tel:+33600000000',
      },
      {
        type: 'google-review',
        label: 'Laissez-nous un avis ⭐',
        url: 'https://g.page/r/YOUR_GOOGLE_REVIEW_LINK/review',
      },
    ],
  },
];

export function getEmployeeBySlug(slug: string): Employee | undefined {
  return employees.find((e) => e.slug === slug);
}
