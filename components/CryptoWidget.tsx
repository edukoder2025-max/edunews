"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Zap } from 'lucide-react';
import { CryptoData } from '@/lib/crypto';

export default function CryptoWidget() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch('/api/crypto', { cache: 'no-store' });
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (Array.isArray(data)) setCryptos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(getData, 100); // Carga inicial rápida
    const interval = setInterval(getData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && cryptos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-6 h-10 bg-black border-y border-white/5">
        <Activity className="h-3 w-3 animate-pulse" />
        <span>Sincronizando mercado...</span>
      </div>
    );
  }

  if (!loading && cryptos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-rose-500/50 text-[10px] font-bold uppercase tracking-widest px-6 h-10 bg-black border-y border-white/5">
        <AlertCircle className="h-3 w-3" />
        <span>Precios en vivo no disponibles</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-black border-y border-white/10 relative overflow-hidden h-12 flex items-center group">
      {/* Badge de Estado - Estética de Terminal */}
      <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center px-4 bg-black border-r border-white/10 shadow-[10px_0_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </div>
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] hidden sm:block">
            Market <span className="text-emerald-400">Live</span>
          </span>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap will-change-transform">
        {[...cryptos, ...cryptos, ...cryptos].map((coin, index) => (
          <div 
            key={`${coin.id}-${index}`}
            className="flex items-center gap-4 px-4 py-1 border-r border-white/5 hover:bg-white/[0.02] transition-colors cursor-default group/item"
          >
            <div className="relative w-4 h-4">
              <Image
                src={coin.image}
                alt={coin.name}
                width={20}
                height={20}
                className="w-4 h-4 grayscale group-hover/item:grayscale-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-emerald-400/20 blur-sm opacity-0 group-hover/item:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-black text-slate-400 group-hover/item:text-white transition-colors uppercase italic tracking-tighter">{coin.symbol}</span>
              <span className="text-xs font-mono font-bold text-white tracking-tight">
                ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: coin.current_price < 1 ? 4 : 2 })}
              </span>
              <span className={`text-[9px] font-black flex items-center gap-0.5 ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={8} strokeWidth={3} /> : <TrendingDown size={8} strokeWidth={3} />}
              </span>
            </div>

            <div className="h-4 w-10 opacity-30 group-hover/item:opacity-100 transition-opacity">
              <Sparkline 
                data={coin.sparkline_in_7d.price} 
                color={coin.price_change_percentage_24h >= 0 ? '#34d399' : '#f87171'} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Overlay de Degradado para profundidad */}
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />
      
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          padding-left: 120px;
        }
      `}</style>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1; // Evitar división por cero
  const width = 60;
  const height = 20;
  
  const points = data.map((val, i) => `${(i / (data.length - 1)) * width},${height - ((val - min) / range) * height}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
}