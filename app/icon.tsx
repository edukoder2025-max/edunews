import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generador de favicon dinámico (Solución de compatibilidad Windows + Vercel)
export default function Icon() {
  // Retornamos un contenedor completamente vacío sin texto interno.
  // Al no contener texto, Next.js y Satori evitan cargar el archivo de fuente local Noto Sans.
  // Esto previene al 100% el bug de rutas de Windows (ERR_INVALID_URL) en modo dev,
  // y a la vez retorna un objeto Response válido que permite compilar exitosamente en Vercel.
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0f172a',
          borderRadius: '8px',
        }}
      />
    ),
    {
      ...size,
    }
  );
}
