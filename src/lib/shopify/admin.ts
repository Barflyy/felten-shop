/**
 * Shopify Admin API Client
 *
 * Utilise le flow OAuth client_credentials avec SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET
 * définis dans .env.local pour obtenir un token Admin API à la volée.
 */

const ADMIN_API_VERSION = '2025-01';
const STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || '';

// ─── Token Cache ─────────────────────────────────────────────────────────────

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
    const text = await response.text();
    throw new Error(`Échec obtention token Admin: ${response.status} ${text}`);
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cachedToken.token;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type AdminProduct = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  status: string;
  productType: string;
  tags: string[];
  imageUrl: string | null;
  metafields: AdminMetafield[];
  variants: AdminVariant[];
};

export type AdminMetafield = {
  id: string | null;
  namespace: string;
  key: string;
  value: string;
  type: string;
};

export type AdminVariant = {
  id: string;
  title: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  inventoryQuantity: number;
  imageUrl: string | null;
  inventoryItemId: string;
  locationId: string;
  unitCost: string;
  selectedOptions: { name: string; value: string }[];
};

export type AdminProductListItem = {
  id: string;
  numericId: string;
  title: string;
  handle: string;
  status: string;
  productType: string;
  imageUrl: string | null;
  totalInventory: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cleanHtml(html: string): string {
  const stripped = html.replace(/<[^>]*>/g, '').trim();
  return stripped ? html : '';
}

function cleanSku(sku: string | null): string {
  if (!sku) return '';
  return sku.replace(/\.0$/, '');
}

function extractNumericId(gid: string): string {
  return gid.split('/').pop() || '';
}

// ─── Generic Fetch ───────────────────────────────────────────────────────────

export function isAdminConfigured(): boolean {
  return Boolean(STORE_DOMAIN && CLIENT_ID && CLIENT_SECRET);
}

async function adminFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!isAdminConfigured()) {
    throw new Error('SHOPIFY_CLIENT_ID ou SHOPIFY_CLIENT_SECRET non configuré dans .env.local');
  }

  const token = await getAdminAccessToken();
  const url = `https://${STORE_DOMAIN}/admin/api/${ADMIN_API_VERSION}/graphql.json`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
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

  return json.data;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const GET_PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      descriptionHtml
      status
      productType
      tags
      images(first: 1) {
        edges {
          node {
            url
            altText
          }
        }
      }
      metafields(first: 30) {
        edges {
          node {
            id
            namespace
            key
            value
            type
          }
        }
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            image {
              url
              altText
            }
            selectedOptions {
              name
              value
            }
            inventoryItem {
              id
              unitCost {
                amount
              }
              inventoryLevels(first: 5) {
                edges {
                  node {
                    location {
                      id
                      name
                    }
                    quantities(names: ["available"]) {
                      name
                      quantity
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($query: String, $first: Int!) {
    products(first: $first, query: $query, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          status
          productType
          totalInventory
          featuredImage {
            url
          }
        }
      }
    }
  }
`;

// ─── Mutations ───────────────────────────────────────────────────────────────

const PRODUCT_UPDATE_MUTATION = `
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `
  mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const VARIANTS_BULK_UPDATE_MUTATION = `
  mutation VariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const INVENTORY_SET_MUTATION = `
  mutation InventorySet($input: InventorySetQuantitiesInput!) {
    inventorySetQuantities(input: $input) {
      inventoryAdjustmentGroup {
        reason
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COLLECTION_CREATE_MUTATION = `
  mutation collectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ─── Exported Functions ──────────────────────────────────────────────────────

export async function getAdminProduct(numericId: string): Promise<AdminProduct> {
  const gid = `gid://shopify/Product/${numericId}`;

  const data = await adminFetch<{
    product: {
      id: string;
      title: string;
      handle: string;
      descriptionHtml: string;
      status: string;
      productType: string;
      tags: string[];
      images: { edges: { node: { url: string; altText: string | null } }[] };
      metafields: {
        edges: {
          node: { id: string; namespace: string; key: string; value: string; type: string };
        }[];
      };
      variants: {
        edges: {
          node: {
            id: string;
            title: string;
            sku: string | null;
            price: string;
            compareAtPrice: string | null;
            inventoryQuantity: number;
            image: { url: string; altText: string | null } | null;
            selectedOptions: { name: string; value: string }[];
            inventoryItem: {
              id: string;
              unitCost: { amount: string } | null;
              inventoryLevels: {
                edges: {
                  node: {
                    location: { id: string; name: string };
                    quantities: { name: string; quantity: number }[];
                  };
                }[];
              };
            };
          };
        }[];
      };
    } | null;
  }>(GET_PRODUCT_QUERY, { id: gid });

  if (!data.product) {
    throw new Error(`Produit ${numericId} introuvable`);
  }

  const p = data.product;

  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    descriptionHtml: cleanHtml(p.descriptionHtml),
    status: p.status,
    productType: p.productType,
    tags: p.tags,
    imageUrl: p.images.edges[0]?.node.url || null,
    metafields: p.metafields.edges.map(({ node }) => ({
      id: node.id,
      namespace: node.namespace,
      key: node.key,
      value: node.value,
      type: node.type,
    })),
    variants: p.variants.edges.map(({ node }) => {
      const firstLevel = node.inventoryItem.inventoryLevels.edges[0]?.node;
      return {
        id: node.id,
        title: node.title,
        sku: cleanSku(node.sku),
        price: node.price,
        compareAtPrice: node.compareAtPrice || '',
        inventoryQuantity: node.inventoryQuantity,
        imageUrl: node.image?.url || null,
        inventoryItemId: node.inventoryItem.id,
        locationId: firstLevel?.location.id || '',
        unitCost: node.inventoryItem.unitCost?.amount || '',
        selectedOptions: node.selectedOptions,
      };
    }),
  };
}

export async function searchAdminProducts(query?: string, status?: string): Promise<AdminProductListItem[]> {
  let shopifyQuery = query || '';
  if (status) {
    shopifyQuery = `${shopifyQuery} status:${status}`.trim();
  }

  const data = await adminFetch<{
    products: {
      edges: {
        node: {
          id: string;
          title: string;
          handle: string;
          status: string;
          productType: string;
          totalInventory: number;
          featuredImage: { url: string } | null;
        };
      }[];
    };
  }>(SEARCH_PRODUCTS_QUERY, { query: shopifyQuery, first: 50 });

  return data.products.edges.map(({ node }) => ({
    id: node.id,
    numericId: extractNumericId(node.id),
    title: node.title,
    handle: node.handle,
    status: node.status,
    productType: node.productType,
    imageUrl: node.featuredImage?.url || null,
    totalInventory: node.totalInventory,
  }));
}

export async function updateProduct(input: {
  id: string;
  title?: string;
  descriptionHtml?: string;
  tags?: string[];
  status?: string;
}) {
  const data = await adminFetch<{
    productUpdate: {
      product: { id: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(PRODUCT_UPDATE_MUTATION, { input });

  if (data.productUpdate.userErrors.length > 0) {
    throw new Error(data.productUpdate.userErrors.map(e => e.message).join(', '));
  }

  return data.productUpdate.product;
}

export async function setMetafields(
  ownerId: string,
  metafields: { namespace: string; key: string; value: string; type: string }[]
) {
  const input = metafields
    .filter(m => m.value !== '')
    .map(m => ({
      ownerId,
      namespace: m.namespace,
      key: m.key,
      value: m.value,
      type: m.type,
    }));

  if (input.length === 0) return;

  const data = await adminFetch<{
    metafieldsSet: {
      metafields: { id: string }[] | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(METAFIELDS_SET_MUTATION, { metafields: input });

  if (data.metafieldsSet.userErrors.length > 0) {
    throw new Error(data.metafieldsSet.userErrors.map(e => e.message).join(', '));
  }
}

export async function bulkUpdateVariants(
  productId: string,
  variants: { id: string; price: string; compareAtPrice: string | null; sku: string }[]
) {
  const data = await adminFetch<{
    productVariantsBulkUpdate: {
      product: { id: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(VARIANTS_BULK_UPDATE_MUTATION, {
    productId,
    variants: variants.map(v => ({
      id: v.id,
      price: v.price,
      compareAtPrice: v.compareAtPrice || null,
      inventoryItem: { sku: v.sku },
    })),
  });

  if (data.productVariantsBulkUpdate.userErrors.length > 0) {
    throw new Error(data.productVariantsBulkUpdate.userErrors.map(e => e.message).join(', '));
  }
}

export async function bulkUpdateVariantPricesOnly(
  productId: string,
  variants: { id: string; price: string }[]
) {
  const data = await adminFetch<{
    productVariantsBulkUpdate: {
      product: { id: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(VARIANTS_BULK_UPDATE_MUTATION, {
    productId,
    variants,
  });

  if (data.productVariantsBulkUpdate.userErrors.length > 0) {
    throw new Error(data.productVariantsBulkUpdate.userErrors.map(e => e.message).join(', '));
  }
}

export async function setInventoryQuantities(
  quantities: { inventoryItemId: string; locationId: string; quantity: number }[]
) {
  if (quantities.length === 0) return;

  const validQuantities = quantities.filter(q => q.locationId);
  if (validQuantities.length === 0) return;

  const data = await adminFetch<{
    inventorySetQuantities: {
      inventoryAdjustmentGroup: { reason: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(INVENTORY_SET_MUTATION, {
    input: {
      reason: 'correction',
      name: 'available',
      quantities: validQuantities,
    },
  });

  if (data.inventorySetQuantities.userErrors.length > 0) {
    throw new Error(data.inventorySetQuantities.userErrors.map(e => e.message).join(', '));
  }
}

export async function createSmartCollection(input: {
  title: string;
  descriptionHtml?: string;
  ruleSet: {
    appliedDisjunctively: boolean;
    rules: { column: string; relation: string; condition: string }[];
  };
}) {
  const data = await adminFetch<{
    collectionCreate: {
      collection: { id: string; title: string; handle: string } | null;
      userErrors: { field: string[]; message: string }[];
    };
  }>(COLLECTION_CREATE_MUTATION, { input });

  if (data.collectionCreate.userErrors.length > 0) {
    throw new Error(data.collectionCreate.userErrors.map(e => e.message).join(', '));
  }

  return data.collectionCreate.collection;
}
