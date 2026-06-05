import crypto from 'crypto';

/**
 * Valida la firma HMAC de un webhook si está configurada una clave secreta.
 * Soporta dos enfoques:
 * 1. Header personalizado `x-rrm-secret` con coincidencia simple.
 * 2. Firma HMAC en `x-rrm-signature` (método estándar).
 */
export function validateWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  // Si la signature está en formato "sha256=..." (estándar HMAC)
  if (signature.startsWith('sha256=')) {
    const [algo, hash] = signature.split('=');
    const expectedHash = crypto
      .createHmac(algo, secret)
      .update(body)
      .digest('hex');
    return hash === expectedHash;
  }

  // Fallback: simple string comparison (menos seguro, pero simple para testing)
  return signature === secret;
}

/**
 * Genera una firma HMAC para un webhook (útil para testing o si querés firmar requests que envías).
 */
export function generateWebhookSignature(body: string, secret: string): string {
  const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${hash}`;
}
