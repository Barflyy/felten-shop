export interface HubProfile {
  slug: string;
  name: string;
  title: string;
  company: string;
  bio?: string;
  avatar: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  website: string;
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export const profiles: HubProfile[] = [
  {
    slug: 'florian',
    name: 'Florian Drouven',
    title: 'Revendeur Autorisé Milwaukee',
    company: 'Felten Shop',
    bio: 'Votre expert outillage professionnel Milwaukee au Luxembourg. Conseil personnalisé, garantie 3 ans, livraison rapide.',
    avatar: '/images/team/florian-felten.jpg',
    phone: '+352621304952',
    email: 'florian@felten.lu',
    address: {
      street: 'Bei der Kapell 10',
      city: 'L-9775 Weicherdange',
      country: 'Luxembourg',
    },
    website: 'https://felten-shop.com',
    socials: {
      instagram: 'https://www.instagram.com/feltenshop/',
      facebook: 'https://www.facebook.com/feltenshop',
      tiktok: 'https://www.tiktok.com/@feltenshop',
    },
  },
];

export function getProfileBySlug(slug: string): HubProfile | undefined {
  return profiles.find((p) => p.slug === slug);
}
