import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { CUSTOMER_UPDATE } from '@/lib/shopify/queries';

export async function POST(request: Request) {
  try {
    const { accessToken, customer } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    // Only allow safe fields
    const allowedFields: Record<string, unknown> = {};
    if (customer.firstName !== undefined) allowedFields.firstName = customer.firstName;
    if (customer.lastName !== undefined) allowedFields.lastName = customer.lastName;
    if (customer.phone !== undefined) allowedFields.phone = customer.phone;
    if (customer.email !== undefined) allowedFields.email = customer.email;
    if (customer.password !== undefined) allowedFields.password = customer.password;

    const data = await shopifyFetch<{
      customerUpdate: {
        customer: { id: string; firstName: string; lastName: string; email: string; phone: string } | null;
        customerUserErrors: { code: string; field: string[]; message: string }[];
      };
    }>({
      query: CUSTOMER_UPDATE,
      variables: {
        customerAccessToken: accessToken,
        customer: allowedFields,
      },
      revalidate: 0,
    });

    const errors = data.customerUpdate.customerUserErrors;
    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ customer: data.customerUpdate.customer });
  } catch (error) {
    console.error('Customer update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
