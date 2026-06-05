import { PLAN_NEWSLETTERS } from './subscriptionUtils';
import type { Plan } from './subscriptionUtils';

/**
 * Newsletter Manager - FASE 1
 * Gestiona la suscripción automática a newsletters según el plan
 * 
 * NEWSLETTERS DISPONIBLES EN BREVO:
 * - newsletter_basica: Semanal, resumen de noticias
 * - newsletter_plus: Semanal + análisis especial
 * - newsletter_pro: Semanal + análisis + exclusivos
 */

interface NewsletterConfig {
  listId: number; // ID de la lista en Brevo
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

/**
 * Mapeo de newsletters con sus IDs en Brevo
 * NOTA: Estos IDs deben ser reemplazados con los IDs reales de tu cuenta Brevo
 */
export const NEWSLETTER_CONFIG: Record<string, NewsletterConfig> = {
  newsletter_basica: {
    listId: 0, // TODO: Reemplazar con ID real de Brevo
    name: 'Newsletter Básica',
    frequency: 'weekly',
  },
  newsletter_plus: {
    listId: 0, // TODO: Reemplazar con ID real de Brevo
    name: 'Newsletter Plus',
    frequency: 'weekly',
  },
  newsletter_pro: {
    listId: 0, // TODO: Reemplazar con ID real de Brevo
    name: 'Newsletter Pro',
    frequency: 'weekly',
  },
};

/**
 * Suscribe un usuario a la newsletter correspondiente a su plan
 * @param email - Email del usuario
 * @param plan - Plan de suscripción
 * @param name - Nombre del usuario (opcional)
 */
export async function subscribeToNewsletterByPlan(
  email: string,
  plan: Plan,
  name?: string
): Promise<{ success: boolean; newsletter: string; message: string }> {
  try {
    // Obtener newsletter del plan
    const newsletterKey = PLAN_NEWSLETTERS[plan];
    if (!newsletterKey) {
      return {
        success: false,
        newsletter: '',
        message: `Plan no reconocido: ${plan}`,
      };
    }

    const config = NEWSLETTER_CONFIG[newsletterKey];
    if (!config || !config.listId) {
      return {
        success: false,
        newsletter: newsletterKey,
        message: `Newsletter no configurada en Brevo: ${newsletterKey}. Contacta al administrador.`,
      };
    }

    // Llamar a Brevo para suscribir
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name?.split(' ')[0] || 'Usuario',
          LASTNAME: name?.split(' ').slice(1).join(' ') || '',
          PLAN: plan,
        },
        listIds: [config.listId], // Agregar a esta lista
        updateEnabled: true, // Actualizar si ya existe
      }),
    });

    if (!brevoResponse.ok) {
      const error = await brevoResponse.json();
      console.error('Brevo subscription error:', error);
      return {
        success: false,
        newsletter: newsletterKey,
        message: `Error al suscribir a ${config.name}`,
      };
    }

    console.log(`✅ Usuario ${email} suscrito a ${config.name} (Plan: ${plan})`);

    return {
      success: true,
      newsletter: newsletterKey,
      message: `Suscrito exitosamente a ${config.name}`,
    };
  } catch (err: any) {
    console.error('Newsletter subscription error:', err);
    return {
      success: false,
      newsletter: '',
      message: `Error al procesar suscripción: ${err.message}`,
    };
  }
}

/**
 * Obtiene el nombre de la newsletter para un plan
 */
export function getNewsletterName(plan: Plan): string {
  const newsletterKey = PLAN_NEWSLETTERS[plan];
  if (!newsletterKey) return 'Newsletter';
  
  const config = NEWSLETTER_CONFIG[newsletterKey];
  return config?.name || 'Newsletter';
}

/**
 * Obtiene la frecuencia de envío de la newsletter
 */
export function getNewsletterFrequency(plan: Plan): string {
  const newsletterKey = PLAN_NEWSLETTERS[plan];
  if (!newsletterKey) return 'semanal';
  
  const config = NEWSLETTER_CONFIG[newsletterKey];
  const freqMap = {
    daily: 'diaria',
    weekly: 'semanal',
    monthly: 'mensual',
  };
  return freqMap[config?.frequency || 'weekly'];
}
