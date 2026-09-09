export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

export async function fetchLiveCryptoData(): Promise<CryptoData[]> {
  try {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin&order=market_cap_desc&sparkline=true&price_change_percentage=24h';
    const res = await fetch(url, { 
      next: { revalidate: 120 },
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'El Irónico/1.0'
      }
    });
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('[CryptoAPI] Error:', error);
    return [];
  }
}