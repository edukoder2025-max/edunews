'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Benefit } from '@/lib/subscriptionUtils';

interface PremiumGateProps {
  requiredBenefit: Benefit;
  userEmail?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Premium content gate component
 * Blocks access to content requiring specific subscription benefits
 */
export function PremiumGate({
  requiredBenefit,
  userEmail,
  children,
  fallback,
}: PremiumGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (!userEmail) {
        setHasAccess(false);
        return;
      }

      try {
        const response = await fetch('/api/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            requiredBenefit,
          }),
        });

        const data = await response.json();
        setHasAccess(data.hasAccess || false);
      } catch (err) {
        console.error('Error checking subscription:', err);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [userEmail, requiredBenefit]);

  if (hasAccess === null) {
    return <div className="p-4 bg-gray-100 rounded">Verificando acceso...</div>;
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="text-lg font-semibold text-yellow-800">Contenido Exclusivo</h3>
          <p className="text-yellow-700 mt-2">
            Este contenido solo está disponible para suscriptores. ¡Suscribite hoy!
          </p>
          <button
            onClick={() => router.push('/suscribite')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Ver Planes
          </button>
        </div>
      )
    );
  }

  return <>{children}</>;
}
