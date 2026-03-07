import { NextResponse } from 'next/server';

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
    throw new Error('Failed to get Admin access token');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

const FIND_CUSTOMER_QUERY = `
  query FindCustomer($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          tags
          metafields(first: 10, namespace: "custom") {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

interface CustomerNode {
  id: string;
  tags: string[];
  metafields: {
    edges: {
      node: {
        key: string;
        value: string;
      };
    }[];
  };
}

interface ProStatusResponse {
  isPro: boolean;
  isPending: boolean;
  vatNumber: string | null;
  companyName: string | null;
  countryCode: string | null;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // If Admin API is not configured, return defaults
    if (!CLIENT_ID || !CLIENT_SECRET) {
      return NextResponse.json<ProStatusResponse>({
        isPro: false,
        isPending: false,
        vatNumber: null,
        companyName: null,
        countryCode: null,
      });
    }

    const token = await getAdminAccessToken();
    const url = `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({
        query: FIND_CUSTOMER_QUERY,
        variables: { query: `email:${email}` },
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Shopify Admin API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    if (json.errors) {
      console.error('Shopify Admin API errors:', json.errors);
      throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
    }

    const customerNode: CustomerNode | undefined = json.data?.customers?.edges?.[0]?.node;

    if (!customerNode) {
      return NextResponse.json<ProStatusResponse>({
        isPro: false,
        isPending: false,
        vatNumber: null,
        companyName: null,
        countryCode: null,
      });
    }

    const tags = customerNode.tags.map((t) => t.toLowerCase());
    const metafields = customerNode.metafields.edges.map((e) => e.node);

    const getMetafield = (key: string): string | null => {
      const mf = metafields.find((m) => m.key === key);
      return mf?.value || null;
    };

    const result: ProStatusResponse = {
      isPro: tags.includes('pro'),
      isPending: tags.includes('pro-pending'),
      vatNumber: getMetafield('vat_number'),
      companyName: getMetafield('company_name'),
      countryCode: getMetafield('vat_country_code'),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Pro status API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
