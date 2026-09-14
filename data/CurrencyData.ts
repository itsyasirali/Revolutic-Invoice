import { UNIQUE_CURRENCIES } from "./countries";

export interface CurrencyItem {
  code: string;
  name: string;
  symbol?: string;
}

const currenciesData: CurrencyItem[] = UNIQUE_CURRENCIES.map((c) => ({
  code: c.code,
  name: c.name,
  symbol: c.symbol,
}));

export default currenciesData;
