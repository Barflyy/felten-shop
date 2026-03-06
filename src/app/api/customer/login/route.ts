import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify/client';
import { CUSTOMER_ACCESS_TOKEN_CREATE } from '@/lib/shopify/queries';

interface AccessTokenResponse {
  customerAccessTokenCreate: {
    customerAccessToken: {
      accessToken: string;
      expiresAt: string;
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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const data = await shopifyFetch<AccessTokenResponse>({
      query: CUSTOMER_ACCESS_TOKEN_CREATE,
      variables: {
        input: { email, password },
      },
      revalidate: 0,
    });

    const { customerAccessToken, customerUserErrors } = data.customerAccessTokenCreate;

    if (customerUserErrors.length > 0) {
      const error = customerUserErrors[0];
      let message = error.message;

      // Translate common errors to French
      if (error.code === 'UNIDENTIFIED_CUSTOMER') {
        message = 'Email ou mot de passe incorrect';
      }

      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (!customerAccessToken) {
      return NextResponse.json(
        { error: 'Erreur de connexion' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      accessToken: customerAccessToken.accessToken,
      expiresAt: customerAccessToken.expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
