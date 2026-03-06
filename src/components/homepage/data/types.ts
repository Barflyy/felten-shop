export interface CategoryItem {
  name: string;
  subtitle: string;
  handle: string;
  image: string;
  count: number;
}

export interface Review {
  name: string;
  job: string;
  city: string;
  rating: number;
  text: string;
  product: string;
  source: string;
  date: string;
  verified: boolean;
}

export interface RatingDistribution {
  stars: number;
  percent: number;
}

export interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText: string | null };
  priceRange: { minVariantPrice: { amount: string } };
}

export type TabKey = 'tous' | 'perceuses' | 'visseuses' | 'meuleuses' | 'batteries';
