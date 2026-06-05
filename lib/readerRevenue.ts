import { supabase } from './supabase';
import { subscribeContact, sendTestEmail } from './brevo';

type ProductMapEntry = {
  slug: string;
  name: string;
  price: string;
  billing: 'monthly' | 'one_time';
  description: string;
};

/**
 * MAPEO DE PRODUCTOS - FASE 1
 * Cada producto de Google SWG se mapea a un plan interno
 * con beneficios reales: Newsletter + Acceso + Sin anuncios
 */
export const PRODUCT_MAP: Record<string, ProductMapEntry> = {
  // PLANES MENSUALES
  'SWGPD.5733-3925-7955-85083': {
    slug: 'mensual-basico',
    name: 'Plan Mensual - Básico',
    price: 'ARS 2.000',
    billing: 'monthly',
    description: 'Newsletter semanal + Sin anuncios',
  },
  'SWGPD.8127-6310-7908-87558': {
    slug: 'mensual-plus',
    name: 'Plan Mensual - Plus',
    price: 'ARS 8.000',
    billing: 'monthly',
    description: 'Newsletter + Acceso completo + Sin anuncios',
  },
  'SWGPD.6475-3335-7339-51942': {
    slug: 'mensual-pro',
    name: 'Plan Mensual - Pro',
    price: 'ARS 12.000',
    billing: 'monthly',
    description: 'Newsletter premium + Acceso completo + Sin anuncios',
  },
  
  // PLANES LIFETIME
  'SWGPD.3524-7125-9967-63960': {
    slug: 'lifetime-5000',
    name: 'Pago Único - Lifetime',
    price: 'ARS 5.000',
    billing: 'one_time',
    description: 'Acceso de por vida + Newsletter semanal + Sin anuncios',
  },
  'SWGPD.4052-8733-6638-17843': {
    slug: 'lifetime-10000',
    name: 'Pago Único - Lifetime',
    price: 'ARS 10.000',
    billing: 'one_time',
    description: 'Acceso de por vida + Newsletter premium + Sin anuncios',
  },
  'SWGPD.6766-5588-5806-80332': {
    slug: 'lifetime-15000',
    name: 'Pago Único - Lifetime',
    price: 'ARS 15.000',
    billing: 'one_time',
    description: 'Acceso de por vida + Newsletter pro + Sin anuncios',
  },
};

export async function applyBenefitsForPurchase(productId: string, email: string, name?: string) {
  const plan = PRODUCT_MAP[productId];
  if (!plan) {
    console.warn('Unknown productId in purchase webhook:', productId);
    return { success: false, error: 'Unknown product' };
  }

  try {
    // Importar newsletter manager dentro de la función para evitar circular imports
    const { subscribeToNewsletterByPlan, getNewsletterName, getNewsletterFrequency } = await import('./newsletterManager');

    // 1) Suscribir a newsletter en Brevo según el plan
    const newsletterResult = await subscribeToNewsletterByPlan(email, plan.slug as any, name);
    if (!newsletterResult.success) {
      console.warn('Newsletter subscription failed:', newsletterResult.message);
      // No bloquear si falla newsletter, continuar con otros beneficios
    }

    // 2) Persist subscription in Supabase (best-effort)
    try {
      const now = new Date().toISOString();
      const expiresAt = plan.billing === 'monthly' ? null : new Date().toISOString();
      await supabase.from('subscriptions').upsert([
        {
          email,
          plan: plan.slug,
          product_id: productId,
          started_at: now,
          expires_at: expiresAt,
          metadata: {
            newsletter: newsletterResult.newsletter || 'none',
            description: plan.description,
          },
        },
      ], { onConflict: ['email', 'product_id'] });
    } catch (dbErr) {
      console.warn('Could not persist subscription to Supabase:', dbErr);
      // No bloquear si falla base de datos
    }

    // 3) Send welcome email with plan details
    try {
      const newsletterName = getNewsletterName(plan.slug as any);
      const frequency = getNewsletterFrequency(plan.slug as any);
      
      const subject = `✨ ¡Bienvenido a ${plan.name}! - El Irónico`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #c85230;">¡Gracias por tu compra!</h1>
          <p>Hola ${name || 'usuario'},</p>
          
          <p>Tu suscripción a <strong>${plan.name}</strong> está activa. Aquí están tus beneficios:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🎁 Beneficios incluidos:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>📰 ${newsletterName} - ${frequency}</li>
              <li>📰 Sin publicidades (disfruta sin interrupciones)</li>
              <li>📚 Acceso completo a todos los artículos</li>
            </ul>
          </div>
          
          <p><strong>Plan:</strong> ${plan.name}</p>
          <p><strong>Precio:</strong> ${plan.price}</p>
          <p><strong>Descripción:</strong> ${plan.description}</p>
          
          <p>Si tienes preguntas o necesitas ayuda, no dudes en <a href="https://elironico.com/contacto">contactarnos</a>.</p>
          
          <p>¡Gracias por apoyar el periodismo independiente! 🙏</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #999;">
            © 2026 El Irónico | Noticias neutrales, periodismo con IA
          </p>
        </div>
      `;
      
      await sendTestEmail(email, subject, html);
    } catch (mailErr) {
      console.warn('Failed to send welcome email:', mailErr);
      // No bloquear si falla email
    }

    return { 
      success: true,
      newsletter: newsletterResult.newsletter,
      plan: plan.slug,
    };
  } catch (err: any) {
    console.error('Error applying benefits for purchase:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
