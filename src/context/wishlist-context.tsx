'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'shopfelten_wishlist';

interface WishlistContextType {
  wishlistItems: string[];
  addToWishlist: (handle: string) => void;
  removeFromWishlist: (handle: string) => void;
  toggleWishlist: (handle: string) => void;
  isInWishlist: (handle: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlistItems(parsed);
        }
      }
    } catch {
      // Ignore invalid JSON
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change (skip initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const addToWishlist = useCallback((handle: string) => {
    setWishlistItems((prev) => {
      if (prev.includes(handle)) return prev;
      return [...prev, handle];
    });
  }, []);

  const removeFromWishlist = useCallback((handle: string) => {
    setWishlistItems((prev) => prev.filter((h) => h !== handle));
  }, []);

  const toggleWishlist = useCallback((handle: string) => {
    setWishlistItems((prev) => {
      if (prev.includes(handle)) {
        return prev.filter((h) => h !== handle);
      }
      return [...prev, handle];
    });
  }, []);

  const isInWishlist = useCallback(
    (handle: string) => wishlistItems.includes(handle),
    [wishlistItems]
  );

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
