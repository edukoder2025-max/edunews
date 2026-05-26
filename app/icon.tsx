import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generador de favicon dinámico con la marca estilizada de EduNews
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
          color: 'white',
          fontFamily: 'serif',
          fontWeight: '900',
          fontSize: '18px',
          lineHeight: '1',
        }}
      >
        E
      </div>
    ),
    {
      ...size,
    }
  );
}
