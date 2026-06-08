'use client';

import { useEffect } from 'react';
import { initializeSWG } from '@/lib/swgClient';

export function SWGInitializer() {
  useEffect(() => {
    const publicationId = process.env.NEXT_PUBLIC_GOOGLE_SWG_PUBLICATION_ID;
    
    if (!publicationId) {
      console.warn('⚠️ NEXT_PUBLIC_GOOGLE_SWG_PUBLICATION_ID not configured');
      return;
    }

    // Initialize SWG after script loads
    const checkAndInit = () => {
      if (window.SWG_BASIC) {
        initializeSWG(publicationId);
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    // Wait a bit for the script to load
    setTimeout(checkAndInit, 500);

  }, []);

  return null;
}
