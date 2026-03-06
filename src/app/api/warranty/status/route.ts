import { NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

// Tags that indicate warranty has been validated
const WARRANTY_TAGS = ['garantie_validee', 'garantie validée', 'warranty_validated'];

// Cache for the access token
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID!,
        client_secret: SHOPIFY_CLIENT_SECRET!,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get Admin access token');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// GET: Check warranty status for order numbers by reading Shopify order tags
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumbers = searchParams.get('orders')?.split(',').map(n => n.trim()) || [];

  if (orderNumbers.length === 0) {
    return NextResponse.json({ error: 'No order numbers provided' }, { status: 400 });
  }

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 });
  }

  try {
    const accessToken = await getAdminAccessToken();

    // Query orders by order number to check their tags
    const query = `
      query GetOrdersTags($query: String!) {
        orders(first: 50, query: $query) {
          edges {
            node {
              id
              name
              tags
            }
          }
        }
      }
    `;

    // Build query string for multiple order numbers
    const queryString = orderNumbers.map(n => `name:#${n}`).join(' OR ');

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query, variables: { query: queryString } }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('Admin API errors:', data.errors);
      return NextResponse.json({ error: 'API error', details: data.errors }, { status: 500 });
    }

    // Map order numbers to their warranty status
    const warrantyStatus: Record<string, boolean> = {};

    data.data?.orders?.edges?.forEach((edge: { node: { name: string; tags: string[] } }) => {
      const orderName = edge.node.name.replace('#', '');
      const tags = edge.node.tags.map((t: string) => t.toLowerCase());
      const isValidated = tags.some(tag =>
        WARRANTY_TAGS.some(wt => tag.includes(wt))
      );
      warrantyStatus[orderName] = isValidated;
    });

    // Set false for any orders not found
    orderNumbers.forEach(n => {
      if (!(n in warrantyStatus)) {
        warrantyStatus[n] = false;
      }
    });

    return NextResponse.json({ warrantyStatus });
  } catch (error) {
    console.error('Warranty status error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
