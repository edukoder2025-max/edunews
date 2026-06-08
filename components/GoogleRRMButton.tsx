'use client';

/**
 * Botón OFICIAL de Google Reader Revenue Manager (SWG Basic).
 *
 * El SDK swg-basic.js detecta automáticamente cualquier <button>
 * con el atributo `swg-standard-button="subscription"` o `"contribution"`
 * y lo convierte en el botón oficial de Google.
 *
 * Documentación: https://developers.google.com/news/subscribe
 */

interface GoogleRRMButtonProps {
  /**
   * Tipo de flujo a abrir:
   *  - "subscription"  → flujo de suscripción con planes
   *  - "contribution"  → flujo de contribución única
   */
  type?: 'subscription' | 'contribution';
  /** Texto de fallback mientras el SDK no ha estilizado el botón */
  label?: string;
  className?: string;
}

export default function GoogleRRMButton({
  type = 'subscription',
  label = type === 'subscription' ? 'Suscribirse con Google' : 'Contribuir con Google',
  className = '',
}: GoogleRRMButtonProps) {
  return (
    // El atributo swg-standard-button hace que el SDK lo detecte y lo estilice
    // automáticamente. No se necesita JS adicional.
    <button
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...({ 'swg-standard-button': type } as any)}
      type="button"
      className={`google-rrm-btn ${className}`}
      aria-label={label}
    >
      {/*
        Este texto es visible solo si el SDK no cargó o no encontró el botón.
        En cuanto swg-basic.js inicializa, reemplaza este contenido con su UI nativa.
      */}
      <span className="rrm-btn-fallback">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
        {label}
      </span>
    </button>
  );
}
