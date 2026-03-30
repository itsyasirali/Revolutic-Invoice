import { useEffect, useState } from "react";

export const usePKRCurrency = () => {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/PKR"
        );
        const data = await res.json();

        const rates: Record<string, number> = {};
        Object.keys(data.rates).forEach((cur) => {
          rates[cur] = 1 / data.rates[cur];
        });

        rates.PKR = 1;
        setExchangeRates(rates);
      } catch {
        setExchangeRates({
          PKR: 1,
          USD: 278,
          EUR: 305,
          GBP: 355,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertToPKR = (amount: number, currency?: string) => {
    const cur = currency?.toUpperCase() || "PKR";
    return amount * (exchangeRates[cur] || 1);
  };

  return {
    exchangeRates,
    convertToPKR,
    loading,
  };
};
