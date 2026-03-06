import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ categorie: string }>;
}

export default async function CategorieRedirect({ params }: Props) {
  const { categorie } = await params;
  redirect(`/collections/${categorie}`);
}
