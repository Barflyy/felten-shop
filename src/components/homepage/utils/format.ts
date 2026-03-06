export function formatPrice(amount: string): string {
  return parseFloat(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
