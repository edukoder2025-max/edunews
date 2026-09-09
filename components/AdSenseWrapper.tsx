'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface AdSenseWrapperProps {
  children?: React.ReactNode;
  showAds?: boolean;
  clientId?: string;
}

/**
 * Componente que maneja la visualización de AdSense
 * FASE 1: Oculta ads si el usuario tiene suscripción
 * 
 * Uso:
 * <AdSenseWrapper showAds={userShowAds} clientId={ADSENSE_ID}>
 *   {children}
 * </AdSenseWrapper>
 */
export function AdSenseWrapper({ children, showAds = true, clientId }: AdSenseWrapperProps) {
  const [isVisible, setIsVisible] = useState(showAds);

  useEffect(() => {
    setIsVisible(showAds);
  }, [showAds]);

  // Si no debe mostrar ads, solo renderizar children sin script
  if (!isVisible || !clientId) {
    return <>{children}</>;
  }

  return (
    <>
      <Script
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      {children}
    </>
  );
}

/**
 * Componente para mostrar/ocultar banners de anuncios específicos
 * FASE 1: Oculta banners cuando usuario está suscrito
 */
export function AdBlock({ 
  children, 
  showAds = true,
  className = 'my-6 p-4 bg-slate-950/50 rounded-lg border border-white/5'
}: { 
  children: React.ReactNode; 
  showAds?: boolean;
  className?: string;
}) {
  if (!showAds) {
    return null; // No renderizar nada si es suscriptor
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}
