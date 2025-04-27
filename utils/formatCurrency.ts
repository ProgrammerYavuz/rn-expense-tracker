export const formatCurrency = (
  value?: number | null,
  currency: 'TRY' | 'USD' | 'EUR' = 'TRY',
  fractionDigits: number = 2
): string => {
  if (value == null || isNaN(value)) {
    if (currency === 'TRY') return '0,00 ₺';
    if (currency === 'USD') return '$ 0.00';
    if (currency === 'EUR') return '0,00 €';
    return '0';
  }

  let formatted = value.toFixed(fractionDigits);

  if (currency === 'TRY') {
    formatted = formatted
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' ₺';
  } else if (currency === 'USD') {
    formatted = '$ ' + formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else if (currency === 'EUR') {
    formatted = formatted
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  return formatted;
};
