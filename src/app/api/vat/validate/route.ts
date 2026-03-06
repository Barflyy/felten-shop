import { NextResponse } from 'next/server';

interface VATResponse {
  valid: boolean;
  vat_number: string;
  country_code: string;
  company_name?: string;
  company_address?: string;
  error?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vatNumber = searchParams.get('vat_number');

  if (!vatNumber) {
    return NextResponse.json(
      { valid: false, error: 'Numéro de TVA requis' },
      { status: 400 }
    );
  }

  // Clean the VAT number: remove spaces, dots, dashes
  const cleanedVAT = vatNumber.replace(/[\s.\-]/g, '').toUpperCase();

  if (cleanedVAT.length < 4) {
    return NextResponse.json(
      { valid: false, error: 'Numéro de TVA trop court' },
      { status: 400 }
    );
  }

  try {
    // Call the free VIES validation API
    const response = await fetch(
      `https://api.vatcomply.com/vat?vat_number=${encodeURIComponent(cleanedVAT)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    return NextResponse.json({
      valid: data.valid === true,
      vat_number: cleanedVAT,
      country_code: data.country_code || cleanedVAT.substring(0, 2),
      company_name: data.name || null,
      company_address: data.address || null,
    });
  } catch (error) {
    console.error('VAT validation error:', error);

    // Fallback: basic format validation
    const countryCode = cleanedVAT.substring(0, 2);
    const vatPatterns: Record<string, RegExp> = {
      FR: /^FR[A-Z0-9]{2}\d{9}$/,
      DE: /^DE\d{9}$/,
      BE: /^BE0?\d{9,10}$/,
      IT: /^IT\d{11}$/,
      ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
      NL: /^NL\d{9}B\d{2}$/,
      LU: /^LU\d{8}$/,
      AT: /^ATU\d{8}$/,
      PT: /^PT\d{9}$/,
    };

    const pattern = vatPatterns[countryCode];
    const isFormatValid = pattern ? pattern.test(cleanedVAT) : cleanedVAT.length >= 8;

    return NextResponse.json({
      valid: isFormatValid,
      vat_number: cleanedVAT,
      country_code: countryCode,
      company_name: null,
      company_address: null,
      warning: 'Validation VIES indisponible, format vérifié uniquement',
    });
  }
}
