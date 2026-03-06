import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { CUSTOMER_CREATE } from '@/lib/shopify/queries';

interface CustomerCreateResponse {
  customerCreate: {
    customer: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    } | null;
    customerUserErrors: {
      code: string;
      field: string[];
      message: string;
    }[];
  };
}

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const data = await shopifyFetch<CustomerCreateResponse>({
      query: CUSTOMER_CREATE,
      variables: {
        input: {
          email,
          password,
          firstName: firstName || '',
          lastName: lastName || '',
          acceptsMarketing: true,
        },
      },
      revalidate: 0,
    });

    const { customer, customerUserErrors } = data.customerCreate;

    if (customerUserErrors.length > 0) {
      const error = customerUserErrors[0];
      let message = error.message;

      // Translate common errors to French
      if (error.code === 'TAKEN') {
        message = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'TOO_SHORT') {
        message = 'Le mot de passe doit contenir au moins 5 caractères';
      } else if (error.code === 'INVALID') {
        message = 'Adresse email invalide';
      }

      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
