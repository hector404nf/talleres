export interface CurrencyConfig {
  symbol: string;
  code: string;
  decimals: number;
  thousandSeparator: string;
  decimalSeparator: string;
  prefix: boolean;
}

export const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  ARS: { symbol: '$', code: 'ARS', decimals: 2, thousandSeparator: '.', decimalSeparator: ',', prefix: true },
  USD: { symbol: '$', code: 'USD', decimals: 2, thousandSeparator: ',', decimalSeparator: '.', prefix: true },
  EUR: { symbol: '€', code: 'EUR', decimals: 2, thousandSeparator: '.', decimalSeparator: ',', prefix: false },
  PYG: { symbol: 'Gs.', code: 'PYG', decimals: 0, thousandSeparator: '.', decimalSeparator: ',', prefix: true },
};

export function getCurrencyConfig(code?: string): CurrencyConfig {
  return CURRENCY_MAP[code || 'ARS'] || CURRENCY_MAP['ARS'];
}

export function formatPrice(value: number | string, currencyCode?: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  const config = getCurrencyConfig(currencyCode);
  const { symbol, decimals, thousandSeparator, decimalSeparator, prefix } = config;

  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  if (decimals > 0) {
    parts[1] = parts[1] || '0'.repeat(decimals);
  }

  const formatted = parts.join(decimalSeparator);
  return prefix ? `${symbol}${formatted}` : `${formatted}${symbol}`;
}

export function getConfig(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('configuracion') || '{}');
  } catch {
    return {};
  }
}

export function formatPriceConfig(value: number | string): string {
  const config = getConfig();
  return formatPrice(value, config.moneda);
}
