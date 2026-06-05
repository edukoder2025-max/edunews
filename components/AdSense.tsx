// components/AdSense.tsx
'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical' | 'link';
  responsive?: boolean;
  className?: string;
}

export default function AdSense({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = ''
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        // Esperamos un momento a que el DOM se asiente
        const timer = setTimeout(() => {
          const insElements = document.querySelectorAll(`ins.adsbygoogle[data-ad-slot="${slot}"]`);
          insElements.forEach((el) => {
            // Si el elemento ins no tiene el atributo data-adsbygoogle-status, hacemos push
            if (!el.getAttribute('data-adsbygoogle-status')) {
              adsbygoogle.push({});
            }
          });
        }, 150);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.log('AdSense error:', err);
    }
  }, [slot]);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: responsive ? 'block' : 'inline-block',
          textAlign: 'center',
        }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
