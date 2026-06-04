// Favicon dinámico vectorial SVG servido mediante Response nativo
// IMPORTANTE: Evita importar 'next/og' (Satori) para eludir el bug de rutas físicas de Windows en Next.js (TypeError: Invalid URL)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/svg+xml';

export default function Icon() {
  return new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff3838" />
          <stop offset="100%" stop-color="#ff9f43" />
        </linearGradient>
      </defs>
      <!-- Fondo redondeado con gradiente de marca El Irónico -->
      <rect x="0" y="0" width="32" height="32" rx="7" fill="url(#brandGrad)" />
      <!-- Isotipo: Esfera blanca minimalista central -->
      <circle cx="16" cy="16" r="5" fill="white" />
    </svg>`,
    {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    }
  );
}
