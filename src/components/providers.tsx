'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { CartProvider } from '@/context/cart-context';
import { CustomerProvider } from '@/context/customer-context';
import { VATProvider } from '@/context/vat-context';


const CartDrawer = dynamic(() => import('@/components/cart-drawer').then(m => m.CartDrawer), {
  ssr: false,
});

const CookieBanner = dynamic(() => import('@/components/CookieBanner').then(m => m.CookieBanner), {
  ssr: false,
});

const GlobalFloatingElements = dynamic(() => import('@/components/GlobalFloatingElements').then(m => m.GlobalFloatingElements), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CustomerProvider>
      <VATProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <CookieBanner />
          <GlobalFloatingElements />
        </CartProvider>
      </VATProvider>
    </CustomerProvider>
  );
}
