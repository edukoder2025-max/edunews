"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle } from 'lucide-react';
import { CryptoData } from '@/lib/crypto';

export default function CryptoWidget() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const response = await fetch('/api/crypto');
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        if (Array.isArray(data)) setCryptos(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getData();
    const interval = setInterval(getData, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  if (loading && cryptos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-6 h-12 bg-slate-950/40 border-y border-white/5">
        <Activity className="h-3 w-3 animate-pulse" />
        <span>Sincronizando mercado...</span>
      </div>
    );
  }

  if (!loading && cryptos.length === 0) {
    return (
      <div className="flex items-center gap-2 text-rose-500/50 text-[10px] font-bold uppercase tracking-widest px-6 h-12 bg-slate-950/40 border-y border-white/5">
        <AlertCircle className="h-3 w-3" />
        <span>Precios en vivo no disponibles</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-950/40 border-y border-white/5 backdrop-blur-sm relative overflow-hidden h-14 flex items-center">
      {/* Etiqueta Fija de Identidad */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center px-6 bg-slate-950/90 border-r border-white/5 backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">
            Cripto <span className="text-primary italic">Live</span>
          </span>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="flex items-center gap-12 px-4 animate-marquee hover:pause-marquee">
        {/* Triplicamos para asegurar que no haya cortes en la animación */}
        {[...cryptos, ...cryptos, ...cryptos].map((coin, index) => (
          <div 
            key={`${coin.id}-${index}`}
            className="flex items-center gap-3 min-w-[160px] group cursor-default"
          >
            <img src={coin.image} alt={coin.name} className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-500" />
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white uppercase tracking-tight">{coin.symbol}</span>
                <span className={`text-[9px] font-bold flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(coin.price_change_percentage_24h).toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-200">
                ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Mini Gráfico Dinámico */}
            <div className="h-6 w-12 ml-2 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
              <Sparkline 
                data={coin.sparkline_in_7d.price} 
                color={coin.price_change_percentage_24h >= 0 ? '#10b981' : '#fb7185'} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Sombra de desvanecimiento a la derecha */}
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 50s linear infinite;
          display: flex;
          white-space: nowrap;
          padding-left: 140px;
        }
        .pause-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function Sparkline({ data, color }: { data: number[], color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 40;
  
  // Normalizar puntos para el SVG
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="overflow-visible drop-shadow-[0_0_4px_rgba(0,0,0,0.5)]">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="opacity-80"
      />
    </svg>
  );
}