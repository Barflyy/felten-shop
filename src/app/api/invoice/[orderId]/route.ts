import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceData, InvoiceLineItem } from '@/components/invoice/InvoicePDF';

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_STOREFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

// Cache for the admin access token
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

// Verify customer owns the order via Storefront API
async function verifyOrderOwnership(
  customerAccessToken: string,
  orderNumber: string
): Promise<boolean> {
  const query = `
    query GetCustomerOrders($token: String!) {
      customer(customerAccessToken: $token) {
        orders(first: 100) {
          edges {
            node {
              orderNumber
            }
          }
        }
      }
    }
  `;

  const response = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({ query, variables: { token: customerAccessToken } }),
    }
  );

  const data = await response.json();
  const orders = data.data?.customer?.orders?.edges || [];

  return orders.some(
    (edge: { node: { orderNumber: number } }) =>
      edge.node.orderNumber.toString() === orderNumber
  );
}

// Extract VAT number from customer note (format: "VAT: BE0123456789" or "TVA: FR12345678901")
function extractVatFromNote(note: string | null): string | null {
  if (!note) return null;

  // Look for VAT/TVA patterns
  const patterns = [
    /(?:VAT|TVA|N°\s*TVA|VAT\s*Number)[:\s]*([A-Z]{2}[0-9A-Z]{8,12})/i,
    /\b([A-Z]{2}[0-9]{8,11})\b/, // Generic EU VAT format
  ];

  for (const pattern of patterns) {
    const match = note.match(pattern);
    if (match) return match[1].toUpperCase();
  }

  return null;
}

// Fetch complete order data from Admin API
async function fetchOrderData(orderNumber: string): Promise<InvoiceData | null> {
  const accessToken = await getAdminAccessToken();

  const query = `
    query GetOrderDetails($query: String!) {
      orders(first: 1, query: $query) {
        edges {
          node {
            name
            createdAt
            email
            note
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              zip
              country
              countryCodeV2
              phone
            }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  originalUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  discountedUnitPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                  totalDiscountSet {
                    shopMoney {
                      amount
                    }
                  }
                }
              }
            }
            shippingLines(first: 5) {
              edges {
                node {
                  title
                  discountedPriceSet {
                    shopMoney {
                      amount
                    }
                  }
                }
              }
            }
            subtotalPriceSet {
              shopMoney {
                amount
              }
            }
            totalShippingPriceSet {
              shopMoney {
                amount
              }
            }
            totalTaxSet {
              shopMoney {
                amount
              }
            }
            totalPriceSet {
              shopMoney {
                amount
              }
            }
            taxLines {
              title
              rate
              priceSet {
                shopMoney {
                  amount
                }
              }
            }
            customer {
              taxExempt
              note
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
        variables: { query: `name:#${orderNumber}` },
      }),
    }
  );

  const data = await response.json();

  if (data.errors) {
    console.error('Admin API errors:', data.errors);
    return null;
  }

  const order = data.data?.orders?.edges?.[0]?.node;
  if (!order) return null;

  // === EXTRACT CUSTOMER VAT NUMBER ===
  // Priority: 1. Customer metafield, 2. Customer note, 3. Order note, 4. Customer tags
  let customerVatNumber: string | null = null;

  // 1. Check customer metafields
  const vatMetafield = order.customer?.metafields?.edges?.find(
    (e: { node: { key: string } }) => e.node.key === 'vat_number'
  );
  if (vatMetafield?.node?.value) {
    customerVatNumber = vatMetafield.node.value;
  }

  // 2. Check customer note
  if (!customerVatNumber && order.customer?.note) {
    customerVatNumber = extractVatFromNote(order.customer.note);
  }

  // 3. Check order note
  if (!customerVatNumber && order.note) {
    customerVatNumber = extractVatFromNote(order.note);
  }

  // 4. Check customer tags for VAT_XXXX pattern
  if (!customerVatNumber && order.customer?.tags) {
    const vatTag = order.customer.tags.find((tag: string) => tag.startsWith('VAT_'));
    if (vatTag) {
      customerVatNumber = vatTag.replace('VAT_', '');
    }
  }

  // === FISCAL LOGIC ===
  const totalTax = parseFloat(order.totalTaxSet.shopMoney.amount);
  const totalTTC = parseFloat(order.totalPriceSet.shopMoney.amount);
  const subtotalFromShopify = parseFloat(order.subtotalPriceSet.shopMoney.amount);
  const shippingTotal = parseFloat(order.totalShippingPriceSet?.shopMoney?.amount || '0');

  // Determine if this is a tax-exempt sale (export)
  const isTaxExempt = totalTax === 0;

  // Get VAT rate from tax lines (default 17% for Luxembourg)
  const vatRate = order.taxLines[0]?.rate || 0.17;

  // === CASE A: Sale with VAT (totalTax > 0) ===
  // Shopify prices are TTC, we need to calculate HT
  // subtotalFromShopify is HT (before tax), lineItem prices are TTC

  // === CASE B: Export/Exempt (totalTax == 0) ===
  // Prices are already HT (no tax applied)
  // MUST display customer VAT number

  // Process line items
  const lineItems: InvoiceLineItem[] = order.lineItems.edges.map(
    (edge: {
      node: {
        title: string;
        quantity: number;
        originalUnitPriceSet: { shopMoney: { amount: string } };
        discountedUnitPriceSet: { shopMoney: { amount: string } };
      };
    }) => {
      const item = edge.node;
      const unitPricePaid = parseFloat(item.discountedUnitPriceSet.shopMoney.amount);

      let unitPriceHT: number;
      let totalPriceHT: number;

      if (isTaxExempt) {
        // Case B: Price is already HT
        unitPriceHT = unitPricePaid;
        totalPriceHT = unitPricePaid * item.quantity;
      } else {
        // Case A: Price is TTC, calculate HT
        unitPriceHT = unitPricePaid / (1 + vatRate);
        totalPriceHT = unitPriceHT * item.quantity;
      }

      return {
        title: item.title,
        quantity: item.quantity,
        unitPrice: unitPriceHT,
        totalPrice: totalPriceHT,
      };
    }
  );

  // Process shipping
  const shippingLine = order.shippingLines.edges[0]?.node;
  let shippingPriceHT = 0;

  if (shippingLine) {
    const shippingPricePaid = parseFloat(shippingLine.discountedPriceSet.shopMoney.amount);
    shippingPriceHT = isTaxExempt ? shippingPricePaid : shippingPricePaid / (1 + vatRate);
  }

  // Calculate totals
  const itemsSubtotalHT = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotalHT = itemsSubtotalHT + shippingPriceHT;

  // Build invoice data
  const invoiceData: InvoiceData = {
    // Invoice identification
    orderNumber: order.name, // e.g., "#1008"
    orderDate: order.createdAt,

    // Customer info (full billing address)
    customerName: [
      order.billingAddress?.firstName,
      order.billingAddress?.lastName,
    ]
      .filter(Boolean)
      .join(' '),
    customerEmail: order.email,
    customerCompany: order.billingAddress?.company || undefined,
    customerVatNumber: customerVatNumber || undefined,
    billingAddress: {
      address1: order.billingAddress?.address1,
      address2: order.billingAddress?.address2,
      city: order.billingAddress?.city,
      zip: order.billingAddress?.zip,
      country: order.billingAddress?.country,
      phone: order.billingAddress?.phone,
    },

    // Line items (all HT)
    lineItems,

    // Shipping (HT)
    shippingTitle: shippingLine?.title,
    shippingPrice: shippingPriceHT,

    // Totals
    subtotalHT,
    vatRate: isTaxExempt ? 0 : vatRate,
    vatAmount: totalTax,
    totalTTC,

    // Tax status
    isTaxExempt,
  };

  return invoiceData;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  // Get customer access token from cookie or header
  const cookieHeader = request.headers.get('cookie') || '';
  const customerTokenMatch = cookieHeader.match(/customerAccessToken=([^;]+)/);
  const customerAccessToken = customerTokenMatch?.[1];

  // Also check Authorization header as fallback
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.replace('Bearer ', '');

  const accessToken = customerAccessToken || bearerToken;

  // Security check: User must be authenticated
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Non autorisé. Veuillez vous connecter.' },
      { status: 401 }
    );
  }

  // Security check: Verify order belongs to this customer
  const ownsOrder = await verifyOrderOwnership(accessToken, orderId);
  if (!ownsOrder) {
    return NextResponse.json(
      { error: 'Accès refusé. Cette commande ne vous appartient pas.' },
      { status: 403 }
    );
  }

  // Fetch order data
  const invoiceData = await fetchOrderData(orderId);
  if (!invoiceData) {
    return NextResponse.json(
      { error: 'Commande introuvable.' },
      { status: 404 }
    );
  }

  try {
    // Dynamic import for React PDF component
    const { InvoicePDF } = await import('@/components/invoice/InvoicePDF');
    const React = await import('react');

    // Generate PDF
    const element = React.createElement(InvoicePDF, { data: invoiceData });
    const pdfBuffer = await renderToBuffer(element as any);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF response
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-ShopFelten-${orderId}.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF.' },
      { status: 500 }
    );
  }
}
