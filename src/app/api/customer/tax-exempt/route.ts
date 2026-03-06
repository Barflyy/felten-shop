import { NextResponse } from 'next/server';

const SHOPIFY_ADMIN_API_VERSION = '2024-10';
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

// Cache for the access token (expires every 24h)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID!,
        client_secret: SHOPIFY_CLIENT_SECRET!,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get Admin access token:', errorText);
    throw new Error('Failed to authenticate with Shopify Admin API');
  }

  const data = await response.json();

  // Cache the token
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };

  console.log('Obtained new Admin API access token, expires in:', data.expires_in, 'seconds');

  return data.access_token;
}

// EU countries eligible for reverse charge (excluding seller's country LU)
const EU_COUNTRIES_FOR_EXEMPTION = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  // LU excluded - Luxembourg customers pay local VAT
];

interface TaxExemptRequest {
  customerEmail: string;
  vatNumber: string;
  countryCode: string;
  companyName?: string;
}

async function adminApiRequest(query: string, variables: Record<string, unknown>) {
  const accessToken = await getAdminAccessToken();

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    console.error('Shopify Admin API errors:', data.errors);
    throw new Error(data.errors[0]?.message || 'Admin API error');
  }

  return data.data;
}

async function findCustomerByEmail(email: string): Promise<{ id: string; taxExempt: boolean } | null> {
  const query = `
    query findCustomer($query: String!) {
      customers(first: 1, query: $query) {
        edges {
          node {
            id
            email
            taxExempt
            tags
          }
        }
      }
    }
  `;

  try {
    const data = await adminApiRequest(query, { query: `email:${email}` });
    const customer = data?.customers?.edges?.[0]?.node;

    if (customer) {
      return {
        id: customer.id,
        taxExempt: customer.taxExempt,
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding customer:', error);
    return null;
  }
}

async function updateCustomerTaxExempt(
  customerId: string,
  taxExempt: boolean,
  vatNumber: string,
  companyName?: string
): Promise<{ success: boolean; error?: string }> {
  // Build tags array
  const tags = taxExempt
    ? ['PRO', 'B2B', 'TVA_VALIDE', 'TVA_EXONERE', `VAT_${vatNumber}`]
    : ['PRO', 'B2B', 'TVA_VALIDE', `VAT_${vatNumber}`];

  const mutation = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          email
          taxExempt
          tags
          note
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  try {
    const data = await adminApiRequest(mutation, {
      input: {
        id: customerId,
        tags,
        taxExempt,
        note: `TVA Intracommunautaire: ${vatNumber}${companyName ? `\nEntreprise: ${companyName}` : ''}\nExonération TVA: ${taxExempt ? 'OUI (Autoliquidation UE)' : 'NON'}`,
      },
    });

    if (data?.customerUpdate?.userErrors?.length > 0) {
      const errors = data.customerUpdate.userErrors;
      console.error('Customer update user errors:', errors);
      return { success: false, error: errors[0]?.message };
    }

    console.log('Customer updated successfully:', {
      id: data?.customerUpdate?.customer?.id,
      taxExempt: data?.customerUpdate?.customer?.taxExempt,
      tags: data?.customerUpdate?.customer?.tags,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating customer:', error);
    return { success: false, error: String(error) };
  }
}

export async function POST(request: Request) {
  try {
    // Check for Admin API credentials
    if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
      console.error('SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET not configured');
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const body: TaxExemptRequest = await request.json();
    const { customerEmail, vatNumber, countryCode, companyName } = body;

    console.log('Tax exempt request:', { customerEmail, vatNumber, countryCode, companyName });

    if (!customerEmail || !vatNumber || !countryCode) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Find customer by email (with retries)
    let customer = await findCustomerByEmail(customerEmail);

    if (!customer) {
      // Customer might not be synced yet, retry after delays
      for (let i = 0; i < 3; i++) {
        console.log(`Customer not found, retry ${i + 1}/3...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        customer = await findCustomerByEmail(customerEmail);
        if (customer) break;
      }
    }

    if (!customer) {
      console.error('Customer not found after retries:', customerEmail);
      return NextResponse.json(
        { error: 'Client non trouvé', retry: true },
        { status: 404 }
      );
    }

    console.log('Found customer:', customer);

    // Determine if customer should be tax exempt
    // Only EU customers (not from Luxembourg) with valid VAT get exemption
    const shouldBeExempt = EU_COUNTRIES_FOR_EXEMPTION.includes(countryCode.toUpperCase());

    console.log('Should be exempt:', shouldBeExempt, 'Country:', countryCode);

    // Update customer
    const result = await updateCustomerTaxExempt(
      customer.id,
      shouldBeExempt,
      vatNumber,
      companyName
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de la mise à jour' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      taxExempt: shouldBeExempt,
      customerId: customer.id,
      message: shouldBeExempt
        ? 'Client exonéré de TVA (autoliquidation UE)'
        : 'TVA applicable (client local ou hors UE)',
    });
  } catch (error) {
    console.error('Tax exempt API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur: ' + String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check customer status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
    return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
  }

  const customer = await findCustomerByEmail(email);

  if (!customer) {
    return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 });
  }

  return NextResponse.json({
    id: customer.id,
    taxExempt: customer.taxExempt,
  });
}
