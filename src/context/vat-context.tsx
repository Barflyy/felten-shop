'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// VAT rates by country (standard rates)
const VAT_RATES: Record<string, number> = {
  LU: 17,
  FR: 20,
  BE: 21,
  DE: 19,
  NL: 21,
  AT: 20,
  IT: 22,
  ES: 21,
  PT: 23,
  IE: 23,
  PL: 23,
};

// Countries available for shipping (shown in selector)
export const SHIPPING_COUNTRIES = [
  { code: 'LU', label: 'Luxembourg', flag: '🇱🇺' },
  { code: 'FR', label: 'France', flag: '🇫🇷' },
  { code: 'BE', label: 'Belgique', flag: '🇧🇪' },
  { code: 'DE', label: 'Allemagne', flag: '🇩🇪' },
] as const;

// EU countries eligible for reverse charge
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

// Seller's country (Felten — Luxembourg)
const SELLER_COUNTRY = 'LU';
const SELLER_VAT_RATE = VAT_RATES[SELLER_COUNTRY] || 17;

export type CustomerVATStatus =
  | 'particulier'      // No VAT number - pays destination country VAT (OSS)
  | 'pro_local'        // Luxembourg professional - sees HT, pays TTC (17% LU)
  | 'pro_eu'           // EU professional (non-LU) - sees HT, pays HT (reverse charge)
  | 'pro_non_eu';      // Non-EU professional - export, no VAT

export interface VATInfo {
  status: CustomerVATStatus;
  vatNumber: string | null;
  countryCode: string | null;
  companyName: string | null;
  isValid: boolean;
  displayMode: 'HT' | 'TTC';
  applicableVATRate: number;
  reverseCharge: boolean;
  // Delivery country for particuliers (OSS regime)
  customerCountry: string;
}

interface VATContextType {
  vatInfo: VATInfo;
  setCustomerCountry: (code: string) => void;
  setVATFromValidation: (data: {
    valid: boolean;
    vatNumber: string;
    countryCode: string;
    companyName?: string;
  }) => void;
  clearVAT: () => void;
  toggleDisplayMode: () => void;
  formatPrice: (htAmount: number) => string;
  formatPriceWithLabel: (htAmount: number) => { price: string; label: string };
  getDisplayPrice: (htAmount: number) => number;
  getCheckoutPrice: (htAmount: number) => number;
}

function getVATRateForCountry(code: string): number {
  return VAT_RATES[code] ?? SELLER_VAT_RATE;
}

const defaultVATInfo: VATInfo = {
  status: 'particulier',
  vatNumber: null,
  countryCode: null,
  companyName: null,
  isValid: false,
  displayMode: 'TTC',
  applicableVATRate: SELLER_VAT_RATE,
  reverseCharge: false,
  customerCountry: 'LU',
};

const VATContext = createContext<VATContextType | undefined>(undefined);

const VAT_STORAGE_KEY = 'shopfelten_vat_info';
const DISPLAY_MODE_KEY = 'shopfelten_display_mode';
const COUNTRY_KEY = 'shopfelten_country';

export function VATProvider({ children }: { children: ReactNode }) {
  const [vatInfo, setVatInfo] = useState<VATInfo>(defaultVATInfo);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(VAT_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Ensure customerCountry exists (migration from old format)
        if (!parsed.customerCountry) parsed.customerCountry = 'LU';
        setVatInfo(parsed);
        return;
      } catch {
        // ignore
      }
    }

    // No stored VAT info — check individual preferences
    const savedMode = localStorage.getItem(DISPLAY_MODE_KEY);
    const savedCountry = localStorage.getItem(COUNTRY_KEY);

    // Priority: 1) manual choice (localStorage), 2) geo cookie from middleware, 3) fallback LU
    let country = 'LU';
    if (savedCountry && VAT_RATES[savedCountry]) {
      country = savedCountry;
    } else {
      const geoCookie = document.cookie.split('; ').find(c => c.startsWith('geo_country='));
      const geoCountry = geoCookie?.split('=')[1];
      if (geoCountry && VAT_RATES[geoCountry]) {
        country = geoCountry;
      }
    }

    setVatInfo(prev => ({
      ...prev,
      displayMode: savedMode === 'HT' || savedMode === 'TTC' ? savedMode : prev.displayMode,
      customerCountry: country,
      applicableVATRate: getVATRateForCountry(country),
    }));
  }, []);

  // Persist pro VAT info
  useEffect(() => {
    if (typeof window !== 'undefined' && vatInfo.vatNumber) {
      localStorage.setItem(VAT_STORAGE_KEY, JSON.stringify(vatInfo));
    }
  }, [vatInfo]);

  // Change delivery country (for particuliers — OSS)
  const setCustomerCountry = useCallback((code: string) => {
    const upper = code.toUpperCase();
    if (typeof window !== 'undefined') {
      localStorage.setItem(COUNTRY_KEY, upper);
    }
    setVatInfo(prev => {
      // Only affects particuliers — pros have their own rate logic
      if (prev.status !== 'particulier') {
        return { ...prev, customerCountry: upper };
      }
      return {
        ...prev,
        customerCountry: upper,
        applicableVATRate: getVATRateForCountry(upper),
      };
    });
  }, []);

  const setVATFromValidation = useCallback((data: {
    valid: boolean;
    vatNumber: string;
    countryCode: string;
    companyName?: string;
  }) => {
    if (!data.valid) {
      setVatInfo(prev => ({
        ...defaultVATInfo,
        vatNumber: data.vatNumber,
        isValid: false,
        customerCountry: prev.customerCountry,
        applicableVATRate: getVATRateForCountry(prev.customerCountry),
      }));
      return;
    }

    const countryCode = data.countryCode.toUpperCase();
    const isEU = EU_COUNTRIES.includes(countryCode);
    const isSameCountry = countryCode === SELLER_COUNTRY;

    let status: CustomerVATStatus;
    let displayMode: 'HT' | 'TTC';
    let applicableVATRate: number;
    let reverseCharge: boolean;

    if (isSameCountry) {
      // Luxembourg professional — 17% LU
      status = 'pro_local';
      displayMode = 'HT';
      applicableVATRate = SELLER_VAT_RATE;
      reverseCharge = false;
    } else if (isEU) {
      // EU professional (non-LU) — reverse charge
      status = 'pro_eu';
      displayMode = 'HT';
      applicableVATRate = 0;
      reverseCharge = true;
    } else {
      // Non-EU — export, no VAT
      status = 'pro_non_eu';
      displayMode = 'HT';
      applicableVATRate = 0;
      reverseCharge = false;
    }

    setVatInfo(prev => ({
      status,
      vatNumber: data.vatNumber,
      countryCode,
      companyName: data.companyName || null,
      isValid: true,
      displayMode,
      applicableVATRate,
      reverseCharge,
      customerCountry: prev.customerCountry,
    }));
  }, []);

  const toggleDisplayMode = useCallback(() => {
    setVatInfo(prev => {
      const newMode = prev.displayMode === 'TTC' ? 'HT' : 'TTC';
      if (typeof window !== 'undefined') {
        localStorage.setItem(DISPLAY_MODE_KEY, newMode);
      }
      return { ...prev, displayMode: newMode };
    });
  }, []);

  const clearVAT = useCallback(() => {
    setVatInfo(prev => ({
      ...defaultVATInfo,
      customerCountry: prev.customerCountry,
      applicableVATRate: getVATRateForCountry(prev.customerCountry),
    }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(VAT_STORAGE_KEY);
    }
  }, []);

  const calculateTTC = (htAmount: number, vatRate: number = vatInfo.applicableVATRate): number => {
    return htAmount * (1 + vatRate / 100);
  };

  const getDisplayPrice = (htAmount: number): number => {
    if (vatInfo.displayMode === 'HT') return htAmount;
    return calculateTTC(htAmount);
  };

  const getCheckoutPrice = (htAmount: number): number => {
    if (vatInfo.applicableVATRate === 0) return htAmount;
    return calculateTTC(htAmount, vatInfo.applicableVATRate);
  };

  const formatPrice = (htAmount: number): string => {
    return getDisplayPrice(htAmount).toFixed(2).replace('.', ',');
  };

  const formatPriceWithLabel = (htAmount: number): { price: string; label: string } => {
    const displayPrice = getDisplayPrice(htAmount);
    const formattedPrice = displayPrice.toFixed(2).replace('.', ',');

    let label: string;
    switch (vatInfo.status) {
      case 'pro_local':
        label = 'HT';
        break;
      case 'pro_eu':
        label = 'HT (Exonéré)';
        break;
      case 'pro_non_eu':
        label = 'HT (Export)';
        break;
      case 'particulier':
      default:
        label = 'TTC';
        break;
    }

    return { price: formattedPrice, label };
  };

  return (
    <VATContext.Provider
      value={{
        vatInfo,
        setCustomerCountry,
        setVATFromValidation,
        clearVAT,
        toggleDisplayMode,
        formatPrice,
        formatPriceWithLabel,
        getDisplayPrice,
        getCheckoutPrice,
      }}
    >
      {children}
    </VATContext.Provider>
  );
}

export function useVAT() {
  const context = useContext(VATContext);
  if (context === undefined) {
    throw new Error('useVAT must be used within a VATProvider');
  }
  return context;
}

export function useFormattedPrice(htAmount: number) {
  const { formatPriceWithLabel } = useVAT();
  return formatPriceWithLabel(htAmount);
}
