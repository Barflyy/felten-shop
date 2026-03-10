import { NextRequest, NextResponse } from 'next/server';

const ADMIN_API_VERSION = '2025-01';
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || '';

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://${STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Token error: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = await getAdminAccessToken();
  const res = await fetch(
    `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Shopify Admin API error: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return json.data;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Check if customer already exists
    const searchData = await adminFetch<{
      customers: { edges: { node: { id: string } }[] };
    }>(`
      query FindCustomer($query: String!) {
        customers(first: 1, query: $query) {
          edges { node { id } }
        }
      }
    `, { query: `email:${email}` });

    const existingCustomer = searchData.customers.edges[0]?.node;

    if (existingCustomer) {
      // Update existing customer: add tag + marketing consent
      await adminFetch(`
        mutation UpdateCustomer($input: CustomerInput!) {
          customerUpdate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }
      `, {
        input: {
          id: existingCustomer.id,
          tags: ['pre-launch'],
          emailMarketingConsent: {
            marketingOptInLevel: 'SINGLE_OPT_IN',
            marketingState: 'SUBSCRIBED',
          },
        },
      });
    } else {
      // Create new customer with marketing consent
      await adminFetch(`
        mutation CustomerCreate($input: CustomerInput!) {
          customerCreate(input: $input) {
            customer { id }
            userErrors { field message }
          }
        }
      `, {
        input: {
          email,
          tags: ['pre-launch'],
          emailMarketingConsent: {
            marketingOptInLevel: 'SINGLE_OPT_IN',
            marketingState: 'SUBSCRIBED',
          },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
