'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart } from '@/lib/shopify/types';
import { shopifyFetch } from '@/lib/shopify/client';
import { CREATE_CART_MUTATION, ADD_TO_CART_MUTATION, GET_CART_QUERY, UPDATE_CART_LINE_MUTATION, REMOVE_CART_LINE_MUTATION, CART_BUYER_IDENTITY_UPDATE_MUTATION } from '@/lib/shopify/queries';

interface CartContextType {
  cart: Cart | null;
  isOpen: boolean;
  isLoading: boolean;
  totalItems: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateCartLine: (lineId: string, quantity: number) => Promise<void>;
  removeCartLine: (lineId: string) => Promise<void>;
  associateCustomer: (email: string, customerAccessToken?: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const cartId = localStorage.getItem('shopify_cart_id');
    if (cartId) {
      fetchCart(cartId);
    }
  }, []);

  const fetchCart = async (cartId: string) => {
    try {
      const data = await shopifyFetch<{ cart: Cart }>({
        query: GET_CART_QUERY,
        variables: { cartId },
        revalidate: 0, // Don't cache cart data
      });
      if (data.cart) {
        setCart(data.cart);
      } else {
        localStorage.removeItem('shopify_cart_id');
      }
    } catch {
      localStorage.removeItem('shopify_cart_id');
    }
  };

  const createCart = async (variantId: string, quantity: number) => {
    const data = await shopifyFetch<{ cartCreate: { cart: Cart; userErrors?: Array<{ field: string; message: string }> } }>({
      query: CREATE_CART_MUTATION,
      variables: {
        input: {
          lines: [{ merchandiseId: variantId, quantity }],
        },
      },
      revalidate: 0, // Don't cache mutations
    });

    if (data.cartCreate.userErrors?.length) {
      console.error('Cart create errors:', data.cartCreate.userErrors);
      throw new Error(data.cartCreate.userErrors[0].message);
    }

    const newCart = data.cartCreate.cart;
    localStorage.setItem('shopify_cart_id', newCart.id);
    return newCart;
  };

  const addToCart = async (variantId: string, quantity = 1) => {
    if (!variantId) {
      console.error('addToCart: variantId is required');
      return;
    }

    setIsLoading(true);
    try {
      let updatedCart: Cart;

      if (!cart) {
        console.log('Creating new cart with variant:', variantId);
        updatedCart = await createCart(variantId, quantity);
      } else {
        console.log('Adding to existing cart:', cart.id, 'variant:', variantId);
        const data = await shopifyFetch<{ cartLinesAdd: { cart: Cart; userErrors?: Array<{ field: string; message: string }> } }>({
          query: ADD_TO_CART_MUTATION,
          variables: {
            cartId: cart.id,
            lines: [{ merchandiseId: variantId, quantity }],
          },
          revalidate: 0, // Don't cache mutations
        });

        if (data.cartLinesAdd.userErrors?.length) {
          console.error('Cart add errors:', data.cartLinesAdd.userErrors);
          throw new Error(data.cartLinesAdd.userErrors[0].message);
        }

        updatedCart = data.cartLinesAdd.cart;
      }

      console.log('Cart updated successfully');
      setCart(updatedCart);
      setIsOpen(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartLine = async (lineId: string, quantity: number) => {
    if (!cart) return;

    setIsLoading(true);
    try {
      const data = await shopifyFetch<{ cartLinesUpdate: { cart: Cart } }>({
        query: UPDATE_CART_LINE_MUTATION,
        variables: {
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
        },
        revalidate: 0,
      });
      setCart(data.cartLinesUpdate.cart);
    } catch (error) {
      console.error('Error updating cart line:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartLine = async (lineId: string) => {
    if (!cart) return;

    setIsLoading(true);
    try {
      const data = await shopifyFetch<{ cartLinesRemove: { cart: Cart } }>({
        query: REMOVE_CART_LINE_MUTATION,
        variables: {
          cartId: cart.id,
          lineIds: [lineId],
        },
        revalidate: 0,
      });
      setCart(data.cartLinesRemove.cart);
    } catch (error) {
      console.error('Error removing cart line:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = cart?.lines.edges.reduce((sum, edge) => sum + edge.node.quantity, 0) ?? 0;

  // Associate a customer with the cart for tax exemption and pre-filled checkout
  const associateCustomer = async (email: string, customerAccessToken?: string) => {
    if (!cart) return;

    try {
      // If we have the access token, use it to fully authenticate the customer
      // This pre-fills all saved addresses and info at checkout
      const buyerIdentity: { email: string; customerAccessToken?: string } = { email };
      if (customerAccessToken) {
        buyerIdentity.customerAccessToken = customerAccessToken;
      }

      const data = await shopifyFetch<{ cartBuyerIdentityUpdate: { cart: Cart; userErrors: Array<{ field: string; message: string }> } }>({
        query: CART_BUYER_IDENTITY_UPDATE_MUTATION,
        variables: {
          cartId: cart.id,
          buyerIdentity,
        },
        revalidate: 0,
      });

      if (data.cartBuyerIdentityUpdate.userErrors?.length > 0) {
        console.error('Error associating customer with cart:', data.cartBuyerIdentityUpdate.userErrors);
        return;
      }

      setCart(data.cartBuyerIdentityUpdate.cart);
      console.log('Customer associated with cart:', email, customerAccessToken ? '(with access token)' : '');
    } catch (error) {
      console.error('Error associating customer with cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isLoading,
        totalItems,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateCartLine,
        removeCartLine,
        associateCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
