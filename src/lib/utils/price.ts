/**
 * Format price for display (HTVA / HT)
 * @param amount - Price amount (string or number) from Shopify
 * @returns Formatted price string with € symbol
 */
export function formatPrice(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(price)) return '0,00 €';

  return `${price.toFixed(2).replace('.', ',')} €`;
}

/**
 * Format price with HT label
 * @param amount - Price amount from Shopify
 * @returns Formatted price string with HT label
 */
export function formatPriceHT(amount: string | number): string {
  const price = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(price)) return '0,00 € HT';

  return `${price.toFixed(2).replace('.', ',')} € HT`;
}
