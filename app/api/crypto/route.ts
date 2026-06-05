import { NextResponse } from 'next/server';
import { fetchLiveCryptoData } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await fetchLiveCryptoData();
    if (!data || data.length === 0) {
      // Fallback estático en caso de límites de tarifa (rate-limits) o caídas/timeouts de CoinGecko
      const fallbackData = [
        { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 94820, price_change_percentage_24h: 1.45, sparkline_in_7d: { price: [93000, 93500, 94000, 93800, 94200, 94820] } },
        { id: "ethereum", symbol: "eth", name: "Ethereum", current_price: 3340, price_change_percentage_24h: -0.82, sparkline_in_7d: { price: [3400, 3380, 3350, 3360, 3320, 3340] } },
        { id: "solana", symbol: "sol", name: "Solana", current_price: 168.5, price_change_percentage_24h: 3.12, sparkline_in_7d: { price: [160, 162, 165, 163, 166, 168.5] } },
        { id: "binancecoin", symbol: "bnb", name: "BNB", current_price: 585.2, price_change_percentage_24h: 0.15, sparkline_in_7d: { price: [580, 582, 581, 584, 583, 585.2] } }
      ];
      return NextResponse.json(fallbackData);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/crypto route:', error);
    // Fallback secundario de contingencia
    const fallbackData = [
      { id: "bitcoin", symbol: "btc", name: "Bitcoin", current_price: 94800, price_change_percentage_24h: 0, sparkline_in_7d: { price: [94800, 94800] } }
    ];
    return NextResponse.json(fallbackData);
  }
}
