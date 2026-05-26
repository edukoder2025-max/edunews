import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Favicon dinámico abstracto con formas puras CSS
// IMPORTANTE: Evita colocar texto interno para prevenir el bug de fuentes de Windows en Next.js (TypeError: Invalid URL)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #ff3838 0%, #ff9f43 100%)',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Esfera blanca flotante estilizada en CSS puro para simular un isotipo de noticia */}
        <div
          style={{
            width: '10px',
            height: '10px',
            background: 'white',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
