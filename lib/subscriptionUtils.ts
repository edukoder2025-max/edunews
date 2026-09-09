import { supabase } from './supabase';

export type Plan = 
  | 'mensual-basico'
  | 'mensual-plus'
  | 'mensual-pro'
  | 'lifetime-5000'
  | 'lifetime-10000'
  | 'lifetime-15000';

/**
 * FASE 1 - Beneficios REALES implementados:
 * 1. newsletter_exclusiva - Envío automático según plan
 * 2. acceso_completo - Bloquear artículos con <PremiumGate>
 * 3. sin_anuncios - Ocultar AdSense
 */
export type Benefit = 
  | 'newsletter_basica'      // Plan Básico
  | 'newsletter_plus'        // Plan Plus
  | 'newsletter_pro'         // Plan Pro
  | 'acceso_completo'        // Acceso a todos los artículos
  | 'sin_anuncios'           // Sin publicidades AdSense
  | 'lifetime_access';       // Acceso de por vida

/**
 * MAPEO DE PLANES Y BENEFICIOS - FASE 1
 * 
 * Estructura:
 * - Básico (ARS 2.000/mes): newsletter + sin anuncios
 * - Plus (ARS 8.000/mes): newsletter + acceso completo + sin anuncios
 * - Pro (ARS 12.000/mes): newsletter + acceso completo + sin anuncios
 * - Lifetime (varios): todos los beneficios
 */
export const PLAN_BENEFITS: Record<Plan, Benefit[]> = {
  // PLANES MENSUALES
  'mensual-basico': ['newsletter_basica', 'sin_anuncios'],
  'mensual-plus': ['newsletter_plus', 'acceso_completo', 'sin_anuncios'],
  'mensual-pro': ['newsletter_pro', 'acceso_completo', 'sin_anuncios'],
  
  // PLANES LIFETIME
  'lifetime-5000': ['newsletter_basica', 'sin_anuncios', 'lifetime_access'],
  'lifetime-10000': ['newsletter_plus', 'acceso_completo', 'sin_anuncios', 'lifetime_access'],
  'lifetime-15000': ['newsletter_pro', 'acceso_completo', 'sin_anuncios', 'lifetime_access'],
};

/**
 * Mapeo de newsletters por plan
 * Indica cuál newsletter de Brevo enviar según el plan
 */
export const PLAN_NEWSLETTERS: Record<Plan, string> = {
  'mensual-basico': 'newsletter_basica',
  'mensual-plus': 'newsletter_plus',
  'mensual-pro': 'newsletter_pro',
  'lifetime-5000': 'newsletter_basica',
  'lifetime-10000': 'newsletter_plus',
  'lifetime-15000': 'newsletter_pro',
};

/**
 * Obtiene el plan activo de un usuario
 */
export async function getUserPlan(email: string): Promise<Plan | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('email', email)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data.plan as Plan;
  } catch (err) {
    console.warn('Error getting user plan:', err);
    return null;
  }
}

/**
 * Verifica si un usuario tiene un beneficio específico
 */
export async function userHasBenefit(email: string, benefit: Benefit): Promise<boolean> {
  try {
    const plan = await getUserPlan(email);
    if (!plan) return false;
    
    const benefits = PLAN_BENEFITS[plan] || [];
    return benefits.includes(benefit);
  } catch (err) {
    console.warn('Error checking benefit:', err);
    return false;
  }
}

/**
 * Verifica si un usuario tiene acceso a contenido premium
 */
export async function hasFullAccess(email: string): Promise<boolean> {
  const plan = await getUserPlan(email);
  if (!plan) return false;

  // Full access plans
  const fullAccessPlans: Plan[] = ['mensual-pro', 'lifetime-15000', 'lifetime-10000'];
  return fullAccessPlans.includes(plan);
}

/**
 * Obtiene todos los beneficios de un usuario
 */
export async function getUserBenefits(email: string): Promise<Benefit[]> {
  const plan = await getUserPlan(email);
  if (!plan) return [];
  return PLAN_BENEFITS[plan] || [];
}

/**
 * Verifica si una suscripción está activa (no expirada)
 */
export async function isSubscriptionActive(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('email', email)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .limit(1);

    if (error) {
      console.warn('Error checking subscription:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.warn('Error checking subscription:', err);
    return false;
  }
}

/**
 * Obtiene información completa de la suscripción de un usuario
 */
export async function getSubscriptionDetails(email: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Error getting subscription details:', err);
    return null;
  }
}

/**
 * Obtiene todas las suscripciones expiradas
 */
export async function getExpiredSubscriptions(days = 0) {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .lt('expires_at', expiryDate.toISOString())
      .gt('expires_at', new Date().toISOString());

    if (error) {
      console.warn('Error getting expired subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('Error getting expired subscriptions:', err);
    return [];
  }
}
