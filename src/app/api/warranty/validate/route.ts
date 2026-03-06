import { NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

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

// POST: Add warranty validation tag to an order
export async function POST(request: Request) {
  try {
    const { orderNumber, action } = await request.json();

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number required' }, { status: 400 });
    }

    const accessToken = await getAdminAccessToken();

    // First, get the order ID from order number
    const searchQuery = `
      query GetOrderId($query: String!) {
        orders(first: 1, query: $query) {
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

    const searchResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: searchQuery,
          variables: { query: `name:#${orderNumber}` },
        }),
      }
    );

    const searchData = await searchResponse.json();
    const order = searchData.data?.orders?.edges?.[0]?.node;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare tags
    let newTags: string[];
    const currentTags: string[] = order.tags || [];
    const warrantyTag = 'garantie_validee';

    if (action === 'remove') {
      newTags = currentTags.filter(t => t !== warrantyTag && t !== 'warranty_validated');
    } else {
      // Add tag if not already present
      if (currentTags.includes(warrantyTag)) {
        return NextResponse.json({
          success: true,
          message: 'Tag already present',
          tags: currentTags
        });
      }
      newTags = [...currentTags, warrantyTag];
    }

    // Update order tags
    const updateQuery = `
      mutation UpdateOrderTags($input: OrderInput!) {
        orderUpdate(input: $input) {
          order {
            id
            tags
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const updateResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: updateQuery,
          variables: {
            input: {
              id: order.id,
              tags: newTags,
            },
          },
        }),
      }
    );

    const updateData = await updateResponse.json();

    if (updateData.errors || updateData.data?.orderUpdate?.userErrors?.length > 0) {
      console.error('Update errors:', updateData.errors || updateData.data?.orderUpdate?.userErrors);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'remove' ? 'Warranty tag removed' : 'Warranty validated',
      orderId: order.id,
      tags: updateData.data?.orderUpdate?.order?.tags,
    });

  } catch (error) {
    console.error('Warranty validation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
