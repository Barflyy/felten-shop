import { shopifyFetch } from './client';
import { PRODUCTS_QUERY, COLLECTION_BY_HANDLE_QUERY, SHOP_POLICIES_QUERY } from './queries';
import { Product } from './types';

interface ProductEdge {
  node: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    tags?: string[];
    productType?: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          availableForSale: boolean;
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice?: {
            amount: string;
            currencyCode: string;
          };
          metafields?: Array<{
            namespace: string;
            key: string;
            value: string;
          }>;
        };
      }>;
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText?: string;
          width?: number;
          height?: number;
        };
      }>;
    };
  };
}

interface ProductsResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: ProductEdge[];
  };
}

interface CollectionResponse {
  collection: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    products: {
      edges: ProductEdge[];
    };
  } | null;
}

function reshapeProduct(productNode: ProductEdge['node']): Product {
  const variant = productNode.variants.edges[0]?.node;
  const image = productNode.images.edges[0]?.node;

  return {
    id: productNode.id,
    title: productNode.title,
    handle: productNode.handle,
    description: productNode.description || '',
    featuredImage: productNode.featuredImage || image
      ? {
          url: productNode.featuredImage?.url || image?.url || '',
          altText: productNode.featuredImage?.altText || image?.altText || productNode.title,
        }
      : undefined,
    priceRange: productNode.priceRange,
    images: {
      edges: productNode.images.edges.map((edge) => ({
        node: {
          url: edge.node.url,
          altText: edge.node.altText || null,
          width: edge.node.width,
          height: edge.node.height,
        },
      })),
    },
    variants: {
      edges: productNode.variants.edges.map((edge) => ({
        node: {
          id: edge.node.id,
          title: '',
          sku: '',
          availableForSale: edge.node.availableForSale,
          price: edge.node.price,
          compareAtPrice: edge.node.compareAtPrice,
          selectedOptions: [],
          metafields: edge.node.metafields || [],
        },
      })),
    },
    availableForSale: variant?.availableForSale ?? true,
    compareAtPrice: variant?.compareAtPrice,
    tags: productNode.tags || [],
    productType: productNode.productType || '',
  };
}

/**
 * Fetch products with pagination support
 * @param first - Number of products per page (max 250)
 * @param fetchAll - If true, fetches ALL products using cursor pagination
 */
export async function getProducts(first: number = 20, fetchAll: boolean = false): Promise<Product[]> {
  try {
    const allProducts: Product[] = [];
    let hasNextPage: boolean = true;
    let cursor: string | null = null;

    // Shopify max is 250 per request
    const pageSize = Math.min(first, 250);

    while (hasNextPage) {
      const response: ProductsResponse = await shopifyFetch<ProductsResponse>({
        query: PRODUCTS_QUERY,
        variables: {
          first: pageSize,
          after: cursor,
        },
        tags: ['products'],
      });

      const products = response.products.edges.map((edge) => reshapeProduct(edge.node));
      allProducts.push(...products);

      // If not fetching all, stop after first page
      if (!fetchAll) {
        break;
      }

      hasNextPage = response.products.pageInfo.hasNextPage;
      cursor = response.products.pageInfo.endCursor;

      // Safety limit to prevent infinite loops
      if (allProducts.length > 2000) {
        console.warn('Product fetch limit reached (2000)');
        break;
      }
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch ALL products (convenience function)
 */
export async function getAllProducts(): Promise<Product[]> {
  return getProducts(250, true);
}

export async function getCollectionProducts({
  collection,
  first = 20,
}: {
  collection: string;
  first?: number;
}): Promise<Product[]> {
  try {
    // Si collection est "all", récupérer tous les produits
    if (collection === 'all') {
      return getAllProducts();
    }

    const data = await shopifyFetch<CollectionResponse>({
      query: COLLECTION_BY_HANDLE_QUERY,
      variables: { handle: collection },
      tags: [`collection-${collection}`, 'collections'],
    });

    if (!data.collection) {
      return [];
    }

    return data.collection.products.edges.map((edge) => reshapeProduct(edge.node));
  } catch (error) {
    console.error('Error fetching collection products:', error);
    return [];
  }
}

export interface ShopPolicy {
  title: string;
  body: string;
  handle: string;
}

interface ShopPoliciesResponse {
  shop: {
    privacyPolicy: ShopPolicy | null;
    termsOfService: ShopPolicy | null;
    refundPolicy: ShopPolicy | null;
    shippingPolicy: ShopPolicy | null;
  };
}

export async function getShopPolicies(): Promise<ShopPoliciesResponse['shop']> {
  try {
    const data = await shopifyFetch<ShopPoliciesResponse>({
      query: SHOP_POLICIES_QUERY,
      tags: ['shop-policies'],
    });
    return data.shop;
  } catch (error) {
    console.error('Error fetching shop policies:', error);
    return {
      privacyPolicy: null,
      termsOfService: null,
      refundPolicy: null,
      shippingPolicy: null,
    };
  }
}

export * from './client';
export * from './queries';
export * from './types';
export * from './menu';
