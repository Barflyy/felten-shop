export interface Money {
  amount: string;
  currencyCode: string;
}

export interface Image {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface Metafield {
  namespace: string;
  key: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice?: Money;
  image?: Image;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  metafields?: Metafield[];
}

// Box content item for product kits
export interface BoxContentItem {
  label: string;
  qty: number;
  image: string | null;
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  featuredImage?: Image;
  priceRange: {
    minVariantPrice: Money;
  };
  images: {
    edges: {
      node: Image;
    }[];
  };
  variants?: {
    edges: {
      node: ProductVariant;
    }[];
  };
  options?: {
    name: string;
    values: string[];
  }[];
  availableForSale?: boolean;
  compareAtPrice?: Money;
  tags?: string[];
  productType?: string;
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: Image;
  products?: {
    edges: {
      node: Product;
    }[];
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
    };
    price: Money;
    image?: Image;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: {
      node: CartLine;
    }[];
  };
  cost: {
    totalAmount: Money;
  };
}

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  image?: string; // Path to category hero image
  items?: MenuItem[];
}

export interface Menu {
  id: string;
  title: string;
  items: MenuItem[];
}

// Customer Types
export interface CustomerAddress {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  company?: string;
  country: string;
  firstName: string;
  lastName: string;
  phone?: string;
  province?: string;
  zip: string;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    id: string;
    title: string;
    price: Money;
    image?: Image;
    product: {
      id: string;
      title: string;
      handle: string;
      productType: string;
      featuredImage?: Image;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: Money;
  lineItems: {
    edges: {
      node: OrderLineItem;
    }[];
  };
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  defaultAddress?: CustomerAddress;
  addresses: {
    edges: {
      node: CustomerAddress;
    }[];
  };
  orders: {
    edges: {
      node: Order;
    }[];
    totalCount: number;
  };
}
