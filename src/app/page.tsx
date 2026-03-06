import { HomePage } from '@/components/homepage';
import { getProducts } from '@/lib/shopify';

export default async function Home() {
  const products = await getProducts(24);
  return <HomePage products={products} />;
}
