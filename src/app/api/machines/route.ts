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

// Machine metadata structure stored in customer metafield
// Format: { "productId:variantId:orderNumber": { nickname: string, serialNumber: string } }
interface MachineMetadata {
  nickname?: string;
  serialNumber?: string;
}

type MachinesData = Record<string, MachineMetadata>;

// GET: Retrieve machine metadata for a customer
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');

  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
  }

  try {
    const accessToken = await getAdminAccessToken();

    const query = `
      query GetCustomerMachines($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "machines", key: "data") {
            value
          }
        }
      }
    `;

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query,
          variables: { id: customerId },
        }),
      }
    );

    const data = await response.json();

    if (data.errors) {
      console.error('Admin API errors:', data.errors);
      return NextResponse.json({ error: 'API error' }, { status: 500 });
    }

    const metafieldValue = data.data?.customer?.metafield?.value;
    const machinesData: MachinesData = metafieldValue ? JSON.parse(metafieldValue) : {};

    return NextResponse.json({ machines: machinesData });
  } catch (error) {
    console.error('Error fetching machine metadata:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Update machine metadata for a customer
export async function POST(request: Request) {
  try {
    const { customerId, machineKey, nickname, serialNumber } = await request.json();

    if (!customerId || !machineKey) {
      return NextResponse.json({ error: 'Customer ID and machine key required' }, { status: 400 });
    }

    const accessToken = await getAdminAccessToken();

    // First, get existing metafield data
    const getQuery = `
      query GetCustomerMachines($id: ID!) {
        customer(id: $id) {
          metafield(namespace: "machines", key: "data") {
            id
            value
          }
        }
      }
    `;

    const getResponse = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-10/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: getQuery,
          variables: { id: customerId },
        }),
      }
    );

    const getData = await getResponse.json();
    const existingValue = getData.data?.customer?.metafield?.value;
    const machinesData: MachinesData = existingValue ? JSON.parse(existingValue) : {};

    // Update the specific machine
    machinesData[machineKey] = {
      ...machinesData[machineKey],
      ...(nickname !== undefined && { nickname }),
      ...(serialNumber !== undefined && { serialNumber }),
    };

    // Save back to metafield
    const updateQuery = `
      mutation UpdateCustomerMetafield($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
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
              id: customerId,
              metafields: [
                {
                  namespace: 'machines',
                  key: 'data',
                  type: 'json',
                  value: JSON.stringify(machinesData),
                },
              ],
            },
          },
        }),
      }
    );

    const updateData = await updateResponse.json();

    if (updateData.errors || updateData.data?.customerUpdate?.userErrors?.length > 0) {
      console.error('Update errors:', updateData.errors || updateData.data?.customerUpdate?.userErrors);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, machines: machinesData });
  } catch (error) {
    console.error('Error updating machine metadata:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
