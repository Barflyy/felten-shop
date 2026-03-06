import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { CUSTOMER_QUERY } from '@/lib/shopify/queries';
import { Customer } from '@/lib/shopify/types';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const data = await shopifyFetch<{ customer: Customer }>({
      query: CUSTOMER_QUERY,
      variables: { customerAccessToken: accessToken },
      revalidate: 0, // Don't cache customer data
    });

    if (!data.customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ customer: data.customer });
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
