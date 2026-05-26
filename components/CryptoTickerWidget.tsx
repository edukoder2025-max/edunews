'use client';

import { useEffect, useRef } from 'react';

/**
 * Widget de ticker de criptomonedas en tiempo real usando TradingView (gratuito).
 * No requiere API key ni backend — se renderiza 100% client-side via iframe embed.
 */
export default function CryptoTickerWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Evitar duplicar el script si ya se montó
    if (containerRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT", title: "Bitcoin" },
        { proName: "BINANCE:ETHUSDT", title: "Ethereum" },
        { proName: "BINANCE:SOLUSDT", title: "Solana" },
        { proName: "BINANCE:BNBUSDT", title: "BNB" },
        { proName: "BINANCE:XRPUSDT", title: "XRP" },
        { proName: "BINANCE:ADAUSDT", title: "Cardano" },
        { proName: "BINANCE:DOGEUSDT", title: "Doge" },
        { proName: "BINANCE:AVAXUSDT", title: "Avalanche" },
        { proName: "BINANCE:DOTUSDT", title: "Polkadot" },
        { proName: "BINANCE:MATICUSDT", title: "Polygon" }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "es"
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="w-full border-y border-white/5 bg-slate-950/60 relative overflow-hidden">
      {/* Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-4 pr-6 bg-gradient-to-r from-slate-950 via-slate-950/95 to-transparent">
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </span>
          Cripto Live
        </span>
      </div>

      {/* TradingView Widget Container */}
      <div className="tradingview-widget-container" ref={containerRef}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}
