import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ handle: string }>;
}

export default async function ProductsRedirect({ params }: Props) {
  const { handle } = await params;
  redirect(`/produit/${handle}`);
}
