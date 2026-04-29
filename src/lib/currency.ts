export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // relative to USD
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 154.5 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
];

export function convertFromUSD(amount: number, currency: Currency): number {
  return amount * currency.rate;
}

export function formatCurrency(amount: number, currency: Currency): string {
  if (!isFinite(amount)) return '∞';
  const converted = convertFromUSD(amount, currency);
  const rounded = Math.round(converted);
  if (currency.code === 'INR') {
    // Indian numbering system: 12,50,000
    const abs = Math.abs(rounded);
    const sign = rounded < 0 ? '-' : '';
    const str = abs.toString();
    if (str.length <= 3) return `${sign}${currency.symbol}${str}`;
    const last3 = str.slice(-3);
    const rest = str.slice(0, -3);
    const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
    return `${sign}${currency.symbol}${formatted}`;
  }
  return `${currency.symbol}${rounded.toLocaleString()}`;
}
