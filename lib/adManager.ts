import { supabase } from './supabase';
import type { Benefit } from './subscriptionUtils';

/**
 * Ad Manager - FASE 1
 * Determina si se deben mostrar ads según el estado de suscripción del usuario
 * 
 * LÓGICA:
 * - Usuario NO suscrito → Mostrar ads (AdSense)
 * - Usuario suscrito con 'sin_anuncios' → Ocultar ads
 */

/**
 * Verifica si un usuario debe ver publicidades
 * @param email - Email del usuario (opcional, si no está logueado)
 * @returns true si debe mostrar ads, false si debe ocultarlas
 */
export async function shouldShowAds(email?: string): Promise<boolean> {
  // Sin email = usuario no logueado = mostrar ads
  if (!email) {
    return true;
  }

  try {
    // Buscar suscripción activa
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('email', email)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1)
      .single();

    if (error || !data) {
      // Sin suscripción = mostrar ads
      return true;
    }

    // Verificar si el plan incluye "sin_anuncios"
    const plan = data.plan as string;
    const hasNoAdsFeature = doesPlanExcludeAds(plan);

    return !hasNoAdsFeature; // Si tiene sin_anuncios, return false
  } catch (err) {
    console.warn('Error checking ad visibility:', err);
    // En caso de error, mostrar ads (seguridad)
    return true;
  }
}

/**
 * Verifica si un plan específico excluye anuncios
 */
function doesPlanExcludeAds(plan: string): boolean {
  // FASE 1: Todos los planes pagos (básico, plus, pro, lifetime) excluyen anuncios
  const noAdPlans = [
    'mensual-basico',
    'mensual-plus',
    'mensual-pro',
    'lifetime-5000',
    'lifetime-10000',
    'lifetime-15000',
  ];
  
  return noAdPlans.includes(plan);
}

/**
 * Obtiene el estado de ads para mostrar en cliente
 * Útil para pre-calcular antes de renderizar en server
 */
export async function getAdVisibilityByEmail(
  email?: string
): Promise<{ showAds: boolean; reason: string }> {
  if (!email) {
    return { showAds: true, reason: 'Usuario no autenticado' };
  }

  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('email', email)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1)
      .single();

    if (!data) {
      return { showAds: true, reason: 'Sin suscripción activa' };
    }

    const plan = data.plan as string;
    const hasNoAds = doesPlanExcludeAds(plan);

    if (hasNoAds) {
      return {
        showAds: false,
        reason: `Plan ${plan} incluye sin_anuncios`,
      };
    }

    return { showAds: true, reason: 'Plan no excluye anuncios' };
  } catch (err) {
    console.warn('Error getting ad visibility:', err);
    return { showAds: true, reason: 'Error al verificar (mostrar ads por defecto)' };
  }
}
