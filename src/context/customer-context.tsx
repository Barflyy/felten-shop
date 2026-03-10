'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Customer } from '@/lib/shopify/types';

interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

interface CustomerContextType {
  customer: Customer | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, firstName: string, lastName: string, vatData?: {
    vatNumber: string;
    countryCode: string;
    companyName: string;
    valid: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  updateCustomer: (data: CustomerUpdateInput) => Promise<{ success: boolean; error?: string }>;
  refreshCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const TOKEN_KEY = 'shopify_customer_token';
const TOKEN_EXPIRY_KEY = 'shopify_customer_token_expiry';

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getStoredToken = useCallback(() => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) return null;

    // Check if token is expired
    if (new Date(expiry) < new Date()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }

    return token;
  }, []);

  const fetchCustomer = useCallback(async (accessToken: string) => {
    try {
      const response = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const data = await response.json();

      if (data.customer) {
        setCustomer(data.customer);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return false;
    }
  }, []);

  const refreshCustomer = useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      await fetchCustomer(token);
    }
  }, [getStoredToken, fetchCustomer]);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (token) {
        const success = await fetchCustomer(token);
        if (!success) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(TOKEN_EXPIRY_KEY);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [getStoredToken, fetchCustomer]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, data.expiresAt);
        await fetchCustomer(data.accessToken);
        return { success: true };
      }

      return { success: false, error: data.error || 'Erreur de connexion' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, vatData?: {
    vatNumber: string;
    countryCode: string;
    companyName: string;
    valid: boolean;
  }) => {
    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, vatData }),
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login after registration
        return await login(email, password);
      }

      return { success: false, error: data.error || 'Erreur lors de l\'inscription' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  };

  const updateCustomer = async (data: CustomerUpdateInput) => {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'Non connecté' };

    try {
      const response = await fetch('/api/customer/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, customer: data }),
      });

      const result = await response.json();

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Refresh customer data
      await fetchCustomer(token);
      return { success: true };
    } catch (error) {
      console.error('Customer update error:', error);
      return { success: false, error: 'Erreur lors de la mise à jour' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        accessToken: getStoredToken(),
        isLoading,
        isAuthenticated: !!customer,
        login,
        logout,
        register,
        updateCustomer,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}
